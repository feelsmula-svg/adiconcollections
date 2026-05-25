"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Button,
  Card,
  FormField,
  Heading,
  Icon,
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import { updateStoreProfile } from "@/app/lib/settings/store-profile/actions";
import type { StoreProfileSettings } from "@/app/lib/settings/store-profile/types";

interface StoreProfileFormProps {
  settings: StoreProfileSettings;
}

export function StoreProfileForm({ settings }: StoreProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [brandName, setBrandName] = useState(settings.brandName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [currency, setCurrency] = useState(settings.currency);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage(null);
    setFieldErrors({});
    setFeedback(null);

    startTransition(async () => {
      const result = await updateStoreProfile({
        brandName: brandName.trim(),
        supportEmail: supportEmail.trim(),
        currency: currency.trim().toUpperCase(),
      });
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not save store profile");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      if (result.settings) {
        setBrandName(result.settings.brandName);
        setSupportEmail(result.settings.supportEmail);
        setCurrency(result.settings.currency);
      }
      setFeedback("Store profile updated");
      router.refresh();
    });
  };

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="lg">
          <Row align="center" gap="sm">
            <Box className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <Icon
                name="storefront"
                filled
                className="text-on-primary-container"
              />
            </Box>
            <Stack gap="none" className="flex-1">
              <Heading level={2} variant="headline-sm">
                Store profile
              </Heading>
              <Text variant="body-sm" tone="muted">
                These values are surfaced in customer-facing surfaces (emails,
                footers, receipts).
              </Text>
            </Stack>
          </Row>

          <FormField
            label="Brand name"
            required
            error={fieldErrors.brandName?.[0]}
          >
            <TextField
              type="text"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              placeholder="e.g. Adicon Collections"
              disabled={pending}
              required
            />
          </FormField>

          <FormField
            label="Support email"
            required
            error={fieldErrors.supportEmail?.[0]}
            hint="Replies from customers will be routed to this inbox."
          >
            <TextField
              type="email"
              autoComplete="email"
              value={supportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
              placeholder="support@example.com"
              disabled={pending}
              required
            />
          </FormField>

          <FormField
            label="Currency"
            required
            error={fieldErrors.currency?.[0]}
            hint="3-letter ISO 4217 code, e.g. USD, EUR, GBP."
          >
            <TextField
              type="text"
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value.toUpperCase())
              }
              placeholder="USD"
              maxLength={3}
              disabled={pending}
              required
            />
          </FormField>

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

          <Row justify="end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              caps={false}
              disabled={pending}
              className="rounded-full"
            >
              {pending ? "Saving…" : "Save store profile"}
            </Button>
          </Row>
        </Stack>
      </form>
    </Card>
  );
}
