import { describe, expect, it } from 'vitest';
import { wouldRemoveLastActiveAdmin } from './membership-policy';

describe('wouldRemoveLastActiveAdmin', () => {
  it('impede pausar ou rebaixar o único administrador ativo', () => {
    expect(
      wouldRemoveLastActiveAdmin({
        activeAdminCount: 1,
        nextRole: 'ADMIN',
        nextStatus: 'PAUSED',
        targetRole: 'ADMIN',
        targetStatus: 'ACTIVE',
      }),
    ).toBe(true);

    expect(
      wouldRemoveLastActiveAdmin({
        activeAdminCount: 1,
        nextRole: 'MEMBER',
        nextStatus: 'ACTIVE',
        targetRole: 'ADMIN',
        targetStatus: 'ACTIVE',
      }),
    ).toBe(true);
  });

  it('permite a alteração quando outro administrador ativo permanece', () => {
    expect(
      wouldRemoveLastActiveAdmin({
        activeAdminCount: 2,
        nextRole: 'MEMBER',
        nextStatus: 'ACTIVE',
        targetRole: 'ADMIN',
        targetStatus: 'ACTIVE',
      }),
    ).toBe(false);
  });

  it('não bloqueia alterações em integrantes que não são administradores ativos', () => {
    expect(
      wouldRemoveLastActiveAdmin({
        activeAdminCount: 1,
        nextRole: 'MEMBER',
        nextStatus: 'PAUSED',
        targetRole: 'MEMBER',
        targetStatus: 'ACTIVE',
      }),
    ).toBe(false);
  });
});
