'use server';

import { isEmailAllowed } from '@/features/auth/authorization';
import {
  loginSchema,
  type LoginActionState,
} from '@/features/auth/login-schema';
import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export async function requestMagicLink(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const result = loginSchema.safeParse({ email: formData.get('email') });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      status: 'error',
    };
  }

  try {
    const allowed = await isEmailAllowed(result.data.email);

    // Use the same response for unknown emails to avoid exposing the allowlist.
    if (!allowed) {
      return {
        message:
          'Se o e-mail estiver autorizado, o link chegará em alguns instantes.',
        status: 'success',
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: result.data.email,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      return {
        message:
          'Não foi possível enviar o link. Tente novamente em instantes.',
        status: 'error',
      };
    }

    return {
      message:
        'Se o e-mail estiver autorizado, o link chegará em alguns instantes.',
      status: 'success',
    };
  } catch {
    return {
      message: 'Não foi possível enviar o link. Tente novamente em instantes.',
      status: 'error',
    };
  }
}
