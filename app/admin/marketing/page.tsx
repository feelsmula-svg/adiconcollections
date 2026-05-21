import { redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import {
  Badge,
  Box,
  Card,
  Heading,
  Icon,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  status: "live" | "soon";
}

function FeatureCard({ icon, title, description, status }: FeatureCardProps) {
  return (
    <Card variant="outlined" padding="lg" rounded="2xl" className="flex-1 min-w-[260px]">
      <Stack gap="md">
        <Row align="center" justify="between">
          <Box className="bg-primary-fixed text-primary p-xs rounded-lg">
            <Icon name={icon} />
          </Box>
          <Badge tone={status === "live" ? "primary" : "neutral"}>
            {status === "live" ? "Live" : "Coming soon"}
          </Badge>
        </Row>
        <Stack gap="xs">
          <Heading level={3} variant="headline-sm">
            {title}
          </Heading>
          <Text variant="body-sm" tone="muted">
            {description}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}

export default async function AdminMarketingPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  return (
    <AdminShell
      user={user}
      active="marketing"
      title="Marketing"
      subtitle="Promotions, discounts, and the levers that drive demand."
    >
      <Row gap="lg" className="flex-wrap">
        <FeatureCard
          icon="local_offer"
          title="Discount codes"
          description="Create percent-off and fixed-amount codes with expiry rules."
          status="soon"
        />
        <FeatureCard
          icon="mail"
          title="Email campaigns"
          description="Send transactional and broadcast email from the dashboard."
          status="soon"
        />
        <FeatureCard
          icon="bookmark_add"
          title="Bundle promotions"
          description="Build limited-time bundle deals with auto-applied savings."
          status="soon"
        />
      </Row>

      <Card variant="tonal" padding="lg" rounded="2xl">
        <Stack gap="sm">
          <Heading level={2} variant="headline-sm">
            Looking for something specific?
          </Heading>
          <Text variant="body-md" tone="muted">
            Tell us which marketing tool you need next and we&apos;ll prioritise it.
          </Text>
        </Stack>
      </Card>
    </AdminShell>
  );
}
