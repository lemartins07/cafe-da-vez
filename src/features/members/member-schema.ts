import { z } from 'zod';

export const memberRoleSchema = z.enum(['ADMIN', 'MEMBER']);

export const updateMemberSchema = z.object({
  profileId: z.uuid(),
  role: memberRoleSchema,
  status: z.enum(['ACTIVE', 'PAUSED']),
});

export const resolveJoinRequestSchema = z.object({ requestId: z.uuid() });

export type MemberActionState =
  | { message?: string; status: 'idle' }
  | { message: string; status: 'success' }
  | { message: string; status: 'error' };

export const initialMemberActionState: MemberActionState = { status: 'idle' };
