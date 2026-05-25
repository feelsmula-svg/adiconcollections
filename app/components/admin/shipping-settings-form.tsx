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
  Divider,
  FormField,
  Heading,
  Icon,
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import { updateShippingSettings } from "@/app/lib/settings/shipping/actions";
import type { ShippingSettings } from "@/app/lib/settings/shipping/types";

interface MethodDraft {
  label: string;
  description: string;
  /** Dollars-and-cents string for the input field (e.g. "24.99"). */
  priceDollars: string;
}

function methodToDraft(
  method: ShippingSettings["sameDay"],
): MethodDraft {
  return {
    label: method.label,
    description: method.description,
    priceDollars: (method.priceCents / 100).toFixed(2),
  };
}

function draftToCents(input: string): number {
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

interface ShippingSettingsFormProps {
  settings: ShippingSettings;
}

export function ShippingSettingsForm({ settings }: ShippingSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [sameDay, setSameDay] = useState<MethodDraft>(() =>
    methodToDraft(settings.sameDay),
  );
  const [standard, setStandard] = useState<MethodDraft>(() =>
    methodToDraft(settings.standard),
  );
  const [taxRatePercent, setTaxRatePercent] = useState<string>(() =>
    (settings.taxRate * 100).toFixed(2),
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  useEffect(() => {
    setSameDay(methodToDraft(settings.sameDay));
    setStandard(methodToDraft(settings.standard));
    setTaxRatePercent((settings.taxRate * 100).toFixed(2));
  }, [settings]);

  const updateMethod = (
    setter: (next: MethodDraft) => void,
    current: MethodDraft,
    field: keyof MethodDraft,
    value: string,
  ) => {
    setter({ ...current, [field]: value });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage(null);
    setFieldErrors({});
    setFeedback(null);

    const parsedTaxPercent = Number(taxRatePercent);
    const taxRate =
      Number.isFinite(parsedTaxPercent) && parsedTaxPercent >= 0
        ? parsedTaxPercent / 100
        : 0;

    startTransition(async () => {
      const result = await updateShippingSettings({
        sameDay: {
          label: sameDay.label,
          description: sameDay.description,
          priceCents: draftToCents(sameDay.priceDollars),
        },
        standard: {
          label: standard.label,
          description: standard.description,
          priceCents: draftToCents(standard.priceDollars),
        },
        taxRate,
      });
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not save settings");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setFeedback("Shipping settings updated");
      router.refresh();
    });
  };

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="lg">
          <Stack gap="xs">
            <Row align="center" gap="sm">
              <Box className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <Icon
                  name="local_shipping"
                  filled
                  className="text-on-primary-container"
                />
              </Box>
              <Stack gap="none" className="flex-1">
                <Heading level={2} variant="headline-sm">
                  Shipping & tax
                </Heading>
                <Text variant="body-sm" tone="muted">
                  Control delivery method pricing, copy, and the tax rate
                  applied at checkout.
                </Text>
              </Stack>
            </Row>
          </Stack>

          <MethodFields
            title="Express delivery"
            draft={sameDay}
            disabled={pending}
            fieldErrorPrefix="sameDay"
            fieldErrors={fieldErrors}
            onChange={(field, value) =>
              updateMethod(setSameDay, sameDay, field, value)
            }
          />

          <Divider />

          <MethodFields
            title="Standard delivery"
            draft={standard}
            disabled={pending}
            fieldErrorPrefix="standard"
            fieldErrors={fieldErrors}
            onChange={(field, value) =>
              updateMethod(setStandard, standard, field, value)
            }
          />

          <Divider />

          <FormField
            label="Sales tax rate (%)"
            hint="Applied to the post-discount subtotal. Use 0 to disable tax."
            error={fieldErrors.taxRate?.[0]}
          >
            <TextField
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.01}
              value={taxRatePercent}
              onChange={(event) => setTaxRatePercent(event.target.value)}
              disabled={pending}
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
              {pending ? "Saving…" : "Save shipping settings"}
            </Button>
          </Row>
        </Stack>
      </form>
    </Card>
  );
}

interface MethodFieldsProps {
  title: string;
  draft: MethodDraft;
  disabled: boolean;
  fieldErrorPrefix: "sameDay" | "standard";
  fieldErrors: Record<string, string[] | undefined>;
  onChange: (field: keyof MethodDraft, value: string) => void;
}

function MethodFields({
  title,
  draft,
  disabled,
  fieldErrorPrefix,
  fieldErrors,
  onChange,
}: MethodFieldsProps) {
  const errorFor = (field: keyof MethodDraft) =>
    fieldErrors[`${fieldErrorPrefix}.${field}`]?.[0];

  return (
    <Stack gap="sm">
      <Heading level={3} variant="headline-sm" size="body-lg">
        {title}
      </Heading>
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <FormField label="Label" required error={errorFor("label")}>
          <TextField
            type="text"
            value={draft.label}
            placeholder="e.g. Express Next-Day"
            onChange={(event) => onChange("label", event.target.value)}
            disabled={disabled}
            required
          />
        </FormField>
        <FormField
          label="Price (USD)"
          required
          error={errorFor("priceDollars")}
        >
          <TextField
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={draft.priceDollars}
            onChange={(event) => onChange("priceDollars", event.target.value)}
            disabled={disabled}
            required
          />
        </FormField>
      </Box>
      <FormField
        label="Description"
        required
        error={errorFor("description")}
      >
        <TextField
          type="text"
          value={draft.description}
          placeholder="Short blurb shown under the label"
          onChange={(event) => onChange("description", event.target.value)}
          disabled={disabled}
          required
        />
      </FormField>
    </Stack>
  );
}
