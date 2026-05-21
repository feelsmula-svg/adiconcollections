import type { Metadata } from "next";

import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { Box } from "@/app/components/ui";
import { ResetPasswordContent } from "./reset-password-content";

export const metadata: Metadata = {
  title: "Reset password — AdiCon Collections",
  description: "Choose a new password for your AdiCon account.",
};

interface ResetPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <>
      <SiteHeader />
      <Box className="flex-1 w-full">
        <ResetPasswordContent token={token} />
      </Box>
      <SiteFooter />
    </>
  );
}
