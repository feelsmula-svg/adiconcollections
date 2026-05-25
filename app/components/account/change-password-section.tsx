"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Button,
  FormField,
  Heading,
  IconButton,
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import { changePassword } from "@/app/lib/auth/account-actions";

export function ChangePasswordSection() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage(null);
    setFieldErrors({});
    setFeedback(null);

    startTransition(async () => {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not update password");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setFeedback("Password updated successfully");
      reset();
      router.refresh();
    });
  };

  return (
    <Stack gap="lg">
      <Row
        justify="between"
        align="end"
        className="pb-sm border-b border-outline-variant"
      >
        <Heading
          level={2}
          variant="headline-md"
          size="headline-sm"
          className="md:text-headline-md"
        >
          Password & Security
        </Heading>
      </Row>
      <Box className="max-w-[560px]">
        <Text variant="body-md" tone="muted">
          Choose a strong password you don&apos;t use anywhere else. Must be at
          least 8 characters and include a number.
        </Text>
      </Box>
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="md" className="max-w-[560px]">
          <FormField
            label="Current password"
            required
            error={fieldErrors.currentPassword?.[0]}
          >
            <Box className="relative">
              <TextField
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                disabled={pending}
                required
                className="pr-2xl"
              />
              <Box className="absolute right-xs top-1/2 -translate-y-1/2">
                <IconButton
                  type="button"
                  icon={showCurrent ? "visibility_off" : "visibility"}
                  label={
                    showCurrent
                      ? "Hide current password"
                      : "Show current password"
                  }
                  size="sm"
                  variant="plain"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  disabled={pending}
                />
              </Box>
            </Box>
          </FormField>

          <FormField
            label="New password"
            required
            error={fieldErrors.newPassword?.[0]}
          >
            <Box className="relative">
              <TextField
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                disabled={pending}
                required
                className="pr-2xl"
              />
              <Box className="absolute right-xs top-1/2 -translate-y-1/2">
                <IconButton
                  type="button"
                  icon={showNew ? "visibility_off" : "visibility"}
                  label={
                    showNew ? "Hide new password" : "Show new password"
                  }
                  size="sm"
                  variant="plain"
                  onClick={() => setShowNew((prev) => !prev)}
                  disabled={pending}
                />
              </Box>
            </Box>
          </FormField>

          <FormField
            label="Confirm new password"
            required
            error={fieldErrors.confirmPassword?.[0]}
          >
            <TextField
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
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
              {pending ? "Updating…" : "Update password"}
            </Button>
          </Row>
        </Stack>
      </form>
    </Stack>
  );
}
