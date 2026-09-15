'use server';

import { revalidatePath } from 'next/cache';
import { requireSystemAdmin } from '@/features/auth/authorization';
import {
  accessResetSchema,
  type AdminActionState,
  teamStatusChangeSchema,
} from '@/features/system-admin/admin-schema';
import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin';

export async function changeTeamStatus(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = teamStatusChangeSchema.safeParse({
    status: formData.get('status'),
    teamId: formData.get('teamId'),
  });
  if (!parsed.success) {
    return { message: 'Time ou status inválido.', status: 'error' };
  }

  await requireSystemAdmin();
  const team = await prisma.team.findUnique({
    where: { id: parsed.data.teamId },
    select: { id: true },
  });
  if (!team) return { message: 'Time não encontrado.', status: 'error' };

  await prisma.team.update({
    where: { id: team.id },
    data: {
      disabledAt: parsed.data.status === 'DISABLED' ? new Date() : null,
      status: parsed.data.status,
    },
  });

  revalidatePath('/admin');
  return {
    message:
      parsed.data.status === 'DISABLED'
        ? 'Time desativado.'
        : 'Time reativado.',
    status: 'success',
  };
}

export async function resetAccountAccess(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = accessResetSchema.safeParse({
    password: formData.get('password'),
    passwordConfirmation: formData.get('passwordConfirmation'),
    profileId: formData.get('profileId'),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      status: 'error',
    };
  }

  await requireSystemAdmin();
  const profile = await prisma.profile.findUnique({
    where: { id: parsed.data.profileId },
    select: { id: true },
  });
  if (!profile) return { message: 'Conta não encontrada.', status: 'error' };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(profile.id, {
      password: parsed.data.password,
    });
    if (error) throw error;
  } catch {
    return {
      message:
        'Não foi possível redefinir o acesso. Verifique a configuração administrativa do Supabase.',
      status: 'error',
    };
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: { mustChangePassword: true },
  });

  revalidatePath('/admin');
  return {
    message:
      'Senha temporária definida. A troca será exigida no próximo acesso.',
    status: 'success',
  };
}
