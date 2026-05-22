"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

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
import { updateProfile } from "@/app/lib/account/profile-actions";
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
  defaultPhone?: string;
}

export function EditProfileModal({
  open,
  onClose,
  defaultName,
  defaultEmail,
  defaultPhone = "",
}: EditProfileModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phoneInput, setPhoneInput] = useState(defaultPhone);
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  useEffect(() => {
    if (!open) return;
    setName(defaultName);
    setEmail(defaultEmail);
    setPhoneInput(defaultPhone);
    setStep(0);
    setErrorMessage(null);
    setFieldErrors({});
  }, [open, defaultName, defaultEmail, defaultPhone]);

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
    if (pending) return;
    setErrorMessage(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await updateProfile({
        name: name.trim(),
        phone: phoneInput.trim() || null,
      });
      if (!result.ok) {
        setErrorMessage(result.error ?? "Profile could not be updated");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      router.refresh();
      onClose();
    });
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
              <FormField
                label="Full name"
                required
                error={fieldErrors.name?.[0]}
              >
                <TextField
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Grace Adeyemi"
                  disabled={pending}
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
                  disabled
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
                error={fieldErrors.phone?.[0]}
              >
                <TextField
                  type="tel"
                  autoComplete="tel"
                  value={phoneInput}
                  onChange={(event) => setPhoneInput(event.target.value)}
                  placeholder="+1 (555) 012-3456"
                  disabled={pending}
                />
              </FormField>
              {errorMessage ? (
                <Text variant="body-sm" tone="error">
                  {errorMessage}
                </Text>
              ) : null}
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
              disabled={pending}
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
              disabled={pending || !stepValid}
            >
              {isLast ? (pending ? "Saving…" : "Save changes") : "Continue"}
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
