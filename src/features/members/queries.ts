import 'server-only';

import { requireActiveMember } from '@/features/auth/authorization';
import { prisma } from '@/lib/prisma';

export type TeamMemberView = {
  email: string;
  profileId: string;
  displayName: string;
  role: 'ADMIN' | 'MEMBER';
  status: 'ACTIVE' | 'PAUSED';
};

export type TeamJoinRequestView = {
  displayName: string;
  email: string;
  id: string;
};

export async function getCurrentTeamMembers() {
  const { membership } = await requireActiveMember();
  const [members, requests] = await Promise.all([
    prisma.teamMember.findMany({
      where: { teamId: membership.teamId },
      include: { profile: { select: { displayName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.teamJoinRequest.findMany({
      where: { status: 'PENDING', teamId: membership.teamId },
      select: {
        id: true,
        profile: { select: { displayName: true, email: true } },
      },
      orderBy: { requestedAt: 'asc' },
    }),
  ]);

  return {
    canManageMembers: membership.role === 'ADMIN',
    members: members.map<TeamMemberView>((teamMember) => ({
      displayName: teamMember.profile.displayName,
      email: teamMember.profile.email,
      profileId: teamMember.profileId,
      role: teamMember.role,
      status: teamMember.status,
    })),
    requests: requests.map<TeamJoinRequestView>((request) => ({
      displayName: request.profile.displayName,
      email: request.profile.email,
      id: request.id,
    })),
  };
}
