'use client';

import { useActionState, useState } from 'react';
import { Checkbox } from '@/components/form/checkbox';
import { Input } from '@/components/form/input';
import { Select } from '@/components/form/select';
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
  const [state, formAction, isPending] = useActionState(
    recordPastPurchase,
    initialRotationActionState,
  );

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-5 py-5 sm:px-6 dark:border-gray-800">
        <h2 className="font-semibold text-gray-800 dark:text-white">
          Registrar compra passada
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Lance os dados já anotados para manter o histórico de compras do time.
        </p>
      </div>
      <form
        action={formAction}
        className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"
      >
        <PurchaseFields
          key={state.status === 'success' ? state.actionId : 'new-purchase'}
          members={members}
        />
        <div className="sm:col-span-2">
          <button
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || members.length === 0}
            type="submit"
          >
            {isPending ? 'Registrando...' : 'Registrar compra'}
          </button>
          {state.message ? (
            <p
              aria-live="polite"
              className={`mt-3 text-sm ${feedbackClass(state)}`}
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

function PurchaseFields({
  members,
}: {
  members: readonly PurchaseParticipant[];
}) {
  const [purchasedCoffee, setPurchasedCoffee] = useState(false);
  const [purchasedFilters, setPurchasedFilters] = useState(false);
  const requestId = crypto.randomUUID();

  return (
    <>
      <input name="requestId" type="hidden" value={requestId} />
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
    </>
  );
}
