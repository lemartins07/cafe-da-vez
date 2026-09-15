import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CurrentTurnActions } from './current-turn-actions';

vi.mock('@/features/rotations/actions/manage-rotations', () => ({
  completeCurrentTurn: vi.fn(),
  skipCurrentTurn: vi.fn(),
}));

afterEach(cleanup);

describe('CurrentTurnActions', () => {
  it('exige um item antes de concluir a compra atual', () => {
    render(
      <CurrentTurnActions
        canComplete
        canManageRotations={false}
        type="BUY_COFFEE"
      />,
    );

    const completeButton = screen.getByRole('button', {
      name: 'Concluir vez',
    });
    expect(completeButton).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Pular vez' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Pó de café'));

    expect(completeButton).toBeEnabled();
  });

  it('expõe o pulo apenas para quem administra a fila', () => {
    render(
      <CurrentTurnActions
        canComplete={false}
        canManageRotations
        type="MAKE_COFFEE"
      />,
    );

    expect(screen.getByRole('button', { name: 'Pular vez' })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Concluir vez' }),
    ).not.toBeInTheDocument();
  });
});
