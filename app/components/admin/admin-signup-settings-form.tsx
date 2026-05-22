"use client";

import {
  useEffect,
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
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import { updateAdminSignupSettings } from "@/app/lib/settings/admin-signup/actions";
import type { AdminSignupSettings } from "@/app/lib/settings/admin-signup/types";

interface AdminSignupSettingsFormProps {
  settings: AdminSignupSettings;
}

export function AdminSignupSettingsForm({
  settings,
}: AdminSignupSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(settings.enabled);
  const [inviteCode, setInviteCode] = useState(settings.inviteCode);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  useEffect(() => {
    setEnabled(settings.enabled);
    setInviteCode(settings.inviteCode);
  }, [settings]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage(null);
    setFieldErrors({});
    setFeedback(null);
    startTransition(async () => {
      const result = await updateAdminSignupSettings({
        enabled,
        inviteCode: inviteCode.trim(),
      });
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not save settings");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setFeedback("Admin signup settings updated");
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
                name="shield_person"
                filled
                className="text-on-primary-container"
              />
            </Box>
            <Stack gap="none" className="flex-1">
              <Heading level={2} variant="headline-sm">
                Admin signup
              </Heading>
              <Text variant="body-sm" tone="muted">
                Control whether new admin accounts can be created through the
                public /auth/admin-signup page.
              </Text>
            </Stack>
            <Badge tone={enabled ? "primary" : "neutral"} size="sm">
              {enabled ? "Open" : "Closed"}
            </Badge>
          </Row>

          <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
            <Stack gap="xs">
              <Checkbox
                checked={enabled}
                onChange={(checked) => setEnabled(checked)}
                disabled={pending}
                label="Allow new admins to sign up at /auth/admin-signup"
              />
              <Box className="pl-xl">
                <Text variant="body-sm" tone="muted">
                  When off, the signup page renders a closed-state message and
                  the API rejects requests with 403.
                </Text>
              </Box>
            </Stack>
          </Box>

          <FormField
            label="Invite code"
            hint="Optional. When set, new admins must enter this exact code to sign up. Leave blank to allow open signup."
            error={fieldErrors.inviteCode?.[0]}
          >
            <TextField
              type="text"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="e.g. ADC-NEWADMIN-2026"
              disabled={pending || !enabled}
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
              {pending ? "Saving…" : "Save admin signup settings"}
            </Button>
          </Row>
        </Stack>
      </form>
    </Card>
  );
}
