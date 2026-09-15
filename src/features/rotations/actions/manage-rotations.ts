'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveMember } from '@/features/auth/authorization';
import { advancePurchaseRotationWhenBuyerIsCurrent } from '@/features/rotations/domain/advance-purchase-rotation';
import type { RotationMemberStatus } from '@/features/rotations/domain/advance-rotation';
import { shuffleRotationMembers } from '@/features/rotations/domain/shuffle-rotation';
import {
  type RotationActionState,
  recordPastPurchaseSchema,
  shuffleRotationSchema,
} from '@/features/rotations/purchase-schema';
import { ensureTeamRotations } from '@/features/rotations/queries';
import { prisma } from '@/lib/prisma';

const unauthorizedState: RotationActionState = {
  message: 'Você não tem permissão para alterar as filas.',
  status: 'error',
};

const occurredOnDate = (occurredOn: string) =>
  new Date(`${occurredOn}T00:00:00.000Z`);

function refreshRotationPages() {
  revalidatePath('/filas');
  revalidatePath('/historico');
}

export async function shuffleMakeCoffeeRotation(
  _previousState: RotationActionState,
  formData: FormData,
): Promise<RotationActionState> {
  const parsed = shuffleRotationSchema.safeParse({
    requestId: formData.get('requestId'),
  });
  if (!parsed.success) {
    return { message: 'Não foi possível embaralhar a fila.', status: 'error' };
  }

  const { membership } = await requireActiveMember();
  if (membership.role !== 'ADMIN') return unauthorizedState;

  await ensureTeamRotations(membership.teamId);

  const outcome = await prisma.$transaction(async (transaction) => {
    const [actor, duplicate, rotation] = await Promise.all([
      transaction.teamMember.findUnique({
        where: {
          teamId_profileId: {
            profileId: membership.profileId,
            teamId: membership.teamId,
          },
        },
        select: {
          profile: { select: { displayName: true } },
          role: true,
          status: true,
        },
      }),
      transaction.turnEvent.findUnique({
        where: { requestId: parsed.data.requestId },
        select: { id: true },
      }),
      transaction.rotation.findUnique({
        where: {
          teamId_type: { teamId: membership.teamId, type: 'MAKE_COFFEE' },
        },
        include: {
          members: { select: { position: true, profileId: true } },
        },
      }),
    ]);

    if (actor?.role !== 'ADMIN' || actor.status !== 'ACTIVE') {
      return 'unauthorized' as const;
    }
    if (duplicate) return 'duplicate' as const;
    if (!rotation || rotation.members.length < 2)
      return 'not-enough-members' as const;

    const shuffledMembers = shuffleRotationMembers(
      rotation.members.map((member) => ({
        id: member.profileId,
        position: member.position,
      })),
    );
    await transaction.rotationMember.updateMany({
      where: { rotationId: rotation.id },
      data: { position: { increment: rotation.members.length } },
    });
    await Promise.all(
      shuffledMembers.map((member) =>
        transaction.rotationMember.update({
          where: {
            rotationId_profileId: {
              profileId: member.id,
              rotationId: rotation.id,
            },
          },
          data: { position: member.position },
        }),
      ),
    );
    await transaction.rotation.update({
      where: { id: rotation.id },
      data: { currentPosition: 0, version: { increment: 1 } },
    });
    await transaction.turnEvent.create({
      data: {
        action: 'REORDERED',
        occurredOn: new Date(),
        performedById: membership.profileId,
        reason: 'A fila de preparo foi embaralhada.',
        requestId: parsed.data.requestId,
        rotationId: rotation.id,
        subjectId: membership.profileId,
        subjectName: actor.profile.displayName,
      },
    });
    return 'shuffled' as const;
  });

  if (outcome === 'unauthorized') return unauthorizedState;
  if (outcome === 'duplicate') {
    return {
      actionId: parsed.data.requestId,
      message: 'Esta solicitação já foi registrada.',
      status: 'success',
    };
  }
  if (outcome === 'not-enough-members') {
    return {
      message:
        'A fila precisa de pelo menos duas pessoas para ser embaralhada.',
      status: 'error',
    };
  }

  refreshRotationPages();
  return {
    actionId: parsed.data.requestId,
    message: 'Fila de preparo embaralhada.',
    status: 'success',
  };
}

