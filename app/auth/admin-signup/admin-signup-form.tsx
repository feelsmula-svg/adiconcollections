"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Box,
  Button,
  FormField,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";

interface AdminSignupFormProps {
  requiresInviteCode: boolean;
}

interface FieldErrors {
  [key: string]: string[] | undefined;
}

interface AdminSignupResponse {
  user?: { id: string; email: string; name: string; role: string };
  pending?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: FieldErrors;
}

export function AdminSignupForm({ requiresInviteCode }: AdminSignupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});
    setPendingMessage(null);
    try {
      const response = await fetch("/api/auth/admin-signup", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          inviteCode: inviteCode.trim(),
        }),
      });
      const data = (await response
        .json()
        .catch(() => null)) as AdminSignupResponse | null;

      if (!response.ok && response.status !== 202) {
        setErrorMessage(data?.error ?? "Admin signup failed");
        setFieldErrors(data?.fieldErrors ?? {});
        setSubmitting(false);
        return;
      }

      if (data?.pending) {
        setPendingMessage(
          data.message ??
            "Your admin request has been submitted. An existing admin must approve your account before you can sign in.",
        );
        setSubmitting(false);
        setName("");
        setEmail("");
        setPassword("");
        setInviteCode("");
        return;
      }

      if (!data?.user) {
        setErrorMessage("Admin signup failed");
        setSubmitting(false);
        return;
      }
      router.replace("/admin");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <Stack gap="md">
        {pendingMessage ? (
          <Box className="rounded-xl border border-primary/30 bg-primary-fixed p-md">
            <Text variant="body-sm" tone="primary">
              {pendingMessage}
            </Text>
          </Box>
        ) : null}
        {errorMessage ? (
          <Box className="rounded-xl border border-error/30 bg-error-container p-md">
            <Text variant="body-sm" tone="error">
              {errorMessage}
            </Text>
          </Box>
        ) : null}

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
            disabled={submitting}
            required
          />
        </FormField>

        <FormField
          label="Admin email"
          required
          error={fieldErrors.email?.[0]}
        >
          <TextField
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@adicon.com"
            disabled={submitting}
            required
          />
        </FormField>

        <FormField
          label="Password"
          required
          hint="At least 8 characters with a number"
          error={fieldErrors.password?.[0]}
        >
          <TextField
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            disabled={submitting}
            required
          />
        </FormField>

        {requiresInviteCode ? (
          <FormField
            label="Invite code"
            required
            hint="Provided by an existing admin"
            error={fieldErrors.inviteCode?.[0]}
          >
            <TextField
              type="text"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="ADC-XXXXXX"
              disabled={submitting}
              required
            />
          </FormField>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={submitting}
        >
          {submitting ? "Creating admin account…" : "Create admin account"}
        </Button>
      </Stack>
    </form>
  );
}
