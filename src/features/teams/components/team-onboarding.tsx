'use client';

import { useActionState } from 'react';
import { Input } from '@/components/form/input';
import {
  createTeam,
  requestToJoinTeam,
  selectActiveTeam,
} from '@/features/teams/actions/manage-teams';
import {
  initialTeamActionState,
  type TeamActionState,
} from '@/features/teams/team-schema';
import type { DiscoverableTeam } from '@/features/teams/queries';

type Membership = {
  role: 'ADMIN' | 'MEMBER';
  status: 'ACTIVE' | 'PAUSED';
  team: { id: string; name: string };
};

const feedbackClass = (state: TeamActionState) =>
  state.status === 'error'
    ? 'text-error-600 dark:text-error-400'
    : 'text-success-600 dark:text-success-400';

function CreateTeamForm() {
  const [state, formAction, pending] = useActionState(
    createTeam,
    initialTeamActionState,
  );

  return (
    <form action={formAction} className="mt-4 flex flex-wrap gap-3">
      <label className="sr-only" htmlFor="team-name">
        Nome do time
      </label>
      <Input
        className="min-w-56 flex-1"
        id="team-name"
        name="name"
        placeholder="Ex.: Café do 8º andar"
        required
      />
      <button
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Criando...' : 'Criar time'}
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

function JoinTeamButton({ team }: { team: DiscoverableTeam }) {
  const [state, formAction, pending] = useActionState(
    requestToJoinTeam,
    initialTeamActionState,
  );
  const pendingRequest = team.requestStatus === 'PENDING';

  return (
    <form action={formAction} className="mt-3">
      <input name="teamId" type="hidden" value={team.id} />
      <button
        className="rounded-lg border border-brand-500 px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300 dark:hover:bg-brand-500/10"
        disabled={pending || pendingRequest}
        type="submit"
      >
        {pending
          ? 'Enviando...'
          : pendingRequest
            ? 'Solicitação pendente'
            : 'Solicitar entrada'}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-2 text-sm ${feedbackClass(state)}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function TeamOnboarding({
  memberships,
  query,
  teams,
}: {
  memberships: readonly Membership[];
  query: string;
  teams: readonly DiscoverableTeam[];
}) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <p className="text-sm font-medium text-brand-500">Café da Vez</p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
        Escolha ou crie um time
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
        Você só acessa filas e integrantes depois de participar de um time
        ativo.
      </p>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Criar um novo time
        </h2>
        <CreateTeamForm />
      </section>

      {memberships.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Seus times
          </h2>
          <ul className="mt-4 space-y-3">
            {memberships.map((membership) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 p-4 dark:border-gray-800"
                key={membership.team.id}
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {membership.team.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {membership.status === 'PAUSED'
                      ? 'Acesso pausado'
                      : membership.role === 'ADMIN'
                        ? 'Administrador'
                        : 'Integrante'}
                  </p>
                </div>
                {membership.status === 'ACTIVE' ? (
                  <form action={selectActiveTeam}>
                    <input
                      name="teamId"
                      type="hidden"
                      value={membership.team.id}
                    />
                    <button
                      className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
                      type="submit"
                    >
                      Acessar
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Encontrar um time
        </h2>
        <form action="/times" className="mt-4 flex gap-3">
          <label className="sr-only" htmlFor="team-search">
            Buscar por nome
          </label>
          <Input
            defaultValue={query}
            id="team-search"
            name="q"
            placeholder="Digite o nome do time"
            type="search"
          />
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            type="submit"
          >
            Buscar
          </button>
        </form>
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
          {teams.map((team) => (
            <li className="py-4" key={team.id}>
              <p className="font-medium text-gray-800 dark:text-white">
                {team.name}
              </p>
              <JoinTeamButton team={team} />
            </li>
          ))}
          {teams.length === 0 ? (
            <li className="py-4 text-sm text-gray-500 dark:text-gray-400">
              Nenhum time encontrado.
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
