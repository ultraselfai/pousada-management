/**
 * Prisma Seed Script
 * 
 * Cria dados iniciais para desenvolvimento:
 * - Organização "Decode" como tenant principal
 * - Usuário admin com credenciais padrão
 * - Member vinculando admin à organização
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { randomBytes } from "crypto";

// Configuração do Prisma 7 com adapter
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Converte bytes para hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash de senha usando scrypt (algoritmo padrão do Better Auth)
 * Formato: salt:hash (ambos em hex)
 * Usa os mesmos parâmetros do Better Auth: N=16384, r=16, p=1, dkLen=64
 */
async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(randomBytes(16));
  const key = await scryptAsync(password.normalize("NFKC"), salt, {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${bytesToHex(key)}`;
}

async function main() {
  console.log("🌱 Iniciando seed...\n");

  // 1. Criar organização Decode (principal)
  const org = await prisma.organization.upsert({
    where: { slug: "decode" },
    update: {},
    create: {
      id: "org-decode-001",
      name: "Decode",
      slug: "decode",
      logo: null,
      metadata: {
        plan: "enterprise",
        domain: "decode.ink",
      },
      allowedFeatures: ["dashboard", "users", "settings", "calendar", "tasks", "r2-upload"],
      isSandbox: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Organização criada:");
  console.log(`   Nome: ${org.name}`);
  console.log(`   Slug: ${org.slug}`);
  console.log(`   ID: ${org.id}\n`);

  // 2. Criar organização Decode Lab (sandbox para features em desenvolvimento)
  const decodeLab = await prisma.organization.upsert({
    where: { slug: "decode-lab" },
    update: {
      isSandbox: true,
    },
    create: {
      id: "org-decode-lab-001",
      name: "Decode Lab",
      slug: "decode-lab",
      logo: null,
      metadata: {
        plan: "sandbox",
        description: "Ambiente de desenvolvimento para testar features em dev",
      },
      allowedFeatures: ["dashboard", "users", "settings", "calendar", "tasks", "mail", "chat", "r2-upload"],
      isSandbox: true, // Habilita acesso a features 'dev'
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Decode Lab (Sandbox) criado:");
  console.log(`   Nome: ${decodeLab.name}`);
  console.log(`   Slug: ${decodeLab.slug}`);
  console.log(`   ID: ${decodeLab.id}`);
  console.log(`   Sandbox: ${decodeLab.isSandbox}\n`);

  // 2. Criar usuário admin
  const adminEmail = "admin@decode.ink";
  const adminPassword = "Admin@123";
  const hashedPassword = await hashPassword(adminPassword);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "admin", // Garante que o admin tem role admin
    },
    create: {
      id: "user-admin-001",
      name: "Decode Admin",
      email: adminEmail,
      emailVerified: true,
      image: null,
      role: "admin", // Role de administrador do sistema
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Usuário admin criado:");
  console.log(`   Nome: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   ID: ${user.id}\n`);

  // 3. Criar account (credenciais de login)
  await prisma.account.upsert({
    where: {
      id: "account-admin-001",
    },
    update: {
      password: hashedPassword,
    },
    create: {
      id: "account-admin-001",
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Account (credenciais) criada");
  console.log(`   Provider: credential`);
  console.log(`   Senha: ${adminPassword}\n`);

  // 4. Criar member (vínculo user-organization com Decode principal)
  await prisma.member.upsert({
    where: {
      id: "member-admin-001",
    },
    update: {},
    create: {
      id: "member-admin-001",
      userId: user.id,
      organizationId: org.id,
      role: "owner",
      createdAt: new Date(),
    },
  });

  console.log("✅ Member criado (vínculo usuário-organização Decode)");
  console.log(`   Role: owner\n`);

  // 5. Criar member para Decode Lab (admin também tem acesso ao sandbox)
  await prisma.member.upsert({
    where: {
      id: "member-admin-lab-001",
    },
    update: {},
    create: {
      id: "member-admin-lab-001",
      userId: user.id,
      organizationId: decodeLab.id,
      role: "owner",
      createdAt: new Date(),
    },
  });

  console.log("✅ Member criado (vínculo usuário-organização Decode Lab)");
  console.log(`   Role: owner\n`);

  // 6. Criar usuário sandbox (para testes de produção)
  const sandboxEmail = "sandbox@decode.ink";
  const sandboxPassword = "Admin@123";
  const sandboxHashedPassword = await hashPassword(sandboxPassword);

  const sandboxUser = await prisma.user.upsert({
    where: { email: sandboxEmail },
    update: {},
    create: {
      id: "user-sandbox-001",
      name: "Decode Lab",
      email: sandboxEmail,
      emailVerified: true,
      image: null,
      role: "user", // Usuário normal (não admin)
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Usuário sandbox criado:");
  console.log(`   Nome: ${sandboxUser.name}`);
  console.log(`   Email: ${sandboxUser.email}`);
  console.log(`   ID: ${sandboxUser.id}\n`);

  // 7. Criar account para sandbox
  await prisma.account.upsert({
    where: {
      id: "account-sandbox-001",
    },
    update: {
      password: sandboxHashedPassword,
    },
    create: {
      id: "account-sandbox-001",
      userId: sandboxUser.id,
      accountId: sandboxUser.id,
      providerId: "credential",
      password: sandboxHashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Account sandbox (credenciais) criada");
  console.log(`   Provider: credential`);
  console.log(`   Senha: ${sandboxPassword}\n`);

  // 8. Vincular sandbox ao Decode Lab
  await prisma.member.upsert({
    where: {
      id: "member-sandbox-lab-001",
    },
    update: {},
    create: {
      id: "member-sandbox-lab-001",
      userId: sandboxUser.id,
      organizationId: decodeLab.id,
      role: "owner",
      createdAt: new Date(),
    },
  });

  console.log("✅ Member sandbox criado (vínculo usuário-organização Decode Lab)");
  console.log(`   Role: owner\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed concluído com sucesso!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 Credenciais de acesso:\n");
  console.log(`   Admin:   ${adminEmail} / ${adminPassword}`);
  console.log(`   Sandbox: ${sandboxEmail} / ${sandboxPassword}`);
  console.log("\n   🌐 URLs:");

  console.log("      Login: http://localhost:3000/sign-in");
  console.log("      Org:   http://decode.localhost:3000");
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
