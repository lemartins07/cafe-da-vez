'use server';

import { redirect } from 'next/navigation';
import { requireAuthenticatedUserForPasswordChange } from '@/features/auth/authorization';
import {
  passwordChangeSchema,
  type LoginActionState,
} from '@/features/auth/login-schema';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function changeRequiredPassword(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = passwordChangeSchema.safeParse({
    password: formData.get('password'),
    passwordConfirmation: formData.get('passwordConfirmation'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      status: 'error',
    };
  }

  const { profile } = await requireAuthenticatedUserForPasswordChange();
  if (!profile.mustChangePassword) {
    redirect(profile.systemRole === 'SYSTEM_ADMIN' ? '/admin' : '/');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      message: 'Não foi possível atualizar a senha. Tente novamente.',
      status: 'error',
    };
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: { mustChangePassword: false },
  });

  redirect(profile.systemRole === 'SYSTEM_ADMIN' ? '/admin' : '/');
}
