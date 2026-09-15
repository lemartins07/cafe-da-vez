import { describe, expect, it } from 'vitest';
import { accessResetSchema, teamStatusChangeSchema } from './admin-schema';

describe('system admin schemas', () => {
  it('aceita apenas uma alteração válida de status do time', () => {
    expect(
      teamStatusChangeSchema.safeParse({
        teamId: 'c12e79bb-86f5-4bb4-9c60-5508bdda8a1e',
        status: 'DISABLED',
      }).success,
    ).toBe(true);
    expect(
      teamStatusChangeSchema.safeParse({ teamId: 'invalido', status: 'ACTIVE' })
        .success,
    ).toBe(false);
  });

  it('exige senha temporária válida e confirmada', () => {
    expect(
      accessResetSchema.safeParse({
        password: 'senha-temporaria',
        passwordConfirmation: 'outra-senha',
        profileId: 'c12e79bb-86f5-4bb4-9c60-5508bdda8a1e',
      }).success,
    ).toBe(false);
    expect(
      accessResetSchema.safeParse({
        password: 'senha-temporaria',
        passwordConfirmation: 'senha-temporaria',
        profileId: 'c12e79bb-86f5-4bb4-9c60-5508bdda8a1e',
      }).success,
    ).toBe(true);
  });
});
