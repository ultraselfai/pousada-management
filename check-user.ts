
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "pousada@doiscoracoes.com.br";
  console.log(`Checking user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log("User found:", user);
    console.log("Hash start:", user.password ? user.password.substring(0, 10) + "..." : "NO PASSWORD");
  } else {
    console.log("User NOT found.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
