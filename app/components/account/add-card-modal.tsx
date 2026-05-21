"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  Box,
  Button,
  FormField,
  Heading,
  Icon,
  IconButton,
  Modal,
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import {
  usePaymentStore,
  type CardInput,
} from "@/app/lib/state/payment-store";
import { ModalStepper, type ModalStep } from "./modal-stepper";

const STEPS: ModalStep[] = [
  { key: "card", label: "Card details" },
  { key: "holder", label: "Cardholder" },
  { key: "review", label: "Review & save" },
];

const EMPTY_DRAFT = {
  number: "",
  expiry: "",
  cvc: "",
  holder: "",
};

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

function detectBrand(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Card";
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function AddCardModal({ open, onClose }: AddCardModalProps) {
  const addCard = usePaymentStore((state) => state.addCard);

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(EMPTY_DRAFT);
    setStep(0);
  }, [open]);

  const digits = draft.number.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  const brand = detectBrand(draft.number);

  const stepValid = useMemo(() => {
    if (step === 0) {
      return (
        digits.length >= 13 &&
        /^\d{2}\/\d{2}$/.test(draft.expiry) &&
        /^\d{3,4}$/.test(draft.cvc)
      );
    }
    if (step === 1) {
      return draft.holder.trim().length > 0;
    }
    return true;
  }, [step, digits, draft.expiry, draft.cvc, draft.holder]);

  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLast) {
      if (!stepValid) return;
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      return;
    }
    if (saving) return;
    setSaving(true);
    const card: CardInput = {
      brand,
      last4,
      expiry: draft.expiry,
      holder: draft.holder.trim(),
    };
    addCard(card);
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 250);
  };

  return (
    <Modal open={open} onClose={onClose} width="lg" ariaLabel="Add a new card">
      <Box className="px-lg pt-lg pb-md flex items-start justify-between gap-md">
        <Stack gap="xs" className="flex-1 min-w-0">
          <Heading level={2} variant="headline-sm">
            Add a new card
          </Heading>
          <Text variant="body-sm" tone="muted">
            We never store full card numbers — only the last 4 digits are kept
            for display.
          </Text>
        </Stack>
        <IconButton
          icon="close"
          label="Close"
          size="sm"
          variant="plain"
          onClick={onClose}
        />
      </Box>

      <Box className="px-lg pb-md">
        <ModalStepper steps={STEPS} current={step} />
      </Box>

      <form onSubmit={onSubmit} className="contents" noValidate>
        <Box className="flex-1 overflow-y-auto px-lg pb-md">
          {step === 0 ? (
            <Stack gap="md">
              <FormField label="Card number" required>
                <TextField
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={draft.number}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      number: formatCardNumber(event.target.value),
                    }))
                  }
                  placeholder="1234 5678 9012 3456"
                  disabled={saving}
                  required
                />
              </FormField>
              <Box className="grid grid-cols-2 gap-md">
                <FormField label="Expiry (MM/YY)" required>
                  <TextField
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={draft.expiry}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        expiry: formatExpiry(event.target.value),
                      }))
                    }
                    placeholder="MM/YY"
                    disabled={saving}
                    required
                  />
                </FormField>
                <FormField label="CVC" required>
                  <TextField
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={draft.cvc}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        cvc: event.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    placeholder="123"
                    disabled={saving}
                    required
                  />
                </FormField>
              </Box>
            </Stack>
          ) : null}

          {step === 1 ? (
            <Stack gap="md">
              <FormField
                label="Name on card"
                required
                hint="As it appears on the front of the card."
              >
                <TextField
                  type="text"
                  autoComplete="cc-name"
                  value={draft.holder}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      holder: event.target.value,
                    }))
                  }
                  placeholder="e.g. Grace Adeyemi"
                  disabled={saving}
                  required
                />
              </FormField>
            </Stack>
          ) : null}

          {step === 2 ? (
            <Stack gap="md">
              <Box className="rounded-2xl bg-primary text-on-primary p-lg">
                <Stack gap="lg">
                  <Row justify="between" align="center">
                    <Text
                      variant="label-caps"
                      tone="on-primary"
                      as="span"
                      className="opacity-70 tracking-[0.18em]"
                    >
                      {brand}
                    </Text>
                    <Icon
                      name="credit_card"
                      filled
                      className="text-on-primary text-2xl"
                    />
                  </Row>
                  <Text
                    variant="body-lg"
                    tone="on-primary"
                    className="tracking-[0.2em]"
                  >
                    •••• •••• •••• {last4 || "0000"}
                  </Text>
                  <Row justify="between" align="end">
                    <Stack gap="none">
                      <Text
                        variant="label-caps"
                        tone="on-primary"
                        as="span"
                        className="opacity-70 tracking-[0.18em] text-[10px]"
                      >
                        Cardholder
                      </Text>
                      <Text variant="body-md" tone="on-primary" as="span">
                        {draft.holder || "—"}
                      </Text>
                    </Stack>
                    <Stack gap="none" align="end">
                      <Text
                        variant="label-caps"
                        tone="on-primary"
                        as="span"
                        className="opacity-70 tracking-[0.18em] text-[10px]"
                      >
                        Expires
                      </Text>
                      <Text variant="body-md" tone="on-primary" as="span">
                        {draft.expiry || "MM/YY"}
                      </Text>
                    </Stack>
                  </Row>
                </Stack>
              </Box>
              <Text variant="body-sm" tone="muted">
                When you save, we&apos;ll keep this card on file as your primary
                method if it&apos;s your first one. You can change the primary
                any time.
              </Text>
            </Stack>
          ) : null}
        </Box>

        <Box className="px-lg py-md border-t border-outline-variant bg-surface-container-low">
          <Row justify="between" align="center" gap="sm">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              caps={false}
              onClick={isFirst ? onClose : () => setStep((p) => p - 1)}
              disabled={saving}
            >
              {isFirst ? (
                "Cancel"
              ) : (
                <>
                  <Icon name="arrow_back" className="text-lg mr-xs" />
                  Back
                </>
              )}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              caps={false}
              disabled={saving || !stepValid}
            >
              {isLast
                ? saving
                  ? "Saving…"
                  : "Save card"
                : "Continue"}
              {!isLast ? (
                <Icon name="arrow_forward" className="text-lg ml-xs" />
              ) : null}
            </Button>
          </Row>
        </Box>
      </form>
    </Modal>
  );
}
