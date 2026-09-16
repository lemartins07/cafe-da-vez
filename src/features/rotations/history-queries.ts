import 'server-only';

import { requireActiveMember } from '@/features/auth/authorization';
import { prisma } from '@/lib/prisma';

export type PurchaseHistoryView = {
  id: string;
  occurredOn: Date;
  purchasedCoffee: boolean;
  purchasedFilters: boolean;
  subjectName: string;
};

export async function getCurrentTeamPurchaseHistory(): Promise<
  readonly PurchaseHistoryView[]
> {
  const { membership } = await requireActiveMember();
  const purchases = await prisma.turnEvent.findMany({
    where: {
      action: 'COMPLETED',
      purchasedCoffee: { not: null },
      rotation: {
        is: { teamId: membership.teamId, type: 'BUY_COFFEE' },
      },
    },
    orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      occurredOn: true,
      purchasedCoffee: true,
      purchasedFilters: true,
      subjectName: true,
    },
  });

  return purchases.map((purchase) => ({
    id: purchase.id,
    occurredOn: purchase.occurredOn,
    purchasedCoffee: purchase.purchasedCoffee ?? false,
    purchasedFilters: purchase.purchasedFilters ?? false,
    subjectName: purchase.subjectName,
  }));
}
