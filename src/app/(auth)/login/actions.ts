'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { isEmailAllowed } from '@/features/auth/authorization';
import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function requestMagicLink(formData: FormData) {
  const result = loginSchema.safeParse({ email: formData.get('email') });

  if (!result.success) redirect('/login?error=invalid-email');

  const allowed = await isEmailAllowed(result.data.email);

  // Use the same response for unknown emails to avoid exposing the allowlist.
  if (!allowed) redirect('/login?sent=1');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: result.data.email,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
      shouldCreateUser: true,
    },
  });

  if (error) redirect('/login?error=send-failed');

  redirect('/login?sent=1');
}
