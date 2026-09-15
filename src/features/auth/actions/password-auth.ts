'use server';

import { redirect } from 'next/navigation';
import { provisionProfile } from '@/features/auth/authorization';
import {
  loginSchema,
  signUpSchema,
  type LoginActionState,
} from '@/features/auth/login-schema';
import { createClient } from '@/lib/supabase/server';

const invalidCredentials: LoginActionState = {
  message: 'E-mail ou senha inválidos.',
  status: 'error',
};

function parseSignInCredentials(formData: FormData) {
  return loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
}

function parseSignUpCredentials(formData: FormData) {
  return signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirmation: formData.get('passwordConfirmation'),
  });
}

export async function signInWithPassword(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = parseSignInCredentials(formData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      status: 'error',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) return invalidCredentials;

  const profile = await provisionProfile(data.user);
  if (profile?.mustChangePassword) redirect('/change-password');
  if (profile?.systemRole === 'SYSTEM_ADMIN') redirect('/admin');
  redirect('/');
}

export async function signUpWithPassword(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = parseSignUpCredentials(formData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      status: 'error',
    };
  }

  const supabase = await createClient();
  const credentials = {
    email: parsed.data.email,
    password: parsed.data.password,
  };
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: { data: { name: parsed.data.email.split('@')[0] } },
  });

  if (error || !data.user || !data.session) {
    return {
      message:
        'Não foi possível criar a conta. Verifique os dados e tente novamente.',
      status: 'error',
    };
  }

  await provisionProfile(data.user);
  redirect('/times');
}
