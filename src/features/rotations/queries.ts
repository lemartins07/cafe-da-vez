import 'server-only';

import { requireActiveMember } from '@/features/auth/authorization';
import {
  getCurrentRotationMember,
  type RotationMemberStatus,
} from '@/features/rotations/domain/advance-rotation';
import { rotationDefinitions } from '@/features/rotations/domain/rotation-definitions';
import { prisma } from '@/lib/prisma';

export type RotationView = {
  currentMember: {
    displayName: string;
    profileId: string;
  } | null;
  id: string;
  members: readonly {
    active: boolean;
    displayName: string;
    profileId: string;
    status: 'ACTIVE' | 'PAUSED';
  }[];
  name: string;
  type: 'MAKE_COFFEE' | 'BUY_COFFEE';
};

async function ensureTeamRotations(teamId: string) {
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
    const currentMember = getCurrentRotationMember({
      currentPosition: rotation.currentPosition,
      members: rotationMembers,
    });

    return {
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
    };
  });
}
