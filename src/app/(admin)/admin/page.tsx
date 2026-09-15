import { AdminDashboard } from '@/features/system-admin/components/admin-dashboard';
import { getSystemAdminDashboard } from '@/features/system-admin/queries';

export default async function AdminPage() {
  const dashboard = await getSystemAdminDashboard();
  return <AdminDashboard {...dashboard} />;
}
