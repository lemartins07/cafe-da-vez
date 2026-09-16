import { Badge } from '@/components/ui/badge';
import type { PurchaseHistoryView } from '@/features/rotations/history-queries';

const formatOccurredOn = (occurredOn: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(occurredOn);

export function PurchaseHistoryList({
  purchases,
}: {
  purchases: readonly PurchaseHistoryView[];
}) {
  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-500">Café da Vez</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Histórico de compras
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Compras passadas registradas para a fila de compra do time.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {purchases.length > 0 ? (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {purchases.map((purchase) => (
              <li
                className="flex flex-wrap items-center justify-between gap-4 p-5"
                key={purchase.id}
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {purchase.subjectName}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {formatOccurredOn(purchase.occurredOn)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {purchase.purchasedCoffee ? (
                    <Badge color="primary">Pó de café</Badge>
                  ) : null}
                  {purchase.purchasedFilters ? (
                    <Badge color="success">Filtro de café</Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-sm text-gray-500 dark:text-gray-400">
            Nenhuma compra registrada ainda.
          </p>
        )}
      </div>
    </section>
  );
}
