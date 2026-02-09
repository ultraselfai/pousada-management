
import { prisma } from "@/db";

async function main() {
  try {
    const count = await prisma.user.count();
    console.log("SUCCESS: Users count =", count);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

main();
