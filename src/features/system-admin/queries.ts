import 'server-only';

import { requireSystemAdmin } from '@/features/auth/authorization';
import { prisma } from '@/lib/prisma';

export async function getSystemAdminDashboard() {
  await requireSystemAdmin();

  const [teams, accounts] = await Promise.all([
    prisma.team.findMany({
      orderBy: { name: 'asc' },
      select: {
        _count: { select: { members: true } },
        createdAt: true,
        disabledAt: true,
        id: true,
        name: true,
        status: true,
      },
    }),
    prisma.profile.findMany({
      orderBy: { displayName: 'asc' },
      select: {
        _count: { select: { memberships: true } },
        createdAt: true,
        displayName: true,
        email: true,
        id: true,
        mustChangePassword: true,
        systemRole: true,
      },
    }),
  ]);

  return { accounts, teams };
}

export type SystemAdminDashboard = Awaited<
  ReturnType<typeof getSystemAdminDashboard>
>;
