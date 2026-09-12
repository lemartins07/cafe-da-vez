import 'server-only';

import { z } from 'zod';

const localDatabaseUrl =
  'postgresql://cafe_da_vez:cafe_da_vez@localhost:5432/cafe_da_vez?schema=public';

const nonEmpty = (value: string | undefined) =>
  value && value.trim() !== '' ? value : undefined;

const databaseUrl =
  nonEmpty(process.env.DATABASE_URL) ??
  (process.env.VERCEL === '1' ? undefined : localDatabaseUrl);

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
});

const parsedServerEnv = serverEnvSchema.safeParse({
  DATABASE_URL: databaseUrl,
  DIRECT_URL: nonEmpty(process.env.DIRECT_URL) ?? databaseUrl,
  SUPABASE_SECRET_KEY: nonEmpty(process.env.SUPABASE_SECRET_KEY),
});

if (!parsedServerEnv.success) {
  throw new Error(
    `Invalid server environment variables:\n${z.prettifyError(parsedServerEnv.error)}`,
  );
}

export const serverEnv = parsedServerEnv.data;
