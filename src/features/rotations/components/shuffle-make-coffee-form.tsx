'use client';

import { useActionState } from 'react';
import { shuffleMakeCoffeeRotation } from '@/features/rotations/actions/manage-rotations';
import {
  initialRotationActionState,
  type RotationActionState,
} from '@/features/rotations/purchase-schema';

const feedbackClass = (state: RotationActionState) =>
  state.status === 'error'
    ? 'text-error-600 dark:text-error-400'
    : 'text-success-600 dark:text-success-400';

export function ShuffleMakeCoffeeForm({
  memberCount,
}: {
  memberCount: number;
}) {
  const [state, formAction, isPending] = useActionState(
    shuffleMakeCoffeeRotation,
    initialRotationActionState,
  );
  const requestId = crypto.randomUUID();

  return (
    <form action={formAction} className="mt-5">
      <input name="requestId" type="hidden" value={requestId} />
      <button
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        disabled={isPending || memberCount < 2}
        type="submit"
      >
        {isPending ? 'Embaralhando...' : 'Embaralhar fila'}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${feedbackClass(state)}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
