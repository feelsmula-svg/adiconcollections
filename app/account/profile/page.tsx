import { AccountShell } from "@/app/components/account/account-shell";
import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  IconButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

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

      <Stack gap="lg">
        <Row
          justify="between"
          align="end"
          className="pb-sm border-b border-outline-variant"
        >
          <Heading
            level={2}
            variant="headline-md"
            size="headline-sm"
            className="md:text-headline-md"
          >
            Personal Details
          </Heading>
          <Button variant="ghost" size="sm" caps={false}>
            Edit profile
          </Button>
        </Row>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <DetailField label="Full name" value={user.name || "Not added"} />
          <DetailField label="Email address" value={user.email} />
          <DetailField label="Phone number" value="+1 (555) 012-3456" />
        </Box>
      </Stack>

      <Stack gap="lg">
        <Row
          justify="between"
          align="end"
          className="pb-sm border-b border-outline-variant"
        >
          <Heading
            level={2}
            variant="headline-md"
            size="headline-sm"
            className="md:text-headline-md"
          >
            Address Book
          </Heading>
          <Button variant="ghost" size="sm" caps={false}>
            + Add new
          </Button>
        </Row>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <AddressCard
            label="Default shipping"
            name={user.name || "—"}
            lines={[
              "1248 Editorial Way, Suite 400",
              "New York, NY 10012",
              "United States",
            ]}
          />
          <AddressCard
            label="Default billing"
            name={user.name || "—"}
            lines={[
              "1248 Editorial Way, Suite 400",
              "New York, NY 10012",
              "United States",
            ]}
          />
        </Box>
      </Stack>
    </AccountShell>
  );
}

interface DetailFieldProps {
  label: string;
  value: string;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <Stack gap="xs">
      <Text
        variant="label-caps"
        tone="muted"
        as="span"
        className="tracking-[0.18em]"
      >
        {label}
      </Text>
      <Text variant="body-lg" className="text-on-surface">
        {value}
      </Text>
    </Stack>
  );
}

interface AddressCardProps {
  label: string;
  name: string;
  lines: string[];
}

function AddressCard({ label, name, lines }: AddressCardProps) {
  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack gap="md">
        <Row justify="between" align="center">
          <Badge tone="neutral" size="sm">
            {label}
          </Badge>
          <Row gap="xs" align="center">
            <IconButton
              icon="edit"
              label={`Edit ${label}`}
              size="sm"
              variant="plain"
            />
            <IconButton
              icon="delete"
              label={`Remove ${label}`}
              size="sm"
              variant="plain"
            />
          </Row>
        </Row>
        <Stack gap="xs">
          <Text variant="body-md" className="font-semibold">
            {name}
          </Text>
          {lines.map((line) => (
            <Text key={line} variant="body-md" tone="muted">
              {line}
            </Text>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
