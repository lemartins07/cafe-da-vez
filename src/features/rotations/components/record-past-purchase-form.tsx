'use client';

import { useActionState, useState } from 'react';
import { Checkbox } from '@/components/form/checkbox';
import { Input } from '@/components/form/input';
import { Select } from '@/components/form/select';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { recordPastPurchase } from '@/features/rotations/actions/manage-rotations';
import {
  initialRotationActionState,
  type RotationActionState,
} from '@/features/rotations/purchase-schema';

type PurchaseParticipant = {
  displayName: string;
  profileId: string;
  status: 'ACTIVE' | 'PAUSED';
};

const feedbackClass = (state: RotationActionState) =>
  state.status === 'error'
    ? 'text-error-600 dark:text-error-400'
    : 'text-success-600 dark:text-success-400';

const today = new Date().toISOString().slice(0, 10);

export function RecordPastPurchaseForm({
  members,
}: {
  members: readonly PurchaseParticipant[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    recordPastPurchase,
    initialRotationActionState,
  );

  return (
    <>
      <Button
        disabled={members.length === 0}
        onClick={() => setIsOpen(true)}
        variant="outline"
      >
        Registrar compra passada
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form action={formAction} className="space-y-6">
          <div className="pr-12">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
              Registrar compra passada
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Informe os dados já anotados para manter o histórico de compras do
              time.
            </p>
          </div>
          <PurchaseFields
            key={state.status === 'success' ? state.actionId : 'new-purchase'}
            members={members}
          />
          {state.message ? (
            <p aria-live="polite" className={`text-sm ${feedbackClass(state)}`}>
              {state.message}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              disabled={isPending}
              onClick={() => setIsOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button disabled={isPending || members.length === 0} type="submit">
              {isPending ? 'Salvando...' : 'Salvar registro'}
            </Button>
          </div>
        </form>
      </Modal>
      {state.status === 'success' && state.message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${feedbackClass(state)}`}
        >
          {state.message}
        </p>
      ) : null}
    </>
  );
}

function PurchaseFields({
  members,
}: {
  members: readonly PurchaseParticipant[];
}) {
  const [purchasedCoffee, setPurchasedCoffee] = useState(false);
  const [purchasedFilters, setPurchasedFilters] = useState(false);
  const [requestId] = useState(() => crypto.randomUUID());

  return (
    <>
      <input name="requestId" type="hidden" value={requestId} />
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="purchase-date"
        >
          Data da compra
          <Input
            defaultValue={today}
            id="purchase-date"
            max={today}
            name="occurredOn"
            required
            type="date"
          />
        </label>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="purchase-member"
        >
          Quem comprou
          <Select
            disabled={members.length === 0}
            id="purchase-member"
            name="profileId"
            required
          >
            <option value="">Selecione uma pessoa</option>
            {members.map((member) => (
              <option key={member.profileId} value={member.profileId}>
                {member.displayName}
                {member.status === 'PAUSED' ? ' (pausado)' : ''}
              </option>
            ))}
          </Select>
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Itens comprados
          </legend>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            <Checkbox
              checked={purchasedCoffee}
              id="purchased-coffee"
              label="Pó de café"
              name="purchasedCoffee"
              onChange={(event) => setPurchasedCoffee(event.target.checked)}
            />
            <Checkbox
              checked={purchasedFilters}
              id="purchased-filters"
              label="Filtro de café"
              name="purchasedFilters"
              onChange={(event) => setPurchasedFilters(event.target.checked)}
            />
          </div>
        </fieldset>
      </div>
    </>
  );
}
