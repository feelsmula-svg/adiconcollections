import { redirect } from "next/navigation";

import { AdminPage } from "@/app/components/admin/admin-page";
import {
  Badge,
  Box,
  Card,
  Heading,
  Icon,
  LinkButton,
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
  href?: string;
}

function FeatureCard({
  icon,
  title,
  description,
  status,
  href,
}: FeatureCardProps) {
  return (
    <Card
      variant="outlined"
      padding="lg"
      rounded="2xl"
      className="flex-1 min-w-[260px]"
    >
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
        {status === "live" && href ? (
          <Box>
            <LinkButton
              href={href}
              variant="ghost"
              size="sm"
              caps={false}
              className="rounded-full px-0"
            >
              Open →
            </LinkButton>
          </Box>
        ) : null}
      </Stack>
    </Card>
  );
}

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  return (
    <AdminPage
      title="Marketing"
      subtitle="Promotions, discounts, and the levers that drive demand."
    >
      <Row gap="lg" className="flex-wrap">
        <FeatureCard
          icon="campaign"
          title="Campaigns"
          description="Header banner, customer popup modals, and promo codes."
          status="live"
          href="/admin/campaigns"
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
            Tell us which marketing tool you need next and we&apos;ll
            prioritise it.
          </Text>
        </Stack>
      </Card>
    </AdminPage>
  );
}
