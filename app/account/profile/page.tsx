import { AccountShell } from "@/app/components/account/account-shell";
import { AddressBookSection } from "@/app/components/account/address-book-section";
import { ChangePasswordSection } from "@/app/components/account/change-password-section";
import { PersonalDetailsSection } from "@/app/components/account/personal-details-section";
import { Box, Heading, Stack, Text } from "@/app/components/ui";
import { listAddresses } from "@/app/lib/addresses/actions";
import { getSessionUser } from "@/app/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const addresses = await listAddresses();

  return (
    <AccountShell user={user} active="profile">
      <Stack gap="xs">
        <Text
          variant="label-caps"
          tone="primary"
          as="span"
          className="tracking-[0.2em]"
        >
          Account Settings
        </Text>
        <Heading
          level={1}
          variant="display-lg"
          size="headline-md"
          className="md:text-headline-md lg:text-display-lg"
        >
          My Account
        </Heading>
        <Box className="max-w-[560px]">
          <Text variant="body-md" tone="muted">
            Update your personal details, saved addresses, and the contact
            information we use to reach you about your orders.
          </Text>
        </Box>
      </Stack>

      <PersonalDetailsSection
        name={user.name}
        email={user.email}
        phone={user.phone}
      />
      <AddressBookSection addresses={addresses} />
      <ChangePasswordSection />
    </AccountShell>
  );
}
