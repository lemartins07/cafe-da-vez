import { describe, expect, it } from 'vitest';
import {
  advancePurchaseRotationWhenBuyerIsCurrent,
  getCurrentPurchaseRotationMember,
  getPurchaseRotationForecast,
} from './advance-purchase-rotation';

const members = [
  { active: true, id: 'ana', position: 0, status: 'ACTIVE' as const },
  { active: true, id: 'bruno', position: 1, status: 'ACTIVE' as const },
  { active: true, id: 'carla', position: 2, status: 'ACTIVE' as const },
];

describe('advancePurchaseRotationWhenBuyerIsCurrent', () => {
  it('avança a fila quando a compra é atribuída à pessoa da vez', () => {
    expect(
      advancePurchaseRotationWhenBuyerIsCurrent({
        buyerId: 'ana',
        currentPosition: 0,
        members,
        purchaseCountsByMemberId: new Map(),
      }),
    ).toEqual({ currentPosition: 1, status: 'advanced' });
  });

  it('prioriza quem tem menos compras registradas', () => {
    expect(
      advancePurchaseRotationWhenBuyerIsCurrent({
        buyerId: 'carla',
        currentPosition: 0,
        members,
        purchaseCountsByMemberId: new Map([
          ['ana', 2],
          ['bruno', 1],
          ['carla', 0],
        ]),
      }),
    ).toEqual({ currentPosition: 0, status: 'advanced' });
  });

  it('usa a ordem da fila para desempatar quem tem a mesma quantidade', () => {
    expect(
      advancePurchaseRotationWhenBuyerIsCurrent({
        buyerId: 'ana',
        currentPosition: 0,
        members,
        purchaseCountsByMemberId: new Map([
          ['ana', 2],
          ['bruno', 2],
          ['carla', 2],
        ]),
      }),
    ).toEqual({ currentPosition: 1, status: 'advanced' });
  });

  it('equilibra Ana com duas compras, Maria com uma e João sem compras', () => {
    const counts = new Map([
      ['ana', 2],
      ['bruno', 1],
      ['carla', 0],
    ]);

    expect(
      getCurrentPurchaseRotationMember({
        currentPosition: 0,
        members,
        purchaseCountsByMemberId: counts,
      }),
    ).toMatchObject({ id: 'carla' });

    counts.set('carla', 1);
    expect(
      getCurrentPurchaseRotationMember({
        currentPosition: 0,
        members,
        purchaseCountsByMemberId: counts,
      }),
    ).toMatchObject({ id: 'bruno' });

    counts.set('bruno', 2);
    expect(
      getCurrentPurchaseRotationMember({
        currentPosition: 2,
        members,
        purchaseCountsByMemberId: counts,
      }),
    ).toMatchObject({ id: 'carla' });

    counts.set('carla', 2);
    expect(
      getCurrentPurchaseRotationMember({
        currentPosition: 0,
        members,
        purchaseCountsByMemberId: counts,
      }),
    ).toMatchObject({ id: 'ana' });
  });

  it('prevê as próximas compras pela mesma regra de balanceamento', () => {
    expect(
      getPurchaseRotationForecast({
        currentPosition: 0,
        limit: 3,
        members,
        purchaseCountsByMemberId: new Map([
          ['ana', 2],
          ['bruno', 1],
          ['carla', 0],
        ]),
      }).map((member) => member.id),
    ).toEqual(['carla', 'bruno', 'carla']);
  });
});
