import type { RotationView } from '@/features/rotations/queries';

function RotationIcon({ type }: { type: RotationView['type'] }) {
  return type === 'MAKE_COFFEE' ? (
    <svg
      aria-hidden="true"
      fill="none"
      height="28"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="28"
    >
      <path d="M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z" />
      <path d="M17 10h1a3 3 0 0 1 0 6h-1M8 4h6M11 4v2" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      fill="none"
      height="28"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="28"
    >
      <path d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H7" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function RotationCard({ rotation }: { rotation: RotationView }) {
  const eligibleMembers = rotation.members.filter(
    (member) => member.active && member.status === 'ACTIVE',
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-[10.5px] bg-brand-50 text-brand-500 dark:bg-brand-500/10">
            <RotationIcon type={rotation.type} />
          </span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Próxima vez
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
              {rotation.name}
            </h2>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
              {rotation.currentMember?.displayName ?? 'Sem participante'}
            </p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {eligibleMembers.length > 0
            ? `${eligibleMembers.length} participante${
                eligibleMembers.length === 1 ? '' : 's'
              } ativo${eligibleMembers.length === 1 ? '' : 's'} nesta fila.`
            : 'Adicione ou reative participantes para iniciar esta fila.'}
        </p>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800">
        <h3 className="px-5 pt-5 text-sm font-medium text-gray-800 sm:px-6 dark:text-white">
          Ordem da fila
        </h3>
        {rotation.members.length > 0 ? (
          <ol className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
            {rotation.members.map((member, index) => (
              <li
                className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6"
                key={member.profileId}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                    {member.displayName}
                  </span>
                </div>
                {!member.active || member.status === 'PAUSED' ? (
                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                    Pausado
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-5 py-5 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
            Nenhum participante nesta fila ainda.
          </p>
        )}
      </div>
    </section>
  );
}

export function RotationList({
  rotations,
}: {
  rotations: readonly RotationView[];
}) {
  return (
    <section>
      <div>
        <p className="text-sm font-medium text-brand-500">Café da Vez</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Filas
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Preparar e comprar café possuem ordens e próximas pessoas
          independentes.
        </p>
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2 xl:gap-6">
        {rotations.map((rotation) => (
          <RotationCard key={rotation.id} rotation={rotation} />
        ))}
      </div>
    </section>
  );
}
