import { redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import { AdminSignupSettingsForm } from "@/app/components/admin/admin-signup-settings-form";
import { PendingAdminsPanel } from "@/app/components/admin/pending-admins-panel";
import { PromoteAdminForm } from "@/app/components/admin/promote-admin-form";
import { RewardsSettingsForm } from "@/app/components/admin/rewards-settings-form";
import {
  Box,
  Card,
  Divider,
  Heading,
  Icon,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { getSessionUser, toPublicUser } from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import { getAdminSignupSettings } from "@/app/lib/settings/admin-signup/actions";
import { getRewardsSettings } from "@/app/lib/settings/rewards/actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const userRepo = await getUserRepository();
  const [
    rewardsSettings,
    adminSignupSettings,
    admins,
    pendingAdmins,
    primaryAdmin,
  ] = await Promise.all([
    getRewardsSettings(),
    getAdminSignupSettings(),
    userRepo.list({ role: "admin", adminStatus: "approved" }),
    userRepo.list({ role: "admin", adminStatus: "pending" }),
    userRepo.findPrimaryAdmin(),
  ]);

  return (
    <AdminShell
      user={user}
      active="settings"
      title="Settings"
      subtitle="Store configuration and admin preferences."
    >
      <Stack gap="xl">
        <AdminSignupSettingsForm settings={adminSignupSettings} />

        <PendingAdminsPanel pending={pendingAdmins.map(toPublicUser)} />

        <PromoteAdminForm
          existingAdmins={admins.map(toPublicUser)}
          primaryAdminId={primaryAdmin?.id ?? null}
          selfUserId={user.id}
        />

        <RewardsSettingsForm settings={rewardsSettings} />

        <Card variant="outlined" padding="lg" rounded="2xl">
          <Stack gap="lg">
            <Stack gap="xs">
              <Heading level={2} variant="headline-sm">
                Store profile
              </Heading>
              <Text variant="body-sm" tone="muted">
                These values are surfaced in customer-facing surfaces (emails,
                footers). They&apos;re read-only here — editing UI is on the
                roadmap.
              </Text>
            </Stack>
            <Stack gap="sm">
              <Row align="center" gap="sm">
                <Text variant="label-caps" tone="muted" as="span">
                  Brand name
                </Text>
                <Text variant="body-md" as="span">
                  Adicon Collections
                </Text>
              </Row>
              <Row align="center" gap="sm">
                <Text variant="label-caps" tone="muted" as="span">
                  Support email
                </Text>
                <Text variant="body-md" as="span">
                  support@adicon.com
                </Text>
              </Row>
              <Row align="center" gap="sm">
                <Text variant="label-caps" tone="muted" as="span">
                  Currency
                </Text>
                <Text variant="body-md" as="span">
                  USD
                </Text>
              </Row>
            </Stack>
            <Divider />
            <Stack gap="xs">
              <Heading level={2} variant="headline-sm">
                Signed in as
              </Heading>
              <Row align="center" gap="sm">
                <Box className="bg-primary-fixed text-primary p-xs rounded-lg">
                  <Icon name="shield_person" />
                </Box>
                <Stack gap="none">
                  <Text variant="body-md" as="span" className="font-semibold">
                    {user.name}
                  </Text>
                  <Text variant="body-sm" tone="muted" as="span">
                    {user.email}
                  </Text>
                </Stack>
              </Row>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </AdminShell>
  );
}
