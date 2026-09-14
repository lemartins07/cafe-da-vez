import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail corporativo.')
    .pipe(z.email('Informe um e-mail válido.'))
    .transform((email) => email.toLowerCase()),
});

export type LoginActionState = {
  fieldErrors?: { email?: string[] };
  message?: string;
  status: 'error' | 'idle' | 'success';
};

export const initialLoginState: LoginActionState = { status: 'idle' };
