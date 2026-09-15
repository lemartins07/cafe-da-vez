import { describe, expect, it } from 'vitest';
import { resolveJoinRequestSchema, updateMemberSchema } from './member-schema';

describe('member schemas', () => {
  it('aceita somente identificador válido para decidir uma solicitação', () => {
    expect(
      resolveJoinRequestSchema.safeParse({
        requestId: '3e3a77eb-47a8-406f-8c15-77e8da23be68',
      }).success,
    ).toBe(true);

    expect(
      resolveJoinRequestSchema.safeParse({ requestId: 'pedido-1' }).success,
    ).toBe(false);
  });

  it('exige um identificador válido e estados conhecidos ao editar', () => {
    expect(
      updateMemberSchema.safeParse({
        profileId: '3e3a77eb-47a8-406f-8c15-77e8da23be68',
        role: 'ADMIN',
        status: 'PAUSED',
      }).success,
    ).toBe(true);

    expect(
      updateMemberSchema.safeParse({
        profileId: 'not-a-uuid',
        role: 'MEMBER',
        status: 'REMOVED',
      }).success,
    ).toBe(false);
  });
});
