import { AccountShell } from "@/app/components/account/account-shell";
import {
  Box,
  Card,
  Heading,
  Icon,
  LinkButton,
  Row,
  Stack,
  Text,
  TextLink,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";

export const dynamic = "force-dynamic";

interface HelpTopic {
  icon: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    icon: "local_shipping",
    title: "Shipping & tracking",
    description:
      "Where your order is, expected delivery dates, signature requirements, and how to update a shipping address.",
    href: "/account/orders",
    cta: "View my orders",
  },
  {
    icon: "assignment_return",
    title: "Returns & refunds",
    description:
      "We accept returns within 30 days of delivery. Contact us to start a return and we’ll guide you through it.",
    href: "/contact",
    cta: "Start a return",
  },
  {
    icon: "person",
    title: "Account & profile",
    description:
      "Update your name, phone number, addresses, or change your password from My Account.",
    href: "/account/profile",
    cta: "Open My Account",
  },
  {
    icon: "payments",
    title: "Payments & billing",
    description:
      "We accept all major cards via secure Stripe checkout. Your card details never touch our servers.",
    href: "/checkout",
    cta: "Go to checkout",
  },
];

interface ContactChannel {
  icon: string;
  label: string;
  value: string;
  href: string;
}

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    icon: "mail",
    label: "Email",
    value: "adiconluxuryhair@yahoo.com",
    href: "mailto:adiconluxuryhair@yahoo.com",
  },
  {
    icon: "call",
    label: "Phone",
    value: "+1 (404) 555-0117",
    href: "tel:+14045550117",
  },
  {
    icon: "schedule",
    label: "Hours",
    value: "Mon–Fri, 9am–6pm ET",
    href: "/contact",
  },
];

export default async function AccountHelpPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <AccountShell user={user} active="help">
      <Stack gap="xs">
        <Text
          variant="label-caps"
          tone="primary"
          as="span"
          className="tracking-[0.2em]"
        >
          Member Support
        </Text>
        <Heading
          level={1}
          variant="display-lg"
          size="headline-md"
          className="md:text-headline-md lg:text-display-lg"
        >
          How can we help?
        </Heading>
        <Box className="max-w-[560px]">
          <Text variant="body-md" tone="muted">
            Browse common topics or reach out to our concierge team — we’re
            here to help with orders, returns, account, and styling questions.
          </Text>
        </Box>
      </Stack>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {HELP_TOPICS.map((topic) => (
          <Card
            key={topic.title}
            variant="outlined"
            padding="lg"
            rounded="2xl"
          >
            <Stack gap="md">
              <Row gap="md" align="start">
                <Box className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <Icon
                    name={topic.icon}
                    filled
                    className="text-on-primary-container text-xl"
                  />
                </Box>
                <Stack gap="xs" className="flex-1">
                  <Heading level={2} variant="headline-sm" size="body-lg">
                    {topic.title}
                  </Heading>
                  <Text variant="body-sm" tone="muted">
                    {topic.description}
                  </Text>
                </Stack>
              </Row>
              <Box>
                <LinkButton
                  href={topic.href}
                  variant="ghost"
                  size="sm"
                  caps={false}
                  className="rounded-full px-0"
                >
                  {topic.cta} →
                </LinkButton>
              </Box>
            </Stack>
          </Card>
        ))}
      </Box>

      <Card variant="tonal" padding="lg" rounded="2xl">
        <Stack gap="md">
          <Row gap="md" align="start">
            <Box className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <Icon
                name="support_agent"
                filled
                className="text-on-secondary-container text-xl"
              />
            </Box>
            <Stack gap="xs" className="flex-1">
              <Heading level={2} variant="headline-sm" size="body-lg">
                Talk to our concierge
              </Heading>
              <Text variant="body-sm" tone="muted">
                Available Monday through Friday, 9am–6pm ET. We typically reply
                to emails within 4 hours during business hours.
              </Text>
            </Stack>
          </Row>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {CONTACT_CHANNELS.map((channel) => (
              <Box
                key={channel.label}
                className="rounded-xl border border-outline-variant bg-surface p-md"
              >
                <Stack gap="xs">
                  <Row gap="xs" align="center">
                    <Icon name={channel.icon} className="text-primary text-lg" />
                    <Text
                      variant="label-caps"
                      tone="muted"
                      as="span"
                      className="tracking-[0.18em]"
                    >
                      {channel.label}
                    </Text>
                  </Row>
                  <TextLink href={channel.href} variant="bare">
                    <Text variant="body-md" className="font-semibold">
                      {channel.value}
                    </Text>
                  </TextLink>
                </Stack>
              </Box>
            ))}
          </Box>
          <Box>
            <LinkButton
              href="/contact"
              variant="primary"
              size="sm"
              caps={false}
              className="rounded-full"
            >
              Send us a message
            </LinkButton>
          </Box>
        </Stack>
      </Card>
    </AccountShell>
  );
}
