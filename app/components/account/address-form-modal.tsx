"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  Box,
  Button,
  Checkbox,
  FormField,
  Heading,
  Icon,
  IconButton,
  Modal,
  Row,
  Select,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import {
  useAddressStore,
  type Address,
  type AddressInput,
} from "@/app/lib/state/address-store";
import { ModalStepper, type ModalStep } from "./modal-stepper";

const COUNTRY_OPTIONS = [
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Ghana", label: "Ghana" },
  { value: "South Africa", label: "South Africa" },
  { value: "Australia", label: "Australia" },
];

const STEPS: ModalStep[] = [
  { key: "who", label: "Who is it for" },
  { key: "address", label: "Where to send it" },
  { key: "defaults", label: "Make it default" },
];

const EMPTY_DRAFT: AddressInput = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal: "",
  country: "United States",
  phone: "",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  address?: Address;
}

export function AddressFormModal({
  open,
  onClose,
  mode,
  address,
}: AddressFormModalProps) {
  const addAddress = useAddressStore((state) => state.add);
  const updateAddress = useAddressStore((state) => state.update);

  const [draft, setDraft] = useState<AddressInput>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    if (mode === "edit" && address) {
      const { id: _id, ...rest } = address;
      void _id;
      setDraft({ ...EMPTY_DRAFT, ...rest });
    } else {
      setDraft(EMPTY_DRAFT);
    }
  }, [open, mode, address]);

  const patch = <K extends keyof AddressInput>(
    key: K,
    value: AddressInput[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const stepValid = useMemo(() => {
    if (step === 0) return draft.name.trim().length > 0;
    if (step === 1) {
      return (
        draft.line1.trim().length > 0 &&
        draft.city.trim().length > 0 &&
        draft.state.trim().length > 0 &&
        draft.postal.trim().length > 0 &&
        draft.country.trim().length > 0
      );
    }
    return true;
  }, [step, draft]);

  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (!stepValid) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLast) {
      handleNext();
      return;
    }
    if (saving) return;
    setSaving(true);
    if (mode === "edit" && address) {
      updateAddress(address.id, draft);
    } else {
      addAddress(draft);
    }
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 250);
  };

  const title = mode === "add" ? "Add new address" : "Edit address";
  const subtitle = mode === "add"
    ? "Save a delivery destination for faster checkout next time."
    : "Update the saved details for this address.";

  const submitLabel = isLast
    ? saving
      ? "Saving…"
      : mode === "add"
        ? "Save address"
        : "Save changes"
    : "Continue";

  return (
    <Modal open={open} onClose={onClose} width="lg" ariaLabel={title}>
      <Box className="px-lg pt-lg pb-md flex items-start justify-between gap-md">
        <Stack gap="xs" className="flex-1 min-w-0">
          <Heading level={2} variant="headline-sm">
            {title}
          </Heading>
          <Text variant="body-sm" tone="muted">
            {subtitle}
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
              <FormField label="Full name" required>
                <TextField
                  type="text"
                  autoComplete="name"
                  value={draft.name}
                  onChange={(event) => patch("name", event.target.value)}
                  placeholder="e.g. Grace Adeyemi"
                  disabled={saving}
                  required
                />
              </FormField>
              <FormField
                label="Phone number"
                hint="Optional — used for delivery updates."
              >
                <TextField
                  type="tel"
                  autoComplete="tel"
                  value={draft.phone ?? ""}
                  onChange={(event) => patch("phone", event.target.value)}
                  placeholder="+1 (555) 012-3456"
                  disabled={saving}
                />
              </FormField>
            </Stack>
          ) : null}

          {step === 1 ? (
            <Stack gap="md">
              <FormField label="Address line 1" required>
                <TextField
                  type="text"
                  autoComplete="address-line1"
                  value={draft.line1}
                  onChange={(event) => patch("line1", event.target.value)}
                  placeholder="Street and number"
                  disabled={saving}
                  required
                />
              </FormField>
              <FormField label="Address line 2">
                <TextField
                  type="text"
                  autoComplete="address-line2"
                  value={draft.line2 ?? ""}
                  onChange={(event) => patch("line2", event.target.value)}
                  placeholder="Apt, suite, building (optional)"
                  disabled={saving}
                />
              </FormField>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <FormField label="City" required>
                  <TextField
                    type="text"
                    autoComplete="address-level2"
                    value={draft.city}
                    onChange={(event) => patch("city", event.target.value)}
                    disabled={saving}
                    required
                  />
                </FormField>
                <FormField label="State / Region" required>
                  <TextField
                    type="text"
                    autoComplete="address-level1"
                    value={draft.state}
                    onChange={(event) => patch("state", event.target.value)}
                    disabled={saving}
                    required
                  />
                </FormField>
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <FormField label="Postal code" required>
                  <TextField
                    type="text"
                    autoComplete="postal-code"
                    value={draft.postal}
                    onChange={(event) => patch("postal", event.target.value)}
                    disabled={saving}
                    required
                  />
                </FormField>
                <FormField label="Country" required>
                  <Select
                    options={COUNTRY_OPTIONS}
                    value={draft.country}
                    onChange={(event) => patch("country", event.target.value)}
                    disabled={saving}
                    required
                    className="w-full font-body-md text-body-md tracking-normal py-sm"
                  />
                </FormField>
              </Box>
            </Stack>
          ) : null}

          {step === 2 ? (
            <Stack gap="md">
              <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
                <Stack gap="xs">
                  <Text
                    variant="label-caps"
                    tone="muted"
                    as="span"
                    className="tracking-[0.18em]"
                  >
                    Review
                  </Text>
                  <Text variant="body-md" className="font-semibold pt-xs">
                    {draft.name || "—"}
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    {draft.line1}
                    {draft.line2 ? `, ${draft.line2}` : ""}
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    {[draft.city, draft.state, draft.postal]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    {draft.country}
                  </Text>
                  {draft.phone ? (
                    <Text variant="body-sm" tone="muted">
                      {draft.phone}
                    </Text>
                  ) : null}
                </Stack>
              </Box>
              <Stack gap="sm">
                <Checkbox
                  checked={draft.isDefaultShipping ?? false}
                  onChange={(checked) =>
                    patch("isDefaultShipping", checked)
                  }
                  disabled={saving}
                  label="Set as default shipping address"
                />
                <Checkbox
                  checked={draft.isDefaultBilling ?? false}
                  onChange={(checked) =>
                    patch("isDefaultBilling", checked)
                  }
                  disabled={saving}
                  label="Set as default billing address"
                />
              </Stack>
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
              onClick={isFirst ? onClose : handleBack}
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
              {submitLabel}
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
