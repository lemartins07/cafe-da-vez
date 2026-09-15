import { z } from 'zod';

export const teamNameSchema = z
  .string()
  .trim()
  .min(2, 'Informe um nome com pelo menos 2 caracteres.')
  .max(120, 'O nome pode ter no máximo 120 caracteres.');

export const createTeamSchema = z.object({ name: teamNameSchema });

export const teamIdSchema = z.object({ teamId: z.uuid() });

export const teamSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .max(120)
    .transform((value) => value.toLowerCase()),
});

export type TeamActionState =
  | { message?: string; status: 'idle' }
  | { message: string; status: 'success' }
  | { message: string; status: 'error' };

export const initialTeamActionState: TeamActionState = { status: 'idle' };
