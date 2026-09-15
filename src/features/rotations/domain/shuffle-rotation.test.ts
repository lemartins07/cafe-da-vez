import { describe, expect, it } from 'vitest';
import { shuffleRotationMembers } from './shuffle-rotation';

describe('shuffleRotationMembers', () => {
  it('reordena todos os participantes e atribui posições sequenciais', () => {
    const randomValues = [0, 0];
    const random = () => randomValues.shift() ?? 0;

    expect(
      shuffleRotationMembers(
        [
          { id: 'ana', position: 0 },
          { id: 'bruno', position: 1 },
          { id: 'carla', position: 2 },
        ],
        random,
      ),
    ).toEqual([
      { id: 'bruno', position: 0 },
      { id: 'carla', position: 1 },
      { id: 'ana', position: 2 },
    ]);
  });
});
