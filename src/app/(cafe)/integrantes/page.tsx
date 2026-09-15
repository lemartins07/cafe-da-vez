import { MemberManagement } from '@/features/members/components/member-management';
import { getCurrentTeamMembers } from '@/features/members/queries';

export default async function MembersPage() {
  const { canManageMembers, members, requests } = await getCurrentTeamMembers();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Integrantes
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie os acessos do time e os papéis de cada pessoa.
        </p>
      </div>
      <MemberManagement
        canManageMembers={canManageMembers}
        members={members}
        requests={requests}
      />
    </>
  );
}
