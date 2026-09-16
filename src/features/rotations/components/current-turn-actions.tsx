'use client';

import { useActionState, useState } from 'react';
import { Checkbox } from '@/components/form/checkbox';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
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

function WarningAlertIcon() {
  return (
    <div className="relative z-1 mb-7 flex items-center justify-center">
      <svg
        aria-hidden="true"
        className="fill-warning-50 dark:fill-warning-500/15"
        fill="none"
        height="90"
        viewBox="0 0 90 90"
        width="90"
      >
        <path d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z" />
      </svg>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          aria-hidden="true"
          className="fill-warning-600 dark:fill-orange-400"
          fill="none"
          height="38"
          viewBox="0 0 38 38"
          width="38"
        >
          <path
            clipRule="evenodd"
            d="M32.1445 19.0002C32.1445 26.2604 26.2589 32.146 18.9987 32.146C11.7385 32.146 5.85287 26.2604 5.85287 19.0002C5.85287 11.7399 11.7385 5.85433 18.9987 5.85433C26.2589 5.85433 32.1445 11.7399 32.1445 19.0002ZM18.9987 35.146C27.9158 35.146 35.1445 27.9173 35.1445 19.0002C35.1445 10.0831 27.9158 2.85433 18.9987 2.85433C10.0816 2.85433 2.85287 10.0831 2.85287 19.0002C2.85287 27.9173 10.0816 35.146 18.9987 35.146ZM21.0001 26.0855C21.0001 24.9809 20.1047 24.0855 19.0001 24.0855L18.9985 24.0855C17.894 24.0855 16.9985 24.9809 16.9985 26.0855C16.9985 27.19 17.894 28.0855 18.9985 28.0855L19.0001 28.0855C20.1047 28.0855 21.0001 27.19 21.0001 26.0855ZM18.9986 10.1829C19.827 10.1829 20.4986 10.8545 20.4986 11.6829L20.4986 20.6707C20.4986 21.4992 19.827 22.1707 18.9986 22.1707C18.1701 22.1707 17.4986 21.4992 17.4986 20.6707L17.4986 11.6829C17.4986 10.8545 18.1701 10.1829 18.9986 10.1829Z"
            fillRule="evenodd"
          />
        </svg>
      </span>
    </div>
  );
}

