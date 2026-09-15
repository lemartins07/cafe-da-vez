import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .pipe(z.email('Informe um e-mail válido.'))
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .max(72, 'A senha deve ter no máximo 72 caracteres.'),
});

export const signUpSchema = loginSchema
  .extend({ passwordConfirmation: z.string() })
  .superRefine(({ password, passwordConfirmation }, context) => {
    if (password !== passwordConfirmation) {
      context.addIssue({
        code: 'custom',
        message: 'As senhas não coincidem.',
        path: ['passwordConfirmation'],
      });
    }
  });

export const passwordChangeSchema = z
  .object({
    password: loginSchema.shape.password,
    passwordConfirmation: z.string(),
  })
  .superRefine(({ password, passwordConfirmation }, context) => {
    if (password !== passwordConfirmation) {
      context.addIssue({
        code: 'custom',
        message: 'As senhas não coincidem.',
        path: ['passwordConfirmation'],
      });
    }
  });

export type LoginActionState = {
  fieldErrors?: {
    email?: string[];
    password?: string[];
    passwordConfirmation?: string[];
  };
  message?: string;
  status: 'error' | 'idle' | 'success';
};

export const initialLoginState: LoginActionState = { status: 'idle' };
