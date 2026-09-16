import 'server-only';

import { requireActiveMember } from '@/features/auth/authorization';
import {
  getCurrentRotationMember,
  type RotationMemberStatus,
} from '@/features/rotations/domain/advance-rotation';
import {
  getCurrentPurchaseRotationMember,
  getPurchaseRotationForecast,
} from '@/features/rotations/domain/advance-purchase-rotation';
import { rotationDefinitions } from '@/features/rotations/domain/rotation-definitions';
import { prisma } from '@/lib/prisma';

type RotationMemberView = {
  active: boolean;
  displayName: string;
  profileId: string;
  status: 'ACTIVE' | 'PAUSED';
};

export type RotationView = {
  canComplete: boolean;
  currentMember: Pick<RotationMemberView, 'displayName' | 'profileId'> | null;
  id: string;
  members: readonly RotationMemberView[];
  name: string;
  type: 'MAKE_COFFEE' | 'BUY_COFFEE';
  upcomingMembers: readonly RotationMemberView[];
};

export async function ensureTeamRotations(teamId: string) {
  const activeMembers = await prisma.teamMember.findMany({
    where: { status: 'ACTIVE', teamId },
    orderBy: { createdAt: 'asc' },
    select: { profileId: true },
  });

  await prisma.$transaction(async (transaction) => {
    const rotations = await Promise.all(
      rotationDefinitions.map((definition) =>
        transaction.rotation.upsert({
          where: {
            teamId_type: { teamId, type: definition.type },
          },
          create: {
            name: definition.name,
            teamId,
            type: definition.type,
          },
          update: {},
          select: { id: true },
        }),
      ),
    );

    await Promise.all(
      rotations.map((rotation) =>
        transaction.rotationMember.createMany({
          data: activeMembers.map((member, position) => ({
            position,
            profileId: member.profileId,
            rotationId: rotation.id,
          })),
          skipDuplicates: true,
        }),
      ),
    );
  });
}

export async function getCurrentTeamRotations(): Promise<
  readonly RotationView[]
> {
  const { membership } = await requireActiveMember();
  const { teamId } = membership;

  await ensureTeamRotations(teamId);

  const [rotations, members] = await Promise.all([
    prisma.rotation.findMany({
      where: { teamId },
      include: {
        members: {
          include: { profile: { select: { displayName: true } } },
          orderBy: { position: 'asc' },
        },
      },
    }),
    prisma.teamMember.findMany({
      where: { teamId },
      select: { profileId: true, status: true },
    }),
  ]);

  const memberStatusByProfileId = new Map(
    members.map((member) => [member.profileId, member.status]),
  );
  const rotationByType = new Map(
    rotations.map((rotation) => [rotation.type, rotation]),
  );
  const buyRotationIds = rotations
    .filter((rotation) => rotation.type === 'BUY_COFFEE')
    .map((rotation) => rotation.id);
  const purchaseCounts = await prisma.turnEvent.groupBy({
    by: ['rotationId', 'subjectId'],
    where: {
      action: 'COMPLETED',
      purchasedCoffee: { not: null },
      rotationId: { in: buyRotationIds },
    },
    _count: { _all: true },
  });
  const skippedCounts = await prisma.turnEvent.groupBy({
    by: ['rotationId', 'subjectId'],
    where: {
      action: 'SKIPPED',
      rotationId: { in: buyRotationIds },
    },
    _count: { _all: true },
  });
  const purchaseCountsByRotationId = new Map<string, Map<string, number>>();
  purchaseCounts.forEach((count) => {
    const countsByMemberId =
      purchaseCountsByRotationId.get(count.rotationId) ?? new Map();
    countsByMemberId.set(count.subjectId, count._count._all);
    purchaseCountsByRotationId.set(count.rotationId, countsByMemberId);
  });
  const skippedCountsByRotationId = new Map<string, Map<string, number>>();
  skippedCounts.forEach((count) => {
    const countsByMemberId =
      skippedCountsByRotationId.get(count.rotationId) ?? new Map();
    countsByMemberId.set(count.subjectId, count._count._all);
    skippedCountsByRotationId.set(count.rotationId, countsByMemberId);
  });

  return rotationDefinitions.flatMap((definition) => {
    const rotation = rotationByType.get(definition.type);
    if (!rotation) return [];

    const rotationMembers = rotation.members.map((member) => ({
      active: member.active,
      id: member.profileId,
      position: member.position,
      status: (memberStatusByProfileId.get(member.profileId) ??
        'PAUSED') as RotationMemberStatus,
    }));
    const currentMember =
      definition.type === 'BUY_COFFEE'
        ? getCurrentPurchaseRotationMember({
            currentPosition: rotation.currentPosition,
            members: rotationMembers,
            purchaseCountsByMemberId:
              purchaseCountsByRotationId.get(rotation.id) ?? new Map(),
            skippedCountsByMemberId:
              skippedCountsByRotationId.get(rotation.id) ?? new Map(),
          })
        : getCurrentRotationMember({
            currentPosition: rotation.currentPosition,
            members: rotationMembers,
          });
    const upcomingMembers =
      definition.type === 'BUY_COFFEE'
        ? getPurchaseRotationForecast({
            currentPosition: rotation.currentPosition,
            limit: rotationMembers.filter(
              (member) => member.active && member.status === 'ACTIVE',
            ).length,
            members: rotationMembers,
            purchaseCountsByMemberId:
              purchaseCountsByRotationId.get(rotation.id) ?? new Map(),
            skippedCountsByMemberId:
              skippedCountsByRotationId.get(rotation.id) ?? new Map(),
          }).flatMap((upcomingMember) => {
            const member = rotation.members.find(
              (rotationMember) =>
                rotationMember.profileId === upcomingMember.id,
            );
            if (!member) return [];

            return {
              active: member.active,
              displayName: member.profile.displayName,
              profileId: member.profileId,
              status: memberStatusByProfileId.get(member.profileId) ?? 'PAUSED',
            };
          })
        : rotation.members.map((member) => ({
            active: member.active,
            displayName: member.profile.displayName,
            profileId: member.profileId,
            status: memberStatusByProfileId.get(member.profileId) ?? 'PAUSED',
          }));

    return {
      canComplete:
        membership.role === 'ADMIN' ||
        currentMember?.id === membership.profileId,
      currentMember: currentMember
        ? {
            displayName:
              rotation.members.find(
                (member) => member.profileId === currentMember.id,
              )?.profile.displayName ?? 'Integrante',
            profileId: currentMember.id,
          }
        : null,
      id: rotation.id,
      members: rotation.members.map((member) => ({
        active: member.active,
        displayName: member.profile.displayName,
        profileId: member.profileId,
        status: memberStatusByProfileId.get(member.profileId) ?? 'PAUSED',
      })),
      name: rotation.name,
      type: rotation.type,
      upcomingMembers,
    };
  });
}
