"use client";

import type { ReactNode } from "react";

import { Box, Stack } from "@/app/components/ui";

import { AdminTopBar } from "./admin-top-bar";
import { AdminFooter } from "./admin-footer";
import { useAdminNav } from "./admin-frame";

interface AdminPageProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/**
 * Per-page admin content: the sticky top bar (with the page's own title) above
 * the padded content column and footer. The sidebar itself lives in the layout
 * (`AdminFrame`), so this renders inside the persistent content area.
 */
export function AdminPage({ title, subtitle, children }: AdminPageProps) {
  const { openNav, selfUserId } = useAdminNav();
  return (
    <>
      <AdminTopBar
        title={title}
        subtitle={subtitle}
        onMenuClick={openNav}
        selfUserId={selfUserId}
      />
      <Box className="flex-grow px-md py-md sm:px-lg sm:py-lg md:px-xl md:py-xl lg:px-2xl">
        <Stack gap="lg" className="md:gap-xl">
          {children}
        </Stack>
      </Box>
      <AdminFooter />
    </>
  );
}