export function CurrentTurnActions({
  canComplete,
  canManageRotations,
  type,
}: {
  canComplete: boolean;
  canManageRotations: boolean;
  type: 'MAKE_COFFEE' | 'BUY_COFFEE';
}) {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSkipOpen, setIsSkipOpen] = useState(false);
  const [purchasedCoffee, setPurchasedCoffee] = useState(false);
  const [purchasedFilters, setPurchasedFilters] = useState(false);
  const [completeRequestId, setCompleteRequestId] = useState(() =>
    crypto.randomUUID(),
  );
  const [skipRequestId, setSkipRequestId] = useState(() => crypto.randomUUID());
  const hasItems = purchasedCoffee || purchasedFilters;

  const completeWithRefresh = async (
    previousState: RotationActionState,
    formData: FormData,
  ) => {
    const result = await completeCurrentTurn(previousState, formData);

    if (result.status === 'success') {
      setCompleteRequestId(crypto.randomUUID());
    }

    return result;
  };

  const skipWithRefresh = async (
    previousState: RotationActionState,
    formData: FormData,
  ) => {
    const result = await skipCurrentTurn(previousState, formData);

    if (result.status === 'success') {
      setSkipRequestId(crypto.randomUUID());
    }

    return result;
  };

  const [completeState, completeAction, isCompleting] = useActionState(
    completeWithRefresh,
    initialRotationActionState,
  );
  const [skipState, skipAction, isSkipping] = useActionState(
    skipWithRefresh,
    initialRotationActionState,
  );

  if (!canComplete && !canManageRotations) return null;

  const completeLabel =
    type === 'MAKE_COFFEE' ? 'Registrar preparo' : 'Registrar compra';

  return (
    <div className="mt-5 flex flex-wrap items-start gap-3">
      {canComplete && type === 'MAKE_COFFEE' ? (
        <form action={completeAction}>
          <input name="requestId" type="hidden" value={completeRequestId} />
          <input name="rotationType" type="hidden" value={type} />
          <Button disabled={isCompleting || isSkipping} type="submit">
            {isCompleting ? 'Registrando...' : completeLabel}
          </Button>
        </form>
      ) : null}

      {canComplete && type === 'BUY_COFFEE' ? (
        <>
          <Button
            disabled={isCompleting || isSkipping}
            onClick={() => setIsPurchaseOpen(true)}
          >
            {completeLabel}
          </Button>
          <Modal
            isOpen={isPurchaseOpen}
            onClose={() => setIsPurchaseOpen(false)}
          >
            <form action={completeAction} className="space-y-6">
              <div className="pr-12">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  Registrar compra
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Selecione os itens comprados para concluir a vez atual.
                </p>
              </div>
              <input name="requestId" type="hidden" value={completeRequestId} />
              <input name="rotationType" type="hidden" value={type} />
              <fieldset>
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Itens comprados
                </legend>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                  <Checkbox
                    checked={purchasedCoffee}
                    id="current-purchased-coffee"
                    label="Pó de café"
                    name="purchasedCoffee"
                    onChange={(event) =>
                      setPurchasedCoffee(event.target.checked)
                    }
                  />
                  <Checkbox
                    checked={purchasedFilters}
                    id="current-purchased-filters"
                    label="Filtro de café"
                    name="purchasedFilters"
                    onChange={(event) =>
                      setPurchasedFilters(event.target.checked)
                    }
                  />
                </div>
              </fieldset>
              {completeState.message ? (
                <p
                  aria-live="polite"
                  className={`text-sm ${feedbackClass(completeState)}`}
                >
                  {completeState.message}
                </p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  disabled={isCompleting}
                  onClick={() => setIsPurchaseOpen(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button disabled={isCompleting || !hasItems} type="submit">
                  {isCompleting ? 'Confirmando...' : 'Confirmar compra'}
                </Button>
              </div>
            </form>
          </Modal>
        </>
      ) : null}

      {canManageRotations ? (
        <>
          <Button
            disabled={isCompleting || isSkipping}
            onClick={() => setIsSkipOpen(true)}
            variant="outline"
          >
            Pular vez
          </Button>
          <Modal
            className="max-w-[600px] p-5 lg:p-10"
            isOpen={isSkipOpen}
            onClose={() => setIsSkipOpen(false)}
          >
            <form action={skipAction} className="text-center">
              <WarningAlertIcon />
              <div>
                <h2 className="mb-2 text-2xl font-semibold text-gray-800 sm:text-title-sm dark:text-white/90">
                  Pular vez
                </h2>
                <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  A pessoa atual deixará esta vez, e a fila seguirá para a
                  próxima pessoa elegível.
                </p>
              </div>
              <input name="requestId" type="hidden" value={skipRequestId} />
              <input name="rotationType" type="hidden" value={type} />
              {skipState.message ? (
                <p
                  aria-live="polite"
                  className={`mt-4 text-sm ${feedbackClass(skipState)}`}
                >
                  {skipState.message}
                </p>
              ) : null}
              <div className="mt-7 flex w-full flex-wrap items-center justify-center gap-3">
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSkipping}
                  onClick={() => setIsSkipOpen(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSkipping}
                  type="submit"
                  variant="warning"
                >
                  {isSkipping ? 'Pulando...' : 'Confirmar pulo'}
                </Button>
              </div>
            </form>
          </Modal>
        </>
      ) : null}

      {completeState.message &&
      (completeState.status !== 'error' || type === 'MAKE_COFFEE') ? (
        <p
          aria-live="polite"
          className={`basis-full text-sm ${feedbackClass(completeState)}`}
        >
          {completeState.message}
        </p>
      ) : null}
      {skipState.message && skipState.status !== 'error' ? (
        <p
          aria-live="polite"
          className={`basis-full text-sm ${feedbackClass(skipState)}`}
        >
          {skipState.message}
        </p>
      ) : null}
    </div>
  );
}
