import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CurrentTurnActions } from './current-turn-actions';

vi.mock('@/features/rotations/actions/manage-rotations', () => ({
  completeCurrentTurn: vi.fn(),
  skipCurrentTurn: vi.fn(),
}));

afterEach(cleanup);

describe('CurrentTurnActions', () => {
  it('exige um item antes de confirmar a compra atual', () => {
    render(
      <CurrentTurnActions
        canComplete
        canManageRotations={false}
        type="BUY_COFFEE"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Registrar compra' }));

    const completeButton = screen.getByRole('button', {
      name: 'Confirmar compra',
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

    const skipButton = screen.getByRole('button', { name: 'Pular vez' });
    expect(skipButton).toBeEnabled();
    fireEvent.click(skipButton);

    expect(screen.getByRole('heading', { name: 'Pular vez' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Confirmar pulo' }),
    ).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Registrar preparo' }),
    ).not.toBeInTheDocument();
  });
});
