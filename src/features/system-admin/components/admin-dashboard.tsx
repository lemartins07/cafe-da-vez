import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SystemAdminDashboard } from '@/features/system-admin/queries';
import { ResetAccessModal } from './reset-access-modal';
import { TeamStatusAction } from './team-status-action';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

const headerClass =
  'px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400';
const cellClass =
  'px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400';

export function AdminDashboard({ accounts, teams }: SystemAdminDashboard) {
  const activeTeams = teams.filter((team) => team.status === 'ACTIVE').length;
  const pendingPasswordChanges = accounts.filter(
    (account) => account.mustChangePassword,
  ).length;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-500">Café da Vez</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Administração do sistema
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Gerencie os times e redefina o acesso das contas cadastradas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Contas', accounts.length],
          ['Times ativos', activeTeams],
          ['Trocas de senha pendentes', pendingPasswordChanges],
        ].map(([label, value]) => (
          <div
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            key={label}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Times
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell className={headerClass} isHeader>
                    Time
                  </TableCell>
                  <TableCell className={headerClass} isHeader>
                    Integrantes
                  </TableCell>
                  <TableCell className={headerClass} isHeader>
                    Cadastro
                  </TableCell>
                  <TableCell className={headerClass} isHeader>
                    Status
                  </TableCell>
                  <TableCell className={headerClass} isHeader>
                    Ação
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className={cellClass}>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {team.name}
                      </span>
                    </TableCell>
                    <TableCell className={cellClass}>
                      {team._count.members}
                    </TableCell>
                    <TableCell className={cellClass}>
                      {dateFormatter.format(team.createdAt)}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <Badge
                        color={team.status === 'ACTIVE' ? 'success' : 'error'}
                      >
                        {team.status === 'ACTIVE' ? 'Ativo' : 'Desativado'}
                      </Badge>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <TeamStatusAction status={team.status} teamId={team.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Contas
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell className={headerClass} isHeader>
                    Conta
                  </TableCell>
                  <TableCell className={headerClass} isHeader>
                    Times
                  </TableCell>
                  <TableCell className={headerClass} isHeader>
                    Papel global
                  </TableCell>
                  <TableCell className={headerClass} isHeader>
                    Acesso
                  </TableCell>
                  <TableCell className={headerClass} isHeader>
                    Ação
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className={cellClass}>
                      <span className="block font-medium text-gray-800 dark:text-white/90">
                        {account.displayName}
                      </span>
                      <span className="mt-1 block text-theme-xs">
                        {account.email}
                      </span>
                    </TableCell>
                    <TableCell className={cellClass}>
                      {account._count.memberships}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <Badge
                        color={
                          account.systemRole === 'SYSTEM_ADMIN'
                            ? 'primary'
                            : 'success'
                        }
                      >
                        {account.systemRole === 'SYSTEM_ADMIN'
                          ? 'Administrador do sistema'
                          : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <Badge
                        color={
                          account.mustChangePassword ? 'warning' : 'success'
                        }
                      >
                        {account.mustChangePassword
                          ? 'Troca de senha pendente'
                          : 'Regular'}
                      </Badge>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <ResetAccessModal
                        displayName={account.displayName}
                        profileId={account.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </section>
  );
}
