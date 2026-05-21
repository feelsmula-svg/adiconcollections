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
import { useProfileStore } from "@/app/lib/state/profile-store";
import { ModalStepper, type ModalStep } from "./modal-stepper";

const STEPS: ModalStep[] = [
  { key: "identity", label: "Your identity" },
  { key: "contact", label: "Contact preferences" },
];

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  defaultName: string;
  defaultEmail: string;
}

export function EditProfileModal({
  open,
  onClose,
  defaultName,
  defaultEmail,
}: EditProfileModalProps) {
  const storedName = useProfileStore((state) => state.name);
  const phone = useProfileStore((state) => state.phone);
  const setProfile = useProfileStore((state) => state.setProfile);

  const [name, setName] = useState(storedName || defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phoneInput, setPhoneInput] = useState(phone);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(storedName || defaultName);
    setEmail(defaultEmail);
    setPhoneInput(phone);
    setStep(0);
  }, [open, defaultName, defaultEmail, phone, storedName]);

  const stepValid = useMemo(() => {
    if (step === 0) {
      return name.trim().length > 0 && email.trim().length > 0;
    }
    return true;
  }, [step, name, email]);

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
    setProfile({ name: name.trim(), phone: phoneInput });
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 250);
  };

  return (
    <Modal open={open} onClose={onClose} width="md" ariaLabel="Edit profile">
      <Box className="px-lg pt-lg pb-md flex items-start justify-between gap-md">
        <Stack gap="xs" className="flex-1 min-w-0">
          <Heading level={2} variant="headline-sm">
            Edit profile
          </Heading>
          <Text variant="body-sm" tone="muted">
            Update the personal details we use on your orders and account.
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
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Grace Adeyemi"
                  disabled={saving}
                  required
                />
              </FormField>
              <FormField
                label="Email address"
                required
                hint="Used for order updates and receipts."
              >
                <TextField
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={saving}
                  required
                />
              </FormField>
            </Stack>
          ) : null}

          {step === 1 ? (
            <Stack gap="md">
              <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
                <Stack gap="xs">
                  <Text
                    variant="label-caps"
                    tone="muted"
                    as="span"
                    className="tracking-[0.18em]"
                  >
                    Identity
                  </Text>
                  <Text variant="body-md" className="font-semibold pt-xs">
                    {name || "—"}
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    {email}
                  </Text>
                </Stack>
              </Box>
              <FormField
                label="Phone number"
                hint="Optional — for delivery updates only."
              >
                <TextField
                  type="tel"
                  autoComplete="tel"
                  value={phoneInput}
                  onChange={(event) => setPhoneInput(event.target.value)}
                  placeholder="+1 (555) 012-3456"
                  disabled={saving}
                />
              </FormField>
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
              {isLast ? (saving ? "Saving…" : "Save changes") : "Continue"}
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
