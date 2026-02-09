
import { auth } from "@/lib/auth";
import { prisma } from "@/db";

async function main() {
  const email = "pousada@doiscoracoes.com.br";
  const password = "Senhadapousada@123";
  const name = "Admin Dois Corações";

  console.log("Tentando criar usuário admin...");

  try {
     // Check DB connection
     await prisma.$connect();
     console.log("Conectado ao DB.");

    // Limpar usuário
    const deleted = await prisma.user.deleteMany({
      where: { email }
    });
    console.log(`Usuários deletados: ${deleted.count}`);

    // Criar via API do Auth
    // Note: auth.api.signUpEmail might rely on process.env.BETTER_AUTH_URL being set or inferred.
    // In a script, Next.js env vars might not be loaded if not using strict environment loader, 
    // but we can try.
    
    // We'll mimic the request body expected by better-auth
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      }
    });

    console.log("Usuário criado com sucesso:", user);
    
    // Force role if needed
    if (user?.user?.id) {
       await prisma.user.update({
           where: { id: user.user.id },
           data: { role: "admin" }
       });
       console.log("Role atualizado para admin.");
    }

  } catch (error) {
    console.error("Erro fatal:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
