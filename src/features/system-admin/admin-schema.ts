import { z } from 'zod';
import { passwordChangeSchema } from '@/features/auth/login-schema';

export const teamStatusChangeSchema = z.object({
  teamId: z.uuid(),
  status: z.enum(['ACTIVE', 'DISABLED']),
});

export const accessResetSchema = passwordChangeSchema.safeExtend({
  profileId: z.uuid(),
});

export type AdminActionState = {
  fieldErrors?: {
    password?: string[];
    passwordConfirmation?: string[];
  };
  message?: string;
  status: 'error' | 'idle' | 'success';
};

export const initialAdminActionState: AdminActionState = { status: 'idle' };
