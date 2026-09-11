import 'server-only';

import { z } from 'zod';

const emptyStringAsUndefined = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().url().optional(),
);

const localDatabaseUrl =
  'postgresql://cafe_da_vez:cafe_da_vez@localhost:5432/cafe_da_vez?schema=public';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  NEXT_PUBLIC_APP_ENV: z
    .enum(['local', 'preview', 'production'])
    .default('local'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().url().default(localDatabaseUrl),
  DIRECT_URL: z.string().url().default(localDatabaseUrl),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: emptyStringAsUndefined,
  SUPABASE_SECRET_KEY: emptyStringAsUndefined,
});

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
});

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsedEnv.error)}`,
  );
}

export const env = parsedEnv.data;
