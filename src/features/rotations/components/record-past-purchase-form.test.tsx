import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordPastPurchaseForm } from './record-past-purchase-form';

vi.mock('@/features/rotations/actions/manage-rotations', () => ({
  recordPastPurchase: vi.fn(),
}));

afterEach(cleanup);

describe('RecordPastPurchaseForm', () => {
  it('abre e fecha o formulário de compra passada sob demanda', () => {
    render(
      <RecordPastPurchaseForm
        members={[
          {
            displayName: 'Ana Silva',
            profileId: 'f3a104eb-4b72-4cf1-8d90-2d8d2cc9dc9b',
            status: 'ACTIVE',
          },
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar compra passada' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Registrar compra passada' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Data da compra')).toBeRequired();
    expect(screen.getByLabelText('Quem comprou')).toBeRequired();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(
      screen.queryByRole('heading', { name: 'Registrar compra passada' }),
    ).not.toBeInTheDocument();
  });
});
