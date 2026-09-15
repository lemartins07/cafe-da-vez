import { describe, expect, it } from 'vitest';
import { rotationDefinitions } from './rotation-definitions';

describe('rotationDefinitions', () => {
  it('define uma fila independente para preparar e outra para comprar café', () => {
    expect(rotationDefinitions).toEqual([
      { name: 'Preparar café', type: 'MAKE_COFFEE' },
      { name: 'Comprar café', type: 'BUY_COFFEE' },
    ]);
  });
});
