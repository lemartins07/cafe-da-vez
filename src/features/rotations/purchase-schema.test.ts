import { describe, expect, it } from 'vitest';
import {
  processCurrentTurnSchema,
  recordPastPurchaseSchema,
} from './purchase-schema';

const validPurchase = {
  occurredOn: '2020-09-14',
  profileId: 'c12e79bb-86f5-4bb4-9c60-5508bdda8a1e',
  purchasedCoffee: true,
  purchasedFilters: false,
  requestId: 'f48e3ba6-b2c1-43d2-96e3-76f15ef4d707',
};

describe('recordPastPurchaseSchema', () => {
  it('aceita uma compra com pó de café ou filtro', () => {
    expect(recordPastPurchaseSchema.parse(validPurchase)).toEqual(
      validPurchase,
    );
  });

  it('rejeita uma compra sem item selecionado', () => {
    expect(
      recordPastPurchaseSchema.safeParse({
        ...validPurchase,
        purchasedCoffee: false,
        purchasedFilters: false,
      }).success,
    ).toBe(false);
  });

  it('rejeita uma data futura', () => {
    expect(
      recordPastPurchaseSchema.safeParse({
        ...validPurchase,
        occurredOn: '2999-01-01',
      }).success,
    ).toBe(false);
  });
});

describe('processCurrentTurnSchema', () => {
  it('exige item somente ao concluir uma compra', () => {
    expect(
      processCurrentTurnSchema.safeParse({
        purchasedCoffee: false,
        purchasedFilters: false,
        requestId: validPurchase.requestId,
        rotationType: 'BUY_COFFEE',
      }).success,
    ).toBe(false);

    expect(
      processCurrentTurnSchema.safeParse({
        purchasedCoffee: false,
        purchasedFilters: false,
        requestId: validPurchase.requestId,
        rotationType: 'MAKE_COFFEE',
      }).success,
    ).toBe(true);
  });
});
