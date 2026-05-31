import { AdminPageSkeleton } from "@/app/components/admin/admin-page-skeleton";
import { AdminDashboardSkeleton } from "@/app/components/admin/admin-dashboard-skeleton";

export default function Loading() {
  return (
    <AdminPageSkeleton>
      <AdminDashboardSkeleton />
    </AdminPageSkeleton>
  );
}
