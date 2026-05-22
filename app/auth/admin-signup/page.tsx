import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import {
  Box,
  Card,
  Container,
  Heading,
  Icon,
  Section,
  Stack,
  Text,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import { getAdminSignupSettings } from "@/app/lib/settings/admin-signup/actions";
import { AdminSignupForm } from "./admin-signup-form";

export const metadata: Metadata = {
  title: "Admin sign up — AdiCon Collections",
};

export const dynamic = "force-dynamic";

export default async function AdminSignupPage() {
  const [user, settings] = await Promise.all([
    getSessionUser(),
    getAdminSignupSettings(),
  ]);

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/account");
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <Section padding="lg">
          <Container width="default">
            <Box className="max-w-[520px] mx-auto w-full">
              <Card variant="elevated" padding="xl" rounded="xl">
                <Stack gap="lg">
                  <Stack gap="xs" align="center">
                    <Box className="w-14 h-14 rounded-full bg-primary-fixed border border-outline-variant flex items-center justify-center">
                      <Icon
                        name="shield_person"
                        filled
                        className="text-primary text-2xl"
                      />
                    </Box>
                    <Text
                      variant="label-caps"
                      tone="primary"
                      as="span"
                      className="tracking-[0.2em]"
                    >
                      Admin Console
                    </Text>
                    <Heading
                      level={1}
                      variant="headline-md"
                      align="center"
                    >
                      Create an admin account
                    </Heading>
                    <Text variant="body-sm" tone="muted" align="center">
                      {settings.enabled
                        ? settings.inviteCode.length > 0
                          ? "Admin signup is currently open by invitation only. Enter your invite code below."
                          : "Admin signup is currently open."
                        : "Admin signup is currently disabled. Please contact an existing admin for access."}
                    </Text>
                  </Stack>

                  {settings.enabled ? (
                    <AdminSignupForm
                      requiresInviteCode={settings.inviteCode.length > 0}
                    />
                  ) : (
                    <Box className="rounded-xl border border-dashed border-outline-variant p-md">
                      <Stack gap="xs" align="center">
                        <Icon name="lock" className="text-on-surface-variant" />
                        <Text variant="body-sm" tone="muted" align="center">
                          When an existing admin enables signup from the admin
                          settings, this page will accept new admin accounts.
                        </Text>
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Card>
            </Box>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
