import { config as loadEnv } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

loadEnv({ path: '.env', quiet: true });
loadEnv({ path: '.env.local', override: true, quiet: true });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const teamName = process.env.BOOTSTRAP_TEAM_NAME?.trim() || 'Café da Vez';

if (!connectionString) {
  throw new Error(
    'Set DIRECT_URL or DATABASE_URL before running the bootstrap.',
  );
}

if (!adminEmail) {
  throw new Error('Set BOOTSTRAP_ADMIN_EMAIL before running the bootstrap.');
}

const authorizedAdminEmail = adminEmail;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingTeam = await prisma.team.findFirst({
    where: { name: teamName },
    select: { id: true },
  });

  const team =
    existingTeam ??
    (await prisma.team.create({
      data: { name: teamName },
      select: { id: true },
    }));

  await prisma.allowedEmail.upsert({
    where: {
      teamId_email: { email: authorizedAdminEmail, teamId: team.id },
    },
    update: { role: 'ADMIN' },
    create: {
      email: authorizedAdminEmail,
      role: 'ADMIN',
      teamId: team.id,
    },
  });

  console.info(
    `Administrator ${authorizedAdminEmail} authorized for team ${teamName}.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
