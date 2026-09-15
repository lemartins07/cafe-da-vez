import 'server-only';

import { requireAuthenticatedUser } from '@/features/auth/authorization';
import { teamSearchSchema } from '@/features/teams/team-schema';
import { prisma } from '@/lib/prisma';

export type DiscoverableTeam = {
  id: string;
  name: string;
  requestStatus: 'PENDING' | 'REJECTED' | null;
};

export async function getTeamOnboarding(search: string | undefined) {
  const { profile } = await requireAuthenticatedUser();
  const query = teamSearchSchema.safeParse({ query: search ?? '' });
  const normalizedQuery = query.success ? query.data.query : '';

  const [memberships, teams] = await Promise.all([
    prisma.teamMember.findMany({
      where: {
        profileId: profile.id,
        team: { is: { status: 'ACTIVE' } },
      },
      include: { team: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.team.findMany({
      where: {
        status: 'ACTIVE',
        ...(normalizedQuery
          ? { name: { contains: normalizedQuery, mode: 'insensitive' } }
          : {}),
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
      take: 50,
    }),
  ]);

  const requests = await prisma.teamJoinRequest.findMany({
    where: {
      profileId: profile.id,
      teamId: { in: teams.map((team) => team.id) },
    },
    orderBy: { requestedAt: 'desc' },
    select: { status: true, teamId: true },
  });
  const requestStatusByTeamId = new Map<
    string,
    DiscoverableTeam['requestStatus']
  >();
  for (const request of requests) {
    if (!requestStatusByTeamId.has(request.teamId)) {
      requestStatusByTeamId.set(
        request.teamId,
        request.status === 'APPROVED' ? null : request.status,
      );
    }
  }

  const membershipByTeamId = new Map(
    memberships.map((membership) => [membership.teamId, membership]),
  );

  return {
    memberships,
    teams: teams
      .filter((team) => !membershipByTeamId.has(team.id))
      .map((team) => ({
        ...team,
        requestStatus: requestStatusByTeamId.get(team.id) ?? null,
      })),
  };
}
