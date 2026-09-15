import { describe, expect, it } from 'vitest';
import {
  createTeamSchema,
  teamIdSchema,
  teamSearchSchema,
} from './team-schema';

describe('team schemas', () => {
  it('normaliza o nome criado e valida seus limites', () => {
    expect(createTeamSchema.parse({ name: '  Café do 8º andar  ' })).toEqual({
      name: 'Café do 8º andar',
    });
    expect(createTeamSchema.safeParse({ name: 'A' }).success).toBe(false);
  });

  it('aceita somente identificadores UUID para ações de time', () => {
    expect(
      teamIdSchema.safeParse({
        teamId: '3e3a77eb-47a8-406f-8c15-77e8da23be68',
      }).success,
    ).toBe(true);
    expect(teamIdSchema.safeParse({ teamId: 'time-1' }).success).toBe(false);
  });

  it('normaliza a consulta de busca', () => {
    expect(teamSearchSchema.parse({ query: '  CAFÉ  ' })).toEqual({
      query: 'café',
    });
  });
});
