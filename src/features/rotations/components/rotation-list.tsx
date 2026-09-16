import type { RotationView } from '@/features/rotations/queries';
import { CurrentTurnActions } from './current-turn-actions';
import { RecordPastPurchaseForm } from './record-past-purchase-form';
import { ShuffleMakeCoffeeForm } from './shuffle-make-coffee-form';

type RotationParticipant = {
  displayName: string;
  profileId: string;
  status: 'ACTIVE' | 'PAUSED';
};

function ParticipantAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600"
    >
      <span className="text-sm font-medium">{initials}</span>
    </span>
  );
}

function RotationCard({
  canManageRotations,
  rotation,
  viewerProfileId,
}: {
  canManageRotations: boolean;
  rotation: RotationView;
  viewerProfileId: string;
}) {
  const eligibleMembers = rotation.members.filter(
    (member) => member.active && member.status === 'ACTIVE',
  );
  const queue =
    rotation.type === 'BUY_COFFEE'
      ? rotation.upcomingMembers
      : rotation.members.filter(
          (member) => member.active && member.status === 'ACTIVE',
        );
  const upcomingMembers = queue.filter(
    (member) => member.profileId !== rotation.currentMember?.profileId,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-5 sm:p-6">
        <h2 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
          {rotation.name}
        </h2>
        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          É a vez de
        </p>
        <div className="mt-2 flex items-center gap-3">
          {rotation.currentMember ? (
            <ParticipantAvatar name={rotation.currentMember.displayName} />
          ) : null}
          <p className="min-w-0 text-2xl font-semibold break-words text-gray-900 dark:text-white">
            {rotation.currentMember?.displayName ?? 'Sem participante'}
          </p>
        </div>
        <CurrentTurnActions
          canComplete={rotation.canComplete}
          canManageRotations={canManageRotations}
          type={rotation.type}
        />
        {canManageRotations && rotation.type === 'MAKE_COFFEE' ? (
          <ShuffleMakeCoffeeForm memberCount={rotation.members.length} />
        ) : null}
      </div>

      <div className="border-t border-gray-100 px-5 py-5 sm:px-6 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white">
            Na sequência
          </h3>
          <span className="text-theme-xs text-gray-500 dark:text-gray-400">
            {eligibleMembers.length} participante
            {eligibleMembers.length === 1 ? '' : 's'}
          </span>
        </div>
        {upcomingMembers.length > 0 ? (
          <ol className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
            {upcomingMembers.map((member) => (
              <li
                className="flex items-center justify-between gap-3 py-3"
                key={member.profileId}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ParticipantAvatar name={member.displayName} />
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                    {member.displayName}
                  </span>
                </div>
                <span className="shrink-0 text-theme-xs text-gray-500 dark:text-gray-400">
                  {upcomingMembers[0]?.profileId === member.profileId &&
                  member.profileId === viewerProfileId
                    ? 'Você é o próximo'
                    : member.profileId === viewerProfileId
                      ? 'Você'
                      : ''}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {eligibleMembers.length > 0
              ? 'Não há outra pessoa na sequência.'
              : 'Adicione ou reative participantes para iniciar esta fila.'}
          </p>
        )}
      </div>
    </section>
  );
}

export function RotationList({
  canManageRotations,
  members,
  rotations,
  viewerProfileId,
}: {
  canManageRotations: boolean;
  members: readonly RotationParticipant[];
  rotations: readonly RotationView[];
  viewerProfileId: string;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-500">Café da Vez</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            De quem é a vez?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Acompanhe as filas independentes de preparo e de compra.
          </p>
        </div>
        {canManageRotations ? (
          <RecordPastPurchaseForm members={members} />
        ) : null}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2 xl:gap-6">
        {rotations.map((rotation) => (
          <RotationCard
            canManageRotations={canManageRotations}
            key={rotation.id}
            rotation={rotation}
            viewerProfileId={viewerProfileId}
          />
        ))}
      </div>
    </section>
  );
}
