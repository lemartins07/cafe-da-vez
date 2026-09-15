'use client';

import { useActionState, useState } from 'react';
import { Checkbox } from '@/components/form/checkbox';
import {
  completeCurrentTurn,
  skipCurrentTurn,
} from '@/features/rotations/actions/manage-rotations';
import {
  initialRotationActionState,
  type RotationActionState,
} from '@/features/rotations/purchase-schema';

const feedbackClass = (state: RotationActionState) =>
  state.status === 'error'
    ? 'text-error-600 dark:text-error-400'
    : 'text-success-600 dark:text-success-400';

export function CurrentTurnActions({
  canComplete,
  canManageRotations,
  type,
}: {
  canComplete: boolean;
  canManageRotations: boolean;
  type: 'MAKE_COFFEE' | 'BUY_COFFEE';
}) {
  const [completeState, completeAction, isCompleting] = useActionState(
    completeCurrentTurn,
    initialRotationActionState,
  );
  const [skipState, skipAction, isSkipping] = useActionState(
    skipCurrentTurn,
    initialRotationActionState,
  );
  const [purchasedCoffee, setPurchasedCoffee] = useState(false);
  const [purchasedFilters, setPurchasedFilters] = useState(false);
  const [completeRequestId] = useState(() => crypto.randomUUID());
  const [skipRequestId] = useState(() => crypto.randomUUID());
  const hasItems = purchasedCoffee || purchasedFilters;

  if (!canComplete && !canManageRotations) return null;

  return (
    <div className="mt-5 space-y-3">
      {canComplete ? (
        <form
          action={completeAction}
          className="flex flex-wrap items-end gap-3"
        >
          <input name="requestId" type="hidden" value={completeRequestId} />
          <input name="rotationType" type="hidden" value={type} />
          {type === 'BUY_COFFEE' ? (
            <fieldset className="basis-full">
              <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Itens comprados
              </legend>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                <Checkbox
                  checked={purchasedCoffee}
                  id={`current-purchased-coffee-${type}`}
                  label="Pó de café"
                  name="purchasedCoffee"
                  onChange={(event) => setPurchasedCoffee(event.target.checked)}
                />
                <Checkbox
                  checked={purchasedFilters}
                  id={`current-purchased-filters-${type}`}
                  label="Filtro de café"
                  name="purchasedFilters"
                  onChange={(event) =>
                    setPurchasedFilters(event.target.checked)
                  }
                />
              </div>
            </fieldset>
          ) : null}
          <button
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              isCompleting || isSkipping || (type === 'BUY_COFFEE' && !hasItems)
            }
            type="submit"
          >
            {isCompleting ? 'Concluindo...' : 'Concluir vez'}
          </button>
          {completeState.message ? (
            <p
              aria-live="polite"
              className={`basis-full text-sm ${feedbackClass(completeState)}`}
            >
              {completeState.message}
            </p>
          ) : null}
        </form>
      ) : null}
      {canManageRotations ? (
        <form action={skipAction}>
          <input name="requestId" type="hidden" value={skipRequestId} />
          <input name="rotationType" type="hidden" value={type} />
          <button
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            disabled={isCompleting || isSkipping}
            type="submit"
          >
            {isSkipping ? 'Pulando...' : 'Pular vez'}
          </button>
          {skipState.message ? (
            <p
              aria-live="polite"
              className={`mt-3 text-sm ${feedbackClass(skipState)}`}
            >
              {skipState.message}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
