
import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Simple protection
  if (secret !== "setup-admin-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const email = "pousada@doiscoracoes.com.br";
    const password = "Senhadapousada@123";
    const name = "Admin Pousada";

    // 1. Delete existing user to ensure clean state (and correct password hash)
    // We use a transaction or just try-catch to delete
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        // Delete user (cascade should handle account/sessions if configured, but let's be safe)
        // Prisma adapter usually handles cascade for Account/Session via relation
        await prisma.user.delete({ where: { email } });
        console.log("Existing admin user deleted.");
      }
    } catch (e) {
      console.warn("Error checking/deleting user (might not exist):", e);
    }

    // 2. Create User using Better Auth API
    // This ensures the password is hashed correctly according to Better Auth's configuration
    console.log("Creating user via auth.api.signUpEmail...");
    const ctxHeaders = await headers();
    
    // signUpEmail returns { user, session } or throws
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: ctxHeaders,
    });

    if (!result?.user) {
      throw new Error("Failed to create user via Better Auth API");
    }

    // 3. Promote to Admin via Prisma
    // Better Auth might not allow setting 'role' during signup depending on config,
    // so we update it manually to be sure.
    const updatedUser = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role: "admin",
        permissions: ["overview", "management", "operations", "financial", "settings"],
        emailVerified: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin seeded successfully with Better Auth", 
      userId: updatedUser.id,
      role: updatedUser.role
    });

  } catch (error: any) {
    console.error("Seed error:", error);
    // Return error details for debugging
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message || String(error),
      stack: error.stack 
    }, { status: 500 });
  }
}
