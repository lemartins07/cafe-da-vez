import 'server-only';

import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function isEmailAllowed(email: string) {
  return prisma.allowedEmail.findFirst({
    where: { email: normalizeEmail(email) },
    select: { id: true },
  });
}

export async function provisionAuthorizedUser(user: User) {
  if (!user.email) return false;

  const email = normalizeEmail(user.email);
  const invitations = await prisma.allowedEmail.findMany({
    where: { email },
    select: { role: true, teamId: true },
  });

  if (invitations.length === 0) return false;

  const displayName =
    typeof user.user_metadata.name === 'string'
      ? user.user_metadata.name
      : email.split('@')[0];

  await prisma.$transaction(async (transaction) => {
    await transaction.profile.upsert({
      where: { id: user.id },
      update: { displayName, email },
      create: { displayName, email, id: user.id },
    });

    for (const invitation of invitations) {
      await transaction.teamMember.upsert({
        where: {
          teamId_profileId: {
            profileId: user.id,
            teamId: invitation.teamId,
          },
        },
        // Signing in must not reactivate a membership paused by an admin.
        update: { role: invitation.role },
        create: {
          profileId: user.id,
          role: invitation.role,
          teamId: invitation.teamId,
        },
      });
    }
  });

  return true;
}

export async function requireActiveMember() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const membership = await prisma.teamMember.findFirst({
    where: { profileId: user.id, status: 'ACTIVE' },
    select: { profile: true, role: true, teamId: true },
  });

  if (!membership) redirect('/login?error=unauthorized');

  return { membership, user };
}
