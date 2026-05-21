import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Box } from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";

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
  return (
    <Box className="min-h-screen bg-background text-on-background">
      {children}
    </Box>
  );
}
