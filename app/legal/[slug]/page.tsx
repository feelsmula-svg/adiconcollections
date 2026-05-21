import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Box,
  Card,
  Container,
  Heading,
  Icon,
  Row,
  Section,
  Stack,
  Text,
  TextLink,
} from "@/app/components/ui";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";

interface LegalPageMeta {
  slug: string;
  title: string;
  summary: string;
}

const LEGAL_PAGES: LegalPageMeta[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    summary:
      "How AdiCon Collections collects, stores, and uses your personal information across the storefront and our communications.",
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    summary:
      "Eligibility, timeframes, and the step-by-step process for returns, exchanges, and refunds on AdiCon Collections orders.",
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    summary:
      "Processing times, carriers, delivery estimates, and international shipping for orders placed with AdiCon Collections.",
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    summary:
      "The terms that govern your use of the AdiCon Collections storefront, account, and post-purchase services.",
  },
];

function findPage(slug: string): LegalPageMeta | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return LEGAL_PAGES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) {
    return { title: "Legal — AdiCon Collections" };
  }
  return {
    title: `${page.title} — AdiCon Collections`,
    description: page.summary,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full">
        <Container width="default">
          <Section padding="md">
            <Stack gap="xl" className="w-full">
              <Box className="w-full">
                <Row gap="sm" align="center" wrap className="mb-md">
                  <TextLink
                    href="/"
                    variant="muted"
                    className="text-label-caps font-label-caps uppercase"
                  >
                    Home
                  </TextLink>
                  <Icon
                    name="chevron_right"
                    className="text-sm text-outline-variant"
                  />
                  <Text variant="label-caps" tone="primary">
                    {page.title}
                  </Text>
                </Row>
                <Box className="max-w-2xl">
                  <Heading
                    level={1}
                    variant="display-xl"
                    size="headline-md"
                    className="leading-tight mb-sm"
                  >
                    {page.title}
                  </Heading>
                  <Text variant="body-md" tone="muted">
                    {page.summary}
                  </Text>
                </Box>
              </Box>

              <Card variant="elevated" padding="lg">
                <Stack gap="md">
                  <Heading level={2} variant="headline-sm">
                    Full policy coming soon
                  </Heading>
                  <Text variant="body-md" tone="muted">
                    We are finalizing this document. In the meantime, our
                    concierge team is happy to walk you through any specifics
                    over email or phone.
                  </Text>
                  <Row gap="sm" align="center" wrap>
                    <TextLink href="/contact" variant="default">
                      Contact concierge
                    </TextLink>
                    <Icon
                      name="chevron_right"
                      className="text-sm text-outline-variant"
                    />
                    <TextLink href="/" variant="muted">
                      Continue shopping
                    </TextLink>
                  </Row>
                </Stack>
              </Card>
            </Stack>
          </Section>
        </Container>
      </main>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
