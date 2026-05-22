"use client";

import {
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  FormField,
  Heading,
  Icon,
  IconButton,
  LinkButton,
  Row,
  Select,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
} from "@/app/lib/campaigns/actions";
import type {
  Campaign,
  CampaignDiscountType,
} from "@/app/lib/campaigns/types";

interface PromoCodesManagerProps {
  campaigns: Campaign[];
}

interface DraftState {
  promoCode: string;
  discountType: CampaignDiscountType;
  discountValue: string;
  minSubtotal: string;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
}

const EMPTY_DRAFT: DraftState = {
  promoCode: "",
  discountType: "percent",
  discountValue: "",
  minSubtotal: "",
  startsAt: "",
  endsAt: "",
  enabled: true,
};

function randomCode(): string {
  // Friendly 6-char alphanumeric — uppercase, no easily confused chars.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function formatDiscount(campaign: Campaign): string {
  if (!campaign.discount) return "No discount";
  if (campaign.discount.type === "percent")
    return `${campaign.discount.value}% off`;
  if (campaign.discount.type === "fixed")
    return `$${(campaign.discount.value / 100).toFixed(2)} off`;
  return "Free shipping";
}

function formatMinSubtotal(campaign: Campaign): string | null {
  if (!campaign.discount || campaign.discount.minSubtotalCents <= 0) return null;
  return `Min subtotal $${(campaign.discount.minSubtotalCents / 100).toFixed(2)}`;
}

function formatRange(campaign: Campaign): string | null {
  if (!campaign.startsAt && !campaign.endsAt) return null;
  if (campaign.startsAt && campaign.endsAt) {
    return `${campaign.startsAt} → ${campaign.endsAt}`;
  }
  return campaign.startsAt
    ? `From ${campaign.startsAt}`
    : `Until ${campaign.endsAt}`;
}

