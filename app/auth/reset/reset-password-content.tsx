"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Box,
  Button,
  Card,
  Container,
  FormField,
  Heading,
  Icon,
  LinkButton,
  Row,
  Section,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import { useAuthStore } from "@/app/lib/state/auth-store";
import type { UserRole } from "@/app/lib/auth/types";

interface ResetPasswordContentProps {
  token: string;
}

interface ResetResponse {
  user?: { id: string; email: string; name: string; role: UserRole };
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export function ResetPasswordContent({ token }: ResetPasswordContentProps) {
  const router = useRouter();
  const refresh = useAuthStore((s) => s.refresh);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [done, setDone] = useState(false);

  const hasToken = token.length >= 32;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setTopError(null);
    setFieldErrors({});

    if (password !== confirm) {
      setFieldErrors({ confirm: "Passwords do not match" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => null)) as ResetResponse | null;
      if (res.ok && data?.user) {
        setDone(true);
        await refresh();
        router.replace(data.user.role === "admin" ? "/admin" : "/account");
        return;
      }
      const flat: Record<string, string | undefined> = {};
      if (data?.fieldErrors) {
        for (const [key, value] of Object.entries(data.fieldErrors)) {
          if (Array.isArray(value) && value.length > 0) flat[key] = value[0];
        }
      }
      setFieldErrors(flat);
      setTopError(data?.error ?? "We couldn't reset your password.");
    } catch {
      setTopError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container width="default">
      <Section padding="md">
        <Box className="max-w-[480px] mx-auto">
          <Card variant="outlined" padding="xl" rounded="2xl">
            {!hasToken ? (
              <InvalidTokenState />
            ) : done ? (
              <SuccessState />
            ) : (
              <Stack gap="lg">
                <Stack gap="xs">
                  <Text
                    variant="label-caps"
                    tone="primary"
                    as="span"
                    className="tracking-[0.2em]"
                  >
                    Reset Password
                  </Text>
                  <Heading
                    level={1}
                    variant="display-lg"
                    size="headline-md"
                    className="md:text-headline-md"
                  >
                    Choose a new password
                  </Heading>
                  <Text variant="body-sm" tone="muted">
                    Pick a password that&apos;s at least 8 characters long and
                    includes a number. You&apos;ll be signed in automatically.
                  </Text>
                </Stack>

                <form onSubmit={onSubmit} className="w-full" noValidate>
                  <Stack gap="md">
                    {topError ? (
                      <Box className="rounded-xl border border-error/30 bg-error-container p-md">
                        <Row gap="sm" align="start">
                          <Icon
                            name="error"
                            filled
                            className="text-on-error-container text-lg shrink-0"
                          />
                          <Text
                            variant="body-sm"
                            tone="error"
                            role="alert"
                          >
                            {topError}
                          </Text>
                        </Row>
                      </Box>
                    ) : null}

                    <FormField
                      label="New password"
                      required
                      hint="At least 8 characters with a number"
                      error={fieldErrors.password}
                    >
                      <TextField
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={submitting}
                        required
                      />
                    </FormField>

                    <FormField
                      label="Confirm new password"
                      required
                      error={fieldErrors.confirm}
                    >
                      <TextField
                        type="password"
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        disabled={submitting}
                        required
                      />
                    </FormField>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={submitting}
                    >
                      {submitting ? "Saving…" : "Save new password"}
                    </Button>

                    <Row justify="center">
                      <LinkButton
                        href="/"
                        variant="ghost"
                        size="sm"
                        caps={false}
                      >
                        Back to home
                      </LinkButton>
                    </Row>
                  </Stack>
                </form>
              </Stack>
            )}
          </Card>
        </Box>
      </Section>
    </Container>
  );
}

function InvalidTokenState() {
  return (
    <Stack gap="md" align="start">
      <Box className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
        <Icon name="link_off" filled className="text-on-error-container text-xl" />
      </Box>
      <Heading level={1} variant="headline-sm">
        Reset link is invalid
      </Heading>
      <Text variant="body-sm" tone="muted">
        This reset link is missing a token or the link has been tampered with.
        Request a fresh link and try again — they&apos;re valid for 30 minutes.
      </Text>
      <LinkButton href="/" variant="primary" size="sm" caps={false} className="rounded-full">
        Back to home
      </LinkButton>
    </Stack>
  );
}

function SuccessState() {
  return (
    <Stack gap="md" align="start">
      <Box className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
        <Icon
          name="check_circle"
          filled
          className="text-on-secondary-container text-xl"
        />
      </Box>
      <Heading level={1} variant="headline-sm">
        Password updated
      </Heading>
      <Text variant="body-sm" tone="muted">
        Signing you in — you&apos;ll be in your account in a moment.
      </Text>
    </Stack>
  );
}
