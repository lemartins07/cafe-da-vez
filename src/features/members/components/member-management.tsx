'use client';

import { useActionState } from 'react';
import { Select } from '@/components/form/select';
import {
  approveJoinRequest,
  rejectJoinRequest,
  updateMember,
} from '@/features/members/actions/manage-members';
import {
  initialMemberActionState,
  type MemberActionState,
} from '@/features/members/member-schema';
import type {
  TeamJoinRequestView,
  TeamMemberView,
} from '@/features/members/queries';

type MemberManagementProps = {
  canManageMembers: boolean;
  members: readonly TeamMemberView[];
  requests: readonly TeamJoinRequestView[];
};

const feedbackClass = (state: MemberActionState) =>
  state.status === 'error'
    ? 'text-error-600 dark:text-error-400'
    : 'text-success-600 dark:text-success-400';

function MemberEditor({ member }: { member: TeamMemberView }) {
  const [state, formAction, isPending] = useActionState(
    updateMember,
    initialMemberActionState,
  );

  return (
    <form
      action={formAction}
      className="mt-3 flex flex-wrap items-center gap-2"
    >
      <input name="profileId" type="hidden" value={member.profileId} />
      <label className="sr-only" htmlFor={`role-${member.profileId}`}>
        Papel de {member.email}
      </label>
      <Select
        defaultValue={member.role}
        id={`role-${member.profileId}`}
        name="role"
      >
        <option value="MEMBER">Integrante</option>
        <option value="ADMIN">Administrador</option>
      </Select>
      <input name="status" type="hidden" value={member.status} />
      <button
        className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        Salvar
      </button>
      <button
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        disabled={isPending}
        name="nextStatus"
        type="submit"
        value={member.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'}
      >
        {member.status === 'ACTIVE' ? 'Pausar' : 'Reativar'}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`basis-full text-sm ${feedbackClass(state)}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function JoinRequestActions({ request }: { request: TeamJoinRequestView }) {
  const [approveState, approveAction, isApproving] = useActionState(
    approveJoinRequest,
    initialMemberActionState,
  );
  const [rejectState, rejectAction, isRejecting] = useActionState(
    rejectJoinRequest,
    initialMemberActionState,
  );

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <form action={approveAction}>
        <input name="requestId" type="hidden" value={request.id} />
        <button
          className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isApproving || isRejecting}
          type="submit"
        >
          {isApproving ? 'Aprovando...' : 'Aprovar'}
        </button>
      </form>
      <form action={rejectAction}>
        <input name="requestId" type="hidden" value={request.id} />
        <button
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          disabled={isApproving || isRejecting}
          type="submit"
        >
          {isRejecting ? 'Recusando...' : 'Recusar'}
        </button>
      </form>
      {approveState.message ? (
        <p
          aria-live="polite"
          className={`basis-full text-sm ${feedbackClass(approveState)}`}
        >
          {approveState.message}
        </p>
      ) : null}
      {rejectState.message ? (
        <p
          aria-live="polite"
          className={`basis-full text-sm ${feedbackClass(rejectState)}`}
        >
          {rejectState.message}
        </p>
      ) : null}
    </div>
  );
}

export function MemberManagement({
  canManageMembers,
  members,
  requests,
}: MemberManagementProps) {
  return (
    <section className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Acompanhe os integrantes do time e as solicitações de entrada.
      </p>

      {canManageMembers ? (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-100 p-5 dark:border-gray-800">
            <h2 className="font-semibold text-gray-800 dark:text-white">
              Solicitações pendentes
            </h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {requests.map((request) => (
              <li className="p-5" key={request.id}>
                <p className="font-medium text-gray-800 dark:text-white">
                  {request.displayName}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {request.email}
                </p>
                <JoinRequestActions request={request} />
              </li>
            ))}
            {requests.length === 0 ? (
              <li className="p-5 text-sm text-gray-500 dark:text-gray-400">
                Não há solicitações pendentes.
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {members.map((member) => (
            <li className="p-5" key={member.email}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {member.displayName}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {member.email}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-300">
                  {member.status === 'PAUSED' ? 'Pausado' : 'Ativo'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {member.role === 'ADMIN' ? 'Administrador' : 'Integrante'}
              </p>
              {canManageMembers ? <MemberEditor member={member} /> : null}
            </li>
          ))}
          {members.length === 0 ? (
            <li className="p-5 text-sm text-gray-500 dark:text-gray-400">
              Nenhum integrante ativo ou pausado ainda.
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
