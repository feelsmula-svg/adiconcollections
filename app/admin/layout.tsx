import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getSessionUser } from "@/app/lib/auth/server";
import { AdminFrame } from "@/app/components/admin/admin-frame";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "admin") {
    redirect("/account");
  }
  return <AdminFrame user={user}>{children}</AdminFrame>;
}
