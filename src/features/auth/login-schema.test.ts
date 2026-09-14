import { describe, expect, it } from 'vitest';
import { loginSchema } from './login-schema';

describe('loginSchema', () => {
  it('remove espaços e normaliza o e-mail antes de enviá-lo ao servidor', () => {
    expect(loginSchema.parse({ email: '  ANA@EMPRESA.COM  ' })).toStrictEqual({
      email: 'ana@empresa.com',
    });
  });

  it.each(['', 'ana', 'ana@empresa'])(
    'rejeita um e-mail inválido: %s',
    (email) => {
      expect(loginSchema.safeParse({ email }).success).toBe(false);
    },
  );
});
