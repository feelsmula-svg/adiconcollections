import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getSessionUser } from "@/app/lib/auth/server";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { Box } from "@/app/components/ui";

export const dynamic = "force-dynamic";

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }
  return (
    <>
      <SiteHeader />
      <Box className="flex-1 w-full">{children}</Box>
      <SiteFooter />
    </>
  );
}
