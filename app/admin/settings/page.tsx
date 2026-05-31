import { redirect } from "next/navigation";

import { ChangePasswordSection } from "@/app/components/account/change-password-section";
import { AdminPage } from "@/app/components/admin/admin-page";
import { AdminSignupSettingsForm } from "@/app/components/admin/admin-signup-settings-form";
import { PendingAdminsPanel } from "@/app/components/admin/pending-admins-panel";
import { PromoteAdminForm } from "@/app/components/admin/promote-admin-form";
import { RewardsSettingsForm } from "@/app/components/admin/rewards-settings-form";
import { ShippingSettingsForm } from "@/app/components/admin/shipping-settings-form";
import { StoreProfileForm } from "@/app/components/admin/store-profile-form";
import {
  Box,
  Card,
  Heading,
  Icon,
  Row,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTrigger,
  Text,
} from "@/app/components/ui";
import { getSessionUser, toPublicUser } from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import { getAdminSignupSettings } from "@/app/lib/settings/admin-signup/actions";
import { getRewardsSettings } from "@/app/lib/settings/rewards/actions";
import { getShippingSettings } from "@/app/lib/settings/shipping/actions";
import { getStoreProfile } from "@/app/lib/settings/store-profile/actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const userRepo = await getUserRepository();
  const [
    rewardsSettings,
    shippingSettings,
    adminSignupSettings,
    storeProfile,
    admins,
    pendingAdmins,
    primaryAdmin,
  ] = await Promise.all([
    getRewardsSettings(),
    getShippingSettings(),
    getAdminSignupSettings(),
    getStoreProfile(),
    userRepo.list({ role: "admin", adminStatus: "approved" }),
    userRepo.list({ role: "admin", adminStatus: "pending" }),
    userRepo.findPrimaryAdmin(),
  ]);

  const pendingCount = pendingAdmins.length;

  return (
    <AdminPage
      title="Settings"
      subtitle="Store configuration and admin preferences."
    >
      <Tabs defaultValue="store" ariaLabel="Settings sections">
        <TabsList ariaLabel="Settings sections">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger
            value="admins"
            count={pendingCount > 0 ? pendingCount : undefined}
          >
            Admins
          </TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsPanel value="store">
          <StoreProfileForm settings={storeProfile} />
        </TabsPanel>

        <TabsPanel value="shipping">
          <ShippingSettingsForm settings={shippingSettings} />
        </TabsPanel>

        <TabsPanel value="rewards">
          <RewardsSettingsForm settings={rewardsSettings} />
        </TabsPanel>

        <TabsPanel value="admins">
          <Stack gap="xl">
            <AdminSignupSettingsForm settings={adminSignupSettings} />
            <PendingAdminsPanel pending={pendingAdmins.map(toPublicUser)} />
            <PromoteAdminForm
              existingAdmins={admins.map(toPublicUser)}
              primaryAdminId={primaryAdmin?.id ?? null}
              selfUserId={user.id}
            />
          </Stack>
        </TabsPanel>

        <TabsPanel value="account">
          <Stack gap="xl">
            <Card variant="outlined" padding="lg" rounded="2xl">
              <Stack gap="xs">
                <Heading level={2} variant="headline-sm">
                  Signed in as
                </Heading>
                <Row align="center" gap="sm">
                  <Box className="bg-primary-fixed text-primary p-xs rounded-lg">
                    <Icon name="shield_person" />
                  </Box>
                  <Stack gap="none">
                    <Text
                      variant="body-md"
                      as="span"
                      className="font-semibold"
                    >
                      {user.name}
                    </Text>
                    <Text variant="body-sm" tone="muted" as="span">
                      {user.email}
                    </Text>
                  </Stack>
                </Row>
              </Stack>
            </Card>

            <Card variant="outlined" padding="lg" rounded="2xl">
              <ChangePasswordSection />
            </Card>
          </Stack>
        </TabsPanel>
      </Tabs>
    </AdminPage>
  );
}
