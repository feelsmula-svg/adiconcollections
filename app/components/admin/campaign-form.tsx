"use client";

import {
  useEffect,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Button,
  Card,
  Checkbox,
  FormField,
  Heading,
  IconButton,
  Modal,
  Row,
  Select,
  Stack,
  Text,
  Textarea,
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

interface CampaignFormProps {
  mode: "create" | "edit";
  initial?: Campaign | null;
  onClose: () => void;
}

interface DraftState {
  name: string;
  headerText: string;
  modalTitle: string;
  modalBody: string;
  ctaLabel: string;
  ctaHref: string;
  promoCode: string;
  discountEnabled: boolean;
  discountType: CampaignDiscountType;
  discountValue: string;
  minSubtotal: string;
  showInHeader: boolean;
  showModal: boolean;
  enabled: boolean;
  startsAt: string;
  endsAt: string;
}

function dollarsFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function toDraft(campaign: Campaign | null | undefined): DraftState {
  return {
    name: campaign?.name ?? "",
    headerText: campaign?.headerText ?? "",
    modalTitle: campaign?.modalTitle ?? "",
    modalBody: campaign?.modalBody ?? "",
    ctaLabel: campaign?.ctaLabel ?? "",
    ctaHref: campaign?.ctaHref ?? "",
    promoCode: campaign?.promoCode ?? "",
    discountEnabled: Boolean(campaign?.discount),
    discountType: campaign?.discount?.type ?? "percent",
    discountValue: campaign?.discount
      ? campaign.discount.type === "percent"
        ? String(campaign.discount.value)
        : campaign.discount.type === "fixed"
          ? dollarsFromCents(campaign.discount.value)
          : ""
      : "",
    minSubtotal: campaign?.discount
      ? dollarsFromCents(campaign.discount.minSubtotalCents)
      : "",
    showInHeader: campaign?.showInHeader ?? false,
    showModal: campaign?.showModal ?? false,
    enabled: campaign?.enabled ?? false,
    startsAt: campaign?.startsAt ?? "",
    endsAt: campaign?.endsAt ?? "",
  };
}

export function CampaignForm({ mode, initial, onClose }: CampaignFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftState>(() => toDraft(initial));
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  useEffect(() => {
    setDraft(toDraft(initial));
  }, [initial]);

  const patch = <K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    // Clear that field's error as the admin types.
    if (fieldErrors[key]) {
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
    setFieldErrors({});

    const payload = {
      name: draft.name.trim(),
      headerText: draft.headerText.trim(),
      modalTitle: draft.modalTitle.trim(),
      modalBody: draft.modalBody.trim(),
      ctaLabel: draft.ctaLabel.trim(),
      ctaHref: draft.ctaHref.trim(),
      promoCode: draft.promoCode.trim().toUpperCase(),
      showInHeader: draft.showInHeader,
      showModal: draft.showModal,
      enabled: draft.enabled,
      startsAt: draft.startsAt.trim(),
      endsAt: draft.endsAt.trim(),
      discount: draft.discountEnabled
        ? buildDiscount(
            draft.discountType,
            draft.discountValue,
            draft.minSubtotal,
          )
        : undefined,
    };

    if (draft.discountEnabled && !payload.discount) {
      setErrorMessage("Enter a discount value greater than 0.");
      setFieldErrors({
        discountValue: ["Enter a discount value greater than 0."],
      });
      return;
    }

    if (payload.showInHeader && !payload.headerText) {
      setErrorMessage("Header banner needs header text.");
      setFieldErrors({ headerText: ["Required when 'Show in header' is on."] });
      return;
    }
    if (payload.showModal && !payload.modalTitle) {
      setErrorMessage("Modal popup needs a title.");
      setFieldErrors({ modalTitle: ["Required when 'Show modal popup' is on."] });
      return;
    }

    startTransition(async () => {
      const result =
        mode === "edit" && initial
          ? await updateCampaign(initial.id, payload)
          : await createCampaign(payload);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not save campaign");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        return;
      }
      onClose();
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!initial) return;
    setErrorMessage(null);
    startDeleteTransition(async () => {
      const result = await deleteCampaign(initial.id);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not delete campaign");
        return;
      }
      setConfirmDelete(false);
      onClose();
      router.refresh();
    });
  };

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="lg">
          <Row justify="between" align="center" wrap gap="sm">
            <Stack gap="none">
              <Heading level={2} variant="headline-sm">
                {mode === "create" ? "New campaign" : `Edit ${initial?.name ?? "campaign"}`}
              </Heading>
              <Text variant="body-sm" tone="muted">
                Drive the header banner, a homepage modal, and an optional
                promo code from one place.
              </Text>
            </Stack>
            <IconButton
              icon="close"
              label="Close"
              size="sm"
              variant="plain"
              onClick={onClose}
              disabled={pending || deleting}
            />
          </Row>

          <FormField label="Internal name" required error={errorFor("name")}>
            <TextField
              value={draft.name}
              onChange={(event) => patch("name", event.target.value)}
              placeholder="e.g. Free shipping over $150"
              disabled={pending}
              required
            />
          </FormField>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-md items-start">
            <FormField
              label="Header banner text"
              hint="Shows in the top dark strip across the site."
              error={errorFor("headerText")}
            >
              <TextField
                value={draft.headerText}
                onChange={(event) => patch("headerText", event.target.value)}
                placeholder="FREE US SHIPPING ON ORDERS OVER $150"
                disabled={pending}
                maxLength={200}
              />
            </FormField>
            <FormField
              label="Modal title"
              hint="Heading shown to customers in the pop-up."
              error={errorFor("modalTitle")}
            >
              <TextField
                value={draft.modalTitle}
                onChange={(event) => patch("modalTitle", event.target.value)}
                placeholder="Free shipping this week"
                disabled={pending}
              />
            </FormField>
          </Box>

          <FormField label="Modal body" error={errorFor("modalBody")}>
            <Textarea
              rows={3}
              value={draft.modalBody}
              onChange={(event) => patch("modalBody", event.target.value)}
              placeholder="Hi! For a limited time…"
              disabled={pending}
            />
          </FormField>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-md items-start">
            <FormField label="CTA label" error={errorFor("ctaLabel")}>
              <TextField
                value={draft.ctaLabel}
                onChange={(event) => patch("ctaLabel", event.target.value)}
                placeholder="Shop the collection"
                disabled={pending}
              />
            </FormField>
            <FormField
              label="CTA link"
              hint="Internal path only."
              error={errorFor("ctaHref")}
            >
              <TextField
                value={draft.ctaHref}
                onChange={(event) => patch("ctaHref", event.target.value)}
                placeholder="/shop"
                disabled={pending}
              />
            </FormField>
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-md items-start">
            <FormField
              label="Promo code (optional)"
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
              />
            </FormField>
            <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <Checkbox
                checked={draft.discountEnabled}
                onChange={(checked) => patch("discountEnabled", checked)}
                disabled={pending}
                label="This campaign grants a checkout discount"
              />
            </Box>
          </Box>

          {draft.discountEnabled ? (
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-md items-start">
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
          ) : null}

          <Box className="grid grid-cols-1 md:grid-cols-3 gap-md items-start">
            <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <Checkbox
                checked={draft.enabled}
                onChange={(checked) => patch("enabled", checked)}
                disabled={pending}
                label="Active"
              />
            </Box>
            <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <Checkbox
                checked={draft.showInHeader}
                onChange={(checked) => patch("showInHeader", checked)}
                disabled={pending}
                label="Show in header banner"
              />
            </Box>
            <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <Checkbox
                checked={draft.showModal}
                onChange={(checked) => patch("showModal", checked)}
                disabled={pending}
                label="Show modal popup on first visit"
              />
            </Box>
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-md items-start">
            <FormField
              label="Starts at"
              hint="Optional ISO date (yyyy-mm-dd)."
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
              hint="Optional ISO date (yyyy-mm-dd)."
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

          {errorMessage ? (
            <Text variant="body-sm" tone="error">
              {errorMessage}
            </Text>
          ) : null}

          <Row justify="between" align="center" wrap gap="sm">
            <Box>
              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  caps={false}
                  onClick={() => setConfirmDelete(true)}
                  disabled={pending || deleting}
                >
                  Delete campaign
                </Button>
              ) : null}
            </Box>
            <Row gap="sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                caps={false}
                onClick={onClose}
                disabled={pending || deleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                caps={false}
                disabled={pending || deleting}
                className="rounded-full"
              >
                {pending
                  ? "Saving…"
                  : mode === "create"
                    ? "Create campaign"
                    : "Save changes"}
              </Button>
            </Row>
          </Row>
        </Stack>
      </form>

      <Modal
        open={confirmDelete}
        onClose={() => {
          if (!deleting) setConfirmDelete(false);
        }}
        width="sm"
        ariaLabel="Delete campaign"
      >
        <Stack gap="md" className="p-lg">
          <Heading level={3} variant="headline-sm">
            Delete this campaign?
          </Heading>
          <Text variant="body-sm" tone="muted">
            It will be removed from the header and any modal popups. This
            cannot be undone.
          </Text>
          <Row gap="sm" justify="end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              caps={false}
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              caps={false}
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete campaign"}
            </Button>
          </Row>
        </Stack>
      </Modal>
    </Card>
  );
}

function buildDiscount(
  type: CampaignDiscountType,
  rawValue: string,
  rawMin: string,
): { type: CampaignDiscountType; value: number; minSubtotalCents: number } | undefined {
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
  // fixed — dollars to cents
  return {
    type,
    value: Math.round(numeric * 100),
    minSubtotalCents,
  };
}