export async function recordPastPurchase(
  _previousState: RotationActionState,
  formData: FormData,
): Promise<RotationActionState> {
  const parsed = recordPastPurchaseSchema.safeParse({
    occurredOn: formData.get('occurredOn'),
    profileId: formData.get('profileId'),
    purchasedCoffee: formData.get('purchasedCoffee') === 'on',
    purchasedFilters: formData.get('purchasedFilters') === 'on',
    requestId: formData.get('requestId'),
  });
  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? 'Revise os dados da compra.',
      status: 'error',
    };
  }

  const { membership } = await requireActiveMember();
  if (membership.role !== 'ADMIN') return unauthorizedState;

  await ensureTeamRotations(membership.teamId);

  const outcome = await prisma.$transaction(async (transaction) => {
    const [actor, duplicate, buyer, rotation, teamMembers] = await Promise.all([
      transaction.teamMember.findUnique({
        where: {
          teamId_profileId: {
            profileId: membership.profileId,
            teamId: membership.teamId,
          },
        },
        select: { role: true, status: true },
      }),
      transaction.turnEvent.findUnique({
        where: { requestId: parsed.data.requestId },
        select: { id: true },
      }),
      transaction.teamMember.findUnique({
        where: {
          teamId_profileId: {
            profileId: parsed.data.profileId,
            teamId: membership.teamId,
          },
        },
        select: { profile: { select: { displayName: true } } },
      }),
      transaction.rotation.findUnique({
        where: {
          teamId_type: { teamId: membership.teamId, type: 'BUY_COFFEE' },
        },
        select: {
          currentPosition: true,
          id: true,
          members: {
            select: { active: true, position: true, profileId: true },
          },
        },
      }),
      transaction.teamMember.findMany({
        where: { teamId: membership.teamId },
        select: { profileId: true, status: true },
      }),
    ]);

    if (actor?.role !== 'ADMIN' || actor.status !== 'ACTIVE') {
      return 'unauthorized' as const;
    }
    if (duplicate) return 'duplicate' as const;
    if (!buyer || !rotation) return 'missing' as const;

    const memberStatusByProfileId = new Map(
      teamMembers.map((member) => [member.profileId, member.status]),
    );
    const purchaseCounts = await transaction.turnEvent.groupBy({
      by: ['subjectId'],
      where: {
        action: 'COMPLETED',
        purchasedCoffee: { not: null },
        rotationId: rotation.id,
      },
      _count: { _all: true },
    });
    const rotationAdvance = advancePurchaseRotationWhenBuyerIsCurrent({
      buyerId: parsed.data.profileId,
      currentPosition: rotation.currentPosition,
      members: rotation.members.map((member) => ({
        active: member.active,
        id: member.profileId,
        position: member.position,
        status: (memberStatusByProfileId.get(member.profileId) ??
          'PAUSED') as RotationMemberStatus,
      })),
      purchaseCountsByMemberId: new Map(
        purchaseCounts.map((count) => [count.subjectId, count._count._all]),
      ),
    });

    await transaction.turnEvent.create({
      data: {
        action: 'COMPLETED',
        occurredOn: occurredOnDate(parsed.data.occurredOn),
        performedById: membership.profileId,
        purchasedCoffee: parsed.data.purchasedCoffee,
        purchasedFilters: parsed.data.purchasedFilters,
        requestId: parsed.data.requestId,
        rotationId: rotation.id,
        subjectId: parsed.data.profileId,
        subjectName: buyer.profile.displayName,
      },
    });
    if (rotationAdvance.status === 'advanced') {
      await transaction.rotation.update({
        where: { id: rotation.id },
        data: {
          currentPosition: rotationAdvance.currentPosition,
          version: { increment: 1 },
        },
      });
      return 'recorded-and-advanced' as const;
    }

    return 'recorded' as const;
  });

  if (outcome === 'unauthorized') return unauthorizedState;
  if (outcome === 'duplicate') {
    return {
      actionId: parsed.data.requestId,
      message: 'Esta compra já foi registrada.',
      status: 'success',
    };
  }
  if (outcome === 'missing') {
    return {
      message: 'A pessoa ou a fila de compra não foi encontrada neste time.',
      status: 'error',
    };
  }

  refreshRotationPages();
  return {
    actionId: parsed.data.requestId,
    message:
      outcome === 'recorded-and-advanced'
        ? 'Compra registrada e fila de compra recalculada.'
        : 'Compra passada registrada; fila de compra recalculada.',
    status: 'success',
  };
}
