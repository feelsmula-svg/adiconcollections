import { AdminPageSkeleton } from "@/app/components/admin/admin-page-skeleton";
import { AdminListSkeleton } from "@/app/components/admin/admin-list-skeleton";

export default function Loading() {
  return (
    <AdminPageSkeleton>
      <AdminListSkeleton />
    </AdminPageSkeleton>
  );
}
