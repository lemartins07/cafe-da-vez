import 'server-only';

import { z } from 'zod';

const nonEmpty = (value: string | undefined) =>
  value && value.trim() !== '' ? value : undefined;

const vercelEnvironment = nonEmpty(process.env.VERCEL_ENV);
const inferredAppEnvironment =
  vercelEnvironment === 'production'
    ? 'production'
    : vercelEnvironment === 'preview'
      ? 'preview'
      : 'local';

const vercelUrl = nonEmpty(process.env.VERCEL_URL);
const inferredAppUrl = vercelUrl
  ? `https://${vercelUrl}`
  : 'http://localhost:3000';

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(['local', 'preview', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_APP_ENV:
    nonEmpty(process.env.NEXT_PUBLIC_APP_ENV) ?? inferredAppEnvironment,
  NEXT_PUBLIC_APP_URL:
    nonEmpty(process.env.NEXT_PUBLIC_APP_URL) ?? inferredAppUrl,
  NEXT_PUBLIC_SUPABASE_URL: nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: nonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
});

if (!parsedEnv.success) {
  throw new Error(
    `Invalid public environment variables:\n${z.prettifyError(parsedEnv.error)}`,
  );
}

export const env = parsedEnv.data;
