import { config as loadEnv } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

loadEnv({ path: '.env', quiet: true });
loadEnv({ path: '.env.local', override: true, quiet: true });

const emailFlagIndex = process.argv.indexOf('--email');
const email = process.argv[emailFlagIndex + 1]?.trim().toLowerCase();
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (emailFlagIndex === -1 || !email) {
  throw new Error(
    'Informe o e-mail: npm run admin:grant -- --email voce@empresa.com',
  );
}

if (!connectionString) {
  throw new Error('Defina DIRECT_URL ou DATABASE_URL.');
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const profile = await prisma.profile.update({
      where: { email },
      data: { systemRole: 'SYSTEM_ADMIN' },
      select: { email: true },
    });

    console.log(`Administrador do sistema concedido a ${profile.email}.`);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      throw new Error(
        'Perfil não encontrado. Crie a conta e faça login antes de conceder o papel.',
      );
    }

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
