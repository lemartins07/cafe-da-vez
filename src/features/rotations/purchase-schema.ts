import { z } from 'zod';

const occurredOnSchema = z.iso
  .date()
  .refine((occurredOn) => occurredOn <= new Date().toISOString().slice(0, 10), {
    message: 'A compra não pode estar no futuro.',
  });

export const recordPastPurchaseSchema = z
  .object({
    occurredOn: occurredOnSchema,
    profileId: z.uuid(),
    purchasedCoffee: z.boolean(),
    purchasedFilters: z.boolean(),
    requestId: z.uuid(),
  })
  .refine(
    ({ purchasedCoffee, purchasedFilters }) =>
      purchasedCoffee || purchasedFilters,
    {
      message: 'Selecione pelo menos um item comprado.',
      path: ['purchasedCoffee'],
    },
  );

export const shuffleRotationSchema = z.object({ requestId: z.uuid() });

export type RotationActionState =
  | { message?: string; status: 'idle' }
  | { actionId?: string; message: string; status: 'success' }
  | { message: string; status: 'error' };

export const initialRotationActionState: RotationActionState = {
  status: 'idle',
};