export function PromoCodesManager({ campaigns }: PromoCodesManagerProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const promoCampaigns = campaigns.filter(
    (c) => c.promoCode && c.promoCode.length > 0,
  );

  const patch = <K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const errorFor = (key: string): string | undefined => fieldErrors[key]?.[0];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage(null);
    setFeedback(null);
    setFieldErrors({});

    const code = draft.promoCode.trim().toUpperCase();
    if (!code) {
      setErrorMessage("Enter or generate a promo code.");
      setFieldErrors({ promoCode: ["Enter or generate a promo code."] });
      return;
    }
    const discount = buildDiscount(
      draft.discountType,
      draft.discountValue,
      draft.minSubtotal,
    );
    if (!discount) {
      setErrorMessage("Enter a discount value greater than 0.");
      setFieldErrors({
        discountValue: ["Enter a discount value greater than 0."],
      });
      return;
    }

    const payload = {
      name: `Promo · ${code}`,
      promoCode: code,
      discount,
      startsAt: draft.startsAt,
      endsAt: draft.endsAt,
      enabled: draft.enabled,
      showInHeader: false,
      showModal: false,
      headerText: "",
      modalTitle: "",
      modalBody: "",
      ctaLabel: "",
      ctaHref: "",
    };

    startTransition(async () => {
      const result = await createCampaign(payload);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not save promo code");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        return;
      }
      setDraft(EMPTY_DRAFT);
      setFeedback(`Code ${code} created.`);
      router.refresh();
    });
  };

  const toggleEnabled = (campaign: Campaign) => {
    if (busyId) return;
    setBusyId(campaign.id);
    setRowError(null);
    startTransition(async () => {
      const next = !campaign.enabled;
      const result = await updateCampaign(campaign.id, {
        name: campaign.name,
        headerText: campaign.headerText ?? "",
        modalTitle: campaign.modalTitle ?? "",
        modalBody: campaign.modalBody ?? "",
        ctaLabel: campaign.ctaLabel ?? "",
        ctaHref: campaign.ctaHref ?? "",
        promoCode: campaign.promoCode ?? "",
        discount: campaign.discount,
        showInHeader: campaign.showInHeader,
        showModal: campaign.showModal,
        enabled: next,
        startsAt: campaign.startsAt ?? "",
        endsAt: campaign.endsAt ?? "",
      });
      setBusyId(null);
      if (!result.ok) {
        setRowError(result.error ?? "Could not update promo code");
        return;
      }
      router.refresh();
    });
  };

  const removePromo = (campaign: Campaign) => {
    if (busyId) return;
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Delete promo code ${campaign.promoCode}? This cannot be undone.`,
      );
      if (!confirmed) return;
    }
    setBusyId(campaign.id);
    setRowError(null);
    startTransition(async () => {
      const result = await deleteCampaign(campaign.id);
      setBusyId(null);
      if (!result.ok) {
        setRowError(result.error ?? "Could not delete promo code");
        return;
      }
      router.refresh();
    });
  };

  const copyCode = async (campaign: Campaign) => {
    if (!campaign.promoCode) return;
    try {
      await navigator.clipboard.writeText(campaign.promoCode);
      setCopiedId(campaign.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setRowError("Couldn't copy — your browser blocked clipboard access.");
    }
  };

  return (
    <Stack gap="xl">
      <Card variant="outlined" padding="lg" rounded="2xl">
        <form onSubmit={onSubmit} noValidate>
          <Stack gap="lg">
            <Row align="center" gap="sm">
              <Box className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <Icon
                  name="confirmation_number"
                  filled
                  className="text-on-primary-container"
                />
              </Box>
              <Stack gap="none" className="flex-1">
                <Heading level={2} variant="headline-sm">
                  Generate a promo code
                </Heading>
                <Text variant="body-sm" tone="muted">
                  Pick a discount and either type a code or generate one.
                  Customers enter the code at checkout to claim the deal.
                </Text>
              </Stack>
            </Row>

            <Box className="grid grid-cols-1 md:grid-cols-[2fr_auto] items-end gap-md">
              <FormField
                label="Promo code"
                required
                error={errorFor("promoCode")}
              >
                <TextField
                  value={draft.promoCode}
                  onChange={(event) =>
                    patch(
                      "promoCode",
                      event.target.value.toUpperCase().replace(/\s+/g, ""),
                    )
                  }
                  placeholder="SUMMER25"
                  disabled={pending}
                  maxLength={40}
                  required
                />
              </FormField>
              <Button
                type="button"
                variant="outline"
                size="md"
                caps={false}
                onClick={() => patch("promoCode", randomCode())}
                disabled={pending}
              >
                <Icon name="auto_awesome" className="text-lg mr-xs" />
                Generate
              </Button>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-3 items-start gap-md">
              <FormField label="Discount type">
                <Select
                  value={draft.discountType}
                  onChange={(event) =>
                    patch(
                      "discountType",
                      event.target.value as CampaignDiscountType,
                    )
                  }
                  options={[
                    { value: "percent", label: "Percent off subtotal" },
                    { value: "fixed", label: "Fixed amount off subtotal" },
                    { value: "free-shipping", label: "Free shipping" },
                  ]}
                  disabled={pending}
                />
              </FormField>
              <FormField
                label={
                  draft.discountType === "percent"
                    ? "Percent (0–100)"
                    : draft.discountType === "fixed"
                      ? "Amount (USD)"
                      : "Value"
                }
                hint={
                  draft.discountType === "free-shipping"
                    ? "Not used for free shipping."
                    : draft.discountType === "percent"
                      ? "Whole numbers only."
                      : "In dollars."
                }
                error={errorFor("discountValue") ?? errorFor("discount")}
              >
                <TextField
                  type="number"
                  step={draft.discountType === "fixed" ? "0.01" : "1"}
                  min="0"
                  value={draft.discountValue}
                  onChange={(event) =>
                    patch("discountValue", event.target.value)
                  }
                  disabled={pending || draft.discountType === "free-shipping"}
                  placeholder={
                    draft.discountType === "percent" ? "25" : "10.00"
                  }
                />
              </FormField>
              <FormField
                label="Minimum subtotal (USD)"
                hint="0 = no minimum."
                error={errorFor("minSubtotal")}
              >
                <TextField
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.minSubtotal}
                  onChange={(event) =>
                    patch("minSubtotal", event.target.value)
                  }
                  disabled={pending}
                  placeholder="150.00"
                />
              </FormField>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 items-start gap-md">
              <FormField
                label="Starts at"
                hint="Optional (yyyy-mm-dd)."
                error={errorFor("startsAt")}
              >
                <TextField
                  type="date"
                  value={draft.startsAt}
                  onChange={(event) => patch("startsAt", event.target.value)}
                  disabled={pending}
                />
              </FormField>
              <FormField
                label="Ends at"
                hint="Optional (yyyy-mm-dd)."
                error={errorFor("endsAt")}
              >
                <TextField
                  type="date"
                  value={draft.endsAt}
                  onChange={(event) => patch("endsAt", event.target.value)}
                  disabled={pending}
                />
              </FormField>
            </Box>

            <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <Checkbox
                checked={draft.enabled}
                onChange={(checked) => patch("enabled", checked)}
                disabled={pending}
                label="Code is active right away"
              />
            </Box>

            {errorMessage ? (
              <Text variant="body-sm" tone="error">
                {errorMessage}
              </Text>
            ) : null}
            {feedback ? (
              <Text variant="body-sm" tone="primary">
                {feedback}
              </Text>
            ) : null}

            <Row justify="end" gap="sm">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                caps={false}
                disabled={pending}
                className="rounded-full"
              >
                {pending ? "Saving…" : "Create promo code"}
              </Button>
            </Row>
          </Stack>
        </form>
      </Card>

      <Stack gap="sm">
        <Row justify="between" align="end" gap="sm" wrap>
          <Stack gap="none">
            <Heading level={2} variant="headline-sm">
              Active codes ({promoCampaigns.length})
            </Heading>
            <Text variant="body-sm" tone="muted">
              Need to attach a banner or modal to one of these? Open it as a
              full campaign.
            </Text>
          </Stack>
        </Row>

        {rowError ? (
          <Text variant="body-sm" tone="error">
            {rowError}
          </Text>
        ) : null}

        {promoCampaigns.length === 0 ? (
          <Card variant="outlined" padding="lg" rounded="2xl">
            <Stack gap="sm" align="center" className="text-center py-md">
              <Icon
                name="local_offer"
                className="text-primary text-3xl"
              />
              <Text variant="body-md" className="font-semibold">
                No promo codes yet
              </Text>
              <Text variant="body-sm" tone="muted">
                Use the form above to generate your first one.
              </Text>
            </Stack>
          </Card>
        ) : (
          <Stack gap="xs">
            {promoCampaigns.map((campaign) => {
              const minLabel = formatMinSubtotal(campaign);
              const rangeLabel = formatRange(campaign);
              const isBusy = busyId === campaign.id;
              const copied = copiedId === campaign.id;
              return (
                <Card
                  key={campaign.id}
                  variant="outlined"
                  padding="lg"
                  rounded="2xl"
                >
                  <Stack gap="sm">
                    <Row justify="between" align="start" gap="sm" wrap>
                      <Stack gap="none" className="min-w-0 flex-1">
                        <Row gap="xs" align="center" wrap>
                          <Text
                            variant="body-lg"
                            as="span"
                            className="font-display-xl tracking-[0.24em] font-semibold"
                          >
                            {campaign.promoCode}
                          </Text>
                          <Badge
                            tone={campaign.enabled ? "primary" : "neutral"}
                            size="sm"
                          >
                            {campaign.enabled ? "Active" : "Disabled"}
                          </Badge>
                          <Badge tone="tertiary" size="sm">
                            {formatDiscount(campaign)}
                          </Badge>
                          {campaign.showInHeader ? (
                            <Badge tone="secondary" size="sm">
                              Header
                            </Badge>
                          ) : null}
                          {campaign.showModal ? (
                            <Badge tone="secondary" size="sm">
                              Modal
                            </Badge>
                          ) : null}
                        </Row>
                        <Row gap="xs" align="center" wrap>
                          {minLabel ? (
                            <Text variant="body-sm" tone="muted">
                              {minLabel}
                            </Text>
                          ) : null}
                          {rangeLabel ? (
                            <Text variant="body-sm" tone="muted">
                              · {rangeLabel}
                            </Text>
                          ) : null}
                        </Row>
                      </Stack>
                      <Row gap="xs" align="center">
                        <IconButton
                          icon={copied ? "check" : "content_copy"}
                          label={`Copy ${campaign.promoCode}`}
                          size="sm"
                          variant="plain"
                          onClick={() => copyCode(campaign)}
                          disabled={isBusy}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          caps={false}
                          onClick={() => toggleEnabled(campaign)}
                          disabled={isBusy}
                        >
                          {isBusy
                            ? "…"
                            : campaign.enabled
                              ? "Disable"
                              : "Enable"}
                        </Button>
                        <LinkButton
                          href={`/admin/campaigns`}
                          variant="ghost"
                          size="sm"
                          caps={false}
                        >
                          Open as campaign
                        </LinkButton>
                        <IconButton
                          icon="delete"
                          label={`Delete ${campaign.promoCode}`}
                          size="sm"
                          variant="plain"
                          onClick={() => removePromo(campaign)}
                          disabled={isBusy}
                        />
                      </Row>
                    </Row>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

function buildDiscount(
  type: CampaignDiscountType,
  rawValue: string,
  rawMin: string,
):
  | { type: CampaignDiscountType; value: number; minSubtotalCents: number }
  | undefined {
  const minSubtotalCents = Math.round(Number(rawMin || "0") * 100);
  if (!Number.isFinite(minSubtotalCents) || minSubtotalCents < 0) return undefined;
  if (type === "free-shipping") {
    return { type, value: 0, minSubtotalCents };
  }
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
  if (type === "percent") {
    return {
      type,
      value: Math.min(100, Math.round(numeric)),
      minSubtotalCents,
    };
  }
  return {
    type,
    value: Math.round(numeric * 100),
    minSubtotalCents,
  };
}
