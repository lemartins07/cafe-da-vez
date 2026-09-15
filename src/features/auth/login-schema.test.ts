import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  passwordChangeSchema,
  signUpSchema,
} from './login-schema';

describe('loginSchema', () => {
  it('remove espaços e normaliza o e-mail antes de enviá-lo ao servidor', () => {
    expect(
      loginSchema.parse({
        email: '  ANA@EMPRESA.COM  ',
        password: 'senha-segura',
      }),
    ).toStrictEqual({ email: 'ana@empresa.com', password: 'senha-segura' });
  });

  it.each(['', 'ana', 'ana@empresa'])(
    'rejeita um e-mail inválido: %s',
    (email) => {
      expect(
        loginSchema.safeParse({ email, password: 'senha-segura' }).success,
      ).toBe(false);
    },
  );

  it('exige uma senha com pelo menos oito caracteres', () => {
    expect(
      loginSchema.safeParse({ email: 'ana@empresa.com', password: 'curta' })
        .success,
    ).toBe(false);
  });

  it('exige confirmação igual à senha no cadastro', () => {
    expect(
      signUpSchema.safeParse({
        email: 'ana@empresa.com',
        password: 'senha-segura',
        passwordConfirmation: 'outra-senha',
      }).success,
    ).toBe(false);

    expect(
      signUpSchema.safeParse({
        email: 'ana@empresa.com',
        password: 'senha-segura',
        passwordConfirmation: 'senha-segura',
      }).success,
    ).toBe(true);
  });

  it('exige confirmação igual na troca obrigatória de senha', () => {
    expect(
      passwordChangeSchema.safeParse({
        password: 'nova-senha-segura',
        passwordConfirmation: 'senha-diferente',
      }).success,
    ).toBe(false);

    expect(
      passwordChangeSchema.safeParse({
        password: 'nova-senha-segura',
        passwordConfirmation: 'nova-senha-segura',
      }).success,
    ).toBe(true);
  });
});
