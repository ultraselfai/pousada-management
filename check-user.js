const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const email = 'pousada@doiscoracoes.com.br';
  console.log(`Checking user: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log('User found:', user);
    console.log('Password hash start:', user.password ? user.password.substring(0, 10) + '...' : 'NO PASSWORD');
  } else {
    console.log('User NOT found.');
  }
}

checkUser()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
