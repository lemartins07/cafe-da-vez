import 'server-only';

import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const activeTeamCookieName = 'cafe-da-vez-active-team';

const displayNameFromEmail = (email: string) => email.split('@')[0];

export async function provisionProfile(user: User) {
  if (!user.email) return null;

  const email = normalizeEmail(user.email);
  const displayName =
    typeof user.user_metadata.name === 'string'
      ? user.user_metadata.name
      : displayNameFromEmail(email);

  const profileById = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (profileById) {
    return prisma.profile.update({
      where: { id: user.id },
      data: { displayName, email },
    });
  }

  const profileByEmail = await prisma.profile.findUnique({
    where: { email },
    select: { id: true },
  });

  if (profileByEmail) {
    // Seeds and the former magic-link flow can leave a profile associated with
    // an old Auth identifier. Updating the primary key cascades its relations.
    return prisma.profile.update({
      where: { email },
      data: { displayName, id: user.id },
    });
  }

  return prisma.profile.upsert({
    where: { id: user.id },
    create: { displayName, email, id: user.id },
    update: { displayName, email },
  });
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await provisionProfile(user);
  if (!profile) redirect('/login');

  return { profile, user };
}

export async function requireAuthenticatedUserForPasswordChange() {
  return getAuthenticatedUser();
}

export async function requireAuthenticatedUser() {
  const context = await getAuthenticatedUser();
  if (context.profile.mustChangePassword) redirect('/change-password');

  return context;
}

export async function requireSystemAdmin() {
  const context = await requireAuthenticatedUser();
  if (context.profile.systemRole !== 'SYSTEM_ADMIN') redirect('/');

  return context;
}

export async function requireActiveMember() {
  const { profile, user } = await requireAuthenticatedUser();
  const activeMemberships = await prisma.teamMember.findMany({
    where: {
      profileId: profile.id,
      status: 'ACTIVE',
      team: { is: { status: 'ACTIVE' } },
    },
    include: { profile: true },
    orderBy: { createdAt: 'asc' },
  });

  if (activeMemberships.length === 0) {
    if (profile.systemRole === 'SYSTEM_ADMIN') redirect('/admin');
    redirect('/times');
  }

  const activeTeamId = (await cookies()).get(activeTeamCookieName)?.value;
  const selectedMembership = activeTeamId
    ? activeMemberships.find((membership) => membership.teamId === activeTeamId)
    : undefined;

  if (selectedMembership) return { membership: selectedMembership, user };

  if (activeMemberships.length > 1) redirect('/times?selectTeam=1');

  return { membership: activeMemberships[0], user };
}
