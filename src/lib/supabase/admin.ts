import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { serverEnv } from '@/lib/server-env';

export function createAdminClient() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = serverEnv.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      'Supabase Admin não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY.',
    );
  }

  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
