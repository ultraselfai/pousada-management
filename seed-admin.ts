
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "pousada@doiscoracoes.com.br";
  const password = "Senhadapousada@123";
  const name = "Admin Pousada";

  console.log(`Seeding admin user: ${email}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Upsert User
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "admin",
      permissions: ["overview", "management", "operations", "financial", "settings"],
      emailVerified: true,
    },
    create: {
      id: crypto.randomUUID(), // Manual ID generation if needed or auto? Schema says @id but not @default(cuid())? Wait.
      // Schema line 45: id String @id. No default!
      // better-auth usually handles IDs. We must generate one.
      email,
      name,
      role: "admin",
      permissions: ["overview", "management", "operations", "financial", "settings"],
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("User upserted:", user.id);

  // 2. Upsert Account (Credential)
  // Check if account exists
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
    console.log("Account password updated.");
  } else {
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        accountId: email, // usually email for credential provider
        providerId: "credential",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("Account created.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
