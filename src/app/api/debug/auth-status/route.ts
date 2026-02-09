
import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "setup-admin-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    step: "init",
    userExists: false,
    accountExists: false,
    actionsTaken: [],
    errors: [] as any[],
    finalStatus: "unknown"
  };

  try {
    const email = "pousada@doiscoracoes.com.br";
    
    // 1. Check if user exists via Prisma
    const user = await prisma.user.findUnique({ where: { email } });
    results.userExists = !!user;
    
    if (user) {
      // Check account
      const account = await prisma.account.findFirst({ where: { userId: user.id } });
      results.accountExists = !!account;
    }

    // 2. If user missing, try to create via Better Auth
    if (!user) {
      results.actionsTaken.push("Attempting creation via auth.api.signUpEmail");
      
      try {
        const password = "Senhadapousada@123";
        const name = "Admin Pousada";
        const ctxHeaders = await headers();
        
        const res = await auth.api.signUpEmail({
          body: { email, password, name },
          headers: ctxHeaders
        });
        
        if (res?.user) {
           results.actionsTaken.push("User created successfully via API");
           
           // Verify DB state immediately
           const newUser = await prisma.user.findUnique({ where: { email } });
           if (newUser) {
             results.userExists = true;
             
             // Promote to admin
             await prisma.user.update({
               where: { id: newUser.id },
               data: { 
                 role: "admin",
                 emailVerified: true,
                 permissions: ["overview", "management", "operations", "financial", "settings"]
               }
             });
             results.actionsTaken.push("Promoted to admin and verified email");
           }
        }
      } catch (err) {
        results.errors.push({ stage: "signUpEmail", error: String(err) });
      }
    } else {
        // User exists, ensure Role and Password
        results.actionsTaken.push("User exists. Updating role/permissions just in case.");
        await prisma.user.update({
            where: { id: user.id },
            data: {
                role: "admin",
                emailVerified: true,
                permissions: ["overview", "management", "operations", "financial", "settings"]
            }
        });
        
        if (!results.accountExists) {
            results.actionsTaken.push("WARNING: User exists but Account is missing! Passwords won't work.");
            // We could try to recreate account here, but better to delete and recreate user to ensure hashing consistency
            // results.actionsTaken.push("Deleting inconsistent user to allow recreation...");
            // await prisma.user.delete({ where: { email } });
            // ... recursion or manual retry
        }
    }

    // Final check
    const finalUser = await prisma.user.findUnique({ 
        where: { email },
        include: { accounts: true }
    });
    
    return NextResponse.json({
        success: true,
        debug: results,
        currentState: {
            user: finalUser ? { id: finalUser.id, email: finalUser.email, role: finalUser.role } : null,
            accountCount: finalUser?.accounts?.length || 0
        }
    });

  } catch (error) {
    return NextResponse.json({ 
        error: "Internal Server Error", 
        details: String(error),
        debug: results
    }, { status: 500 });
  }
}
