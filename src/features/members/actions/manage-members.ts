'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveMember } from '@/features/auth/authorization';
import { wouldRemoveLastActiveAdmin } from '@/features/members/domain/membership-policy';
import {
  type MemberActionState,
  resolveJoinRequestSchema,
  updateMemberSchema,
} from '@/features/members/member-schema';
import { prisma } from '@/lib/prisma';

const unauthorizedState: MemberActionState = {
  message: 'Você não tem permissão para administrar integrantes.',
  status: 'error',
};

function refreshMembersPage() {
  revalidatePath('/integrantes');
}

async function resolveJoinRequest(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
): Promise<MemberActionState> {
  const { membership } = await requireActiveMember();
  if (membership.role !== 'ADMIN') return unauthorizedState;

  const outcome = await prisma.$transaction(async (transaction) => {
    const actor = await transaction.teamMember.findUnique({
      where: {
        teamId_profileId: {
          profileId: membership.profileId,
          teamId: membership.teamId,
        },
      },
      select: { role: true, status: true },
    });

    if (actor?.role !== 'ADMIN' || actor.status !== 'ACTIVE') {
      return 'unauthorized' as const;
    }

    const request = await transaction.teamJoinRequest.findFirst({
      where: { id: requestId, status: 'PENDING', teamId: membership.teamId },
      select: { profileId: true },
    });
    if (!request) return 'missing' as const;

    if (decision === 'APPROVED') {
      await transaction.teamMember.upsert({
        where: {
          teamId_profileId: {
            profileId: request.profileId,
            teamId: membership.teamId,
          },
        },
        update: { role: 'MEMBER', status: 'ACTIVE' },
        create: {
          profileId: request.profileId,
          role: 'MEMBER',
          status: 'ACTIVE',
          teamId: membership.teamId,
        },
      });
    }

    await transaction.teamJoinRequest.update({
      where: { id: requestId },
      data: {
        resolvedAt: new Date(),
        resolvedById: membership.profileId,
        status: decision,
      },
    });
    return 'resolved' as const;
  });

  refreshMembersPage();

  if (outcome === 'unauthorized') return unauthorizedState;
  if (outcome === 'missing') {
    return {
      message: 'A solicitação não está mais pendente.',
      status: 'error',
    };
  }
  return {
    message:
      decision === 'APPROVED'
        ? 'Solicitação aprovada. A pessoa já pode acessar o time.'
        : 'Solicitação recusada.',
    status: 'success',
  };
}

export async function approveJoinRequest(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const parsed = resolveJoinRequestSchema.safeParse({
    requestId: formData.get('requestId'),
  });

  if (!parsed.success) {
    return {
      message: 'Solicitação inválida.',
      status: 'error',
    };
  }

  return resolveJoinRequest(parsed.data.requestId, 'APPROVED');
}

export async function rejectJoinRequest(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const parsed = resolveJoinRequestSchema.safeParse({
    requestId: formData.get('requestId'),
  });
  if (!parsed.success) {
    return { message: 'Solicitação inválida.', status: 'error' };
  }

  return resolveJoinRequest(parsed.data.requestId, 'REJECTED');
}

export async function updateMember(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const parsed = updateMemberSchema.safeParse({
    profileId: formData.get('profileId'),
    role: formData.get('role'),
    status: formData.get('nextStatus') ?? formData.get('status'),
  });

  if (!parsed.success) {
    return { message: 'Dados do integrante inválidos.', status: 'error' };
  }

  const { membership } = await requireActiveMember();
  if (membership.role !== 'ADMIN') return unauthorizedState;

  const outcome = await prisma.$transaction(async (transaction) => {
    const [actor, target] = await Promise.all([
      transaction.teamMember.findUnique({
        where: {
          teamId_profileId: {
            profileId: membership.profileId,
            teamId: membership.teamId,
          },
        },
        select: { role: true, status: true },
      }),
      transaction.teamMember.findUnique({
        where: {
          teamId_profileId: {
            profileId: parsed.data.profileId,
            teamId: membership.teamId,
          },
        },
        select: { role: true, status: true },
      }),
    ]);

    if (actor?.role !== 'ADMIN' || actor.status !== 'ACTIVE') {
      return 'unauthorized' as const;
    }
    if (!target) return 'missing' as const;

    const activeAdminCount = await transaction.teamMember.count({
      where: {
        role: 'ADMIN',
        status: 'ACTIVE',
        teamId: membership.teamId,
      },
    });
    if (
      wouldRemoveLastActiveAdmin({
        activeAdminCount,
        nextRole: parsed.data.role,
        nextStatus: parsed.data.status,
        targetRole: target.role,
        targetStatus: target.status,
      })
    ) {
      return 'last-admin' as const;
    }

    await transaction.teamMember.update({
      where: {
        teamId_profileId: {
          profileId: parsed.data.profileId,
          teamId: membership.teamId,
        },
      },
      data: { role: parsed.data.role, status: parsed.data.status },
    });
    return 'updated' as const;
  });

  if (outcome === 'unauthorized') return unauthorizedState;
  if (outcome === 'missing') {
    return {
      message: 'Integrante não encontrado neste time.',
      status: 'error',
    };
  }
  if (outcome === 'last-admin') {
    return {
      message: 'O time precisa manter pelo menos um administrador ativo.',
      status: 'error',
    };
  }

  refreshMembersPage();

  return { message: 'Integrante atualizado.', status: 'success' };
}
