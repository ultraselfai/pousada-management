
import { NextResponse } from "next/server";
import { prisma } from "@/db"; // Use the project's prisma instance
import bcrypt from "bcryptjs";

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

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: "admin",
        permissions: ["overview", "management", "operations", "financial", "settings"],
        emailVerified: true,
        // Ensure password is not set on User if schema doesn't have it
      },
      create: {
        id: crypto.randomUUID(),
        email,
        name,
        role: "admin",
        permissions: ["overview", "management", "operations", "financial", "settings"],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 2. Upsert Account
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          password: hashedPassword,
        },
      });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accountId: email,
          providerId: "credential",
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Admin seeded successfully", 
      userId: user.id 
    });

  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
