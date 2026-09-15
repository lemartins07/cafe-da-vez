import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

const localDatabaseUrl =
  'postgresql://cafe_da_vez:cafe_da_vez@localhost:5432/cafe_da_vez?schema=public';

loadEnv({ path: '.env', quiet: true });
loadEnv({ path: '.env.local', override: true, quiet: true });

process.env.DATABASE_URL ||= localDatabaseUrl;
process.env.DIRECT_URL ||= process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
