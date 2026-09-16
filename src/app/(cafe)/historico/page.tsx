import { PurchaseHistoryList } from '@/features/rotations/components/purchase-history-list';
import { getCurrentTeamPurchaseHistory } from '@/features/rotations/history-queries';

export default async function HistoryPage() {
  const purchases = await getCurrentTeamPurchaseHistory();

  return <PurchaseHistoryList purchases={purchases} />;
}
