import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.AUTHORIZED_EMAIL;
  if (!email) {
    console.log("Define AUTHORIZED_EMAIL en .env para crear el usuario.");
    return;
  }

  await prisma.user.upsert({
    where: { email },
    update: { name: "Agrónomo" },
    create: {
      email,
      name: "Agrónomo",
      emailVerified: new Date(),
    },
  });

  console.log(`Usuario autorizado: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
