/**
 * make-admin.ts
 * Run this once to promote a user to admin by their email.
 * Usage: npx ts-node --project tsconfig.json prisma/make-admin.ts <email>
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx ts-node --project tsconfig.json prisma/make-admin.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    console.log('Make sure you have logged in at least once so your user is synced to the database.');
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  });

  console.log(`✅ Promoted ${updated.name} (${updated.email}) to admin successfully!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
