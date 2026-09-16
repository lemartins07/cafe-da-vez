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

export const processCurrentTurnSchema = z
  .object({
    purchasedCoffee: z.boolean(),
    purchasedFilters: z.boolean(),
    requestId: z.uuid(),
    rotationType: z.enum(['MAKE_COFFEE', 'BUY_COFFEE']),
  })
  .superRefine((data, context) => {
    if (
      data.rotationType === 'BUY_COFFEE' &&
      !data.purchasedCoffee &&
      !data.purchasedFilters
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione pelo menos um item comprado.',
        path: ['purchasedCoffee'],
      });
    }
  });

export const skipCurrentTurnSchema = z.object({
  requestId: z.uuid(),
  rotationType: z.enum(['MAKE_COFFEE', 'BUY_COFFEE']),
});

export type RotationActionState =
  | { message?: string; status: 'idle' }
  | { actionId?: string; message: string; status: 'success' }
  | { message: string; status: 'error' };

export const initialRotationActionState: RotationActionState = {
  status: 'idle',
};
