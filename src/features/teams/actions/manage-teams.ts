'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  activeTeamCookieName,
  requireAuthenticatedUser,
} from '@/features/auth/authorization';
import {
  createTeamSchema,
  type TeamActionState,
  teamIdSchema,
} from '@/features/teams/team-schema';
import { prisma } from '@/lib/prisma';

function setActiveTeam(teamId: string) {
  return cookies().then((cookieStore) => {
    cookieStore.set(activeTeamCookieName, teamId, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  });
}

export async function createTeam(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const parsed = createTeamSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) {
    return { message: 'Revise o nome informado para o time.', status: 'error' };
  }

  const { profile } = await requireAuthenticatedUser();
  const team = await prisma.$transaction(async (transaction) => {
    const createdTeam = await transaction.team.create({
      data: { name: parsed.data.name },
      select: { id: true },
    });

    await transaction.teamMember.create({
      data: {
        profileId: profile.id,
        role: 'ADMIN',
        status: 'ACTIVE',
        teamId: createdTeam.id,
      },
    });

    return createdTeam;
  });

  await setActiveTeam(team.id);
  redirect('/');
}

export async function requestToJoinTeam(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const parsed = teamIdSchema.safeParse({ teamId: formData.get('teamId') });
  if (!parsed.success) {
    return { message: 'Time inválido.', status: 'error' };
  }

  const { profile } = await requireAuthenticatedUser();

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const [team, membership] = await Promise.all([
        transaction.team.findUnique({
          where: { id: parsed.data.teamId },
          select: { id: true, status: true },
        }),
        transaction.teamMember.findUnique({
          where: {
            teamId_profileId: {
              profileId: profile.id,
              teamId: parsed.data.teamId,
            },
          },
          select: { status: true },
        }),
      ]);

      if (!team || team.status !== 'ACTIVE') return 'missing' as const;
      if (membership?.status === 'ACTIVE') return 'active' as const;
      if (membership?.status === 'PAUSED') return 'paused' as const;

      await transaction.teamJoinRequest.create({
        data: { profileId: profile.id, teamId: team.id },
      });
      return 'created' as const;
    });

    if (result === 'missing') {
      return {
        message: 'Este time não está mais disponível.',
        status: 'error',
      };
    }
    if (result === 'active') {
      return { message: 'Você já participa deste time.', status: 'success' };
    }
    if (result === 'paused') {
      return {
        message:
          'Seu acesso a este time está pausado. Fale com um administrador.',
        status: 'error',
      };
    }
    return {
      message: 'Solicitação enviada. Aguarde a aprovação de um administrador.',
      status: 'success',
    };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return {
        message: 'Já existe uma solicitação pendente para este time.',
        status: 'error',
      };
    }

    return {
      message: 'Não foi possível enviar a solicitação. Tente novamente.',
      status: 'error',
    };
  }
}

export async function selectActiveTeam(formData: FormData) {
  const parsed = teamIdSchema.safeParse({ teamId: formData.get('teamId') });
  if (!parsed.success) redirect('/times');

  const { profile } = await requireAuthenticatedUser();
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_profileId: {
        profileId: profile.id,
        teamId: parsed.data.teamId,
      },
    },
    select: { status: true, team: { select: { status: true } } },
  });

  if (membership?.status !== 'ACTIVE' || membership.team.status !== 'ACTIVE')
    redirect('/times');

  await setActiveTeam(parsed.data.teamId);
  redirect('/');
}
