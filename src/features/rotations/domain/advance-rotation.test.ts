import { describe, expect, it } from 'vitest';
import {
  advanceRotation,
  getCurrentRotationMember,
  type RotationMember,
} from './advance-rotation';

const members: readonly RotationMember[] = [
  { active: true, id: 'ana', position: 0, status: 'ACTIVE' },
  { active: true, id: 'bruno', position: 1, status: 'ACTIVE' },
  { active: true, id: 'carla', position: 2, status: 'ACTIVE' },
];

describe('getCurrentRotationMember', () => {
  it('seleciona o integrante na posição atual', () => {
    expect(
      getCurrentRotationMember({ currentPosition: 1, members }),
    ).toMatchObject({ id: 'bruno' });
  });

  it('reinicia o ciclo depois da última posição', () => {
    expect(
      getCurrentRotationMember({ currentPosition: 3, members }),
    ).toMatchObject({ id: 'ana' });
  });

  it('ignora integrantes pausados ou inativos', () => {
    const unavailableMembers = [
      { ...members[0], status: 'PAUSED' as const },
      { ...members[1], active: false },
      members[2],
    ];

    expect(
      getCurrentRotationMember({
        currentPosition: 0,
        members: unavailableMembers,
      }),
    ).toMatchObject({ id: 'carla' });
  });
});

describe('advanceRotation', () => {
  it('avança a vez concluída para o próximo integrante elegível', () => {
    expect(
      advanceRotation({
        action: 'COMPLETED',
        currentPosition: 0,
        members,
        processedRequestIds: [],
        requestId: 'request-1',
      }),
    ).toMatchObject({
      action: 'COMPLETED',
      currentPosition: 1,
      status: 'advanced',
      subject: { id: 'ana' },
    });
  });

  it('trata um salto como evento da vez atual e segue para a próxima', () => {
    expect(
      advanceRotation({
        action: 'SKIPPED',
        currentPosition: 1,
        members,
        processedRequestIds: [],
        requestId: 'request-2',
      }),
    ).toMatchObject({
      action: 'SKIPPED',
      currentPosition: 2,
      status: 'advanced',
      subject: { id: 'bruno' },
    });
  });

  it('retorna ao início ao avançar depois do último integrante', () => {
    expect(
      advanceRotation({
        action: 'COMPLETED',
        currentPosition: 2,
        members,
        processedRequestIds: [],
        requestId: 'request-3',
      }),
    ).toMatchObject({ currentPosition: 0, status: 'advanced' });
  });

  it('não avança novamente uma requisição já processada', () => {
    expect(
      advanceRotation({
        action: 'COMPLETED',
        currentPosition: 1,
        members,
        processedRequestIds: ['request-4'],
        requestId: 'request-4',
      }),
    ).toEqual({ currentPosition: 1, status: 'duplicate' });
  });

  it('não avança uma fila sem integrantes elegíveis', () => {
    const pausedMembers = members.map((member) => ({
      ...member,
      status: 'PAUSED' as const,
    }));

    expect(
      advanceRotation({
        action: 'COMPLETED',
        currentPosition: 0,
        members: pausedMembers,
        processedRequestIds: [],
        requestId: 'request-5',
      }),
    ).toEqual({ currentPosition: 0, status: 'empty' });
  });
});
