"use client";

import {
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
  FormField,
  Heading,
  Icon,
  IconButton,
  LinkButton,
  Modal,
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import {
  deleteAdmin,
  promoteUserToAdminByEmail,
} from "@/app/lib/admin/admin-management-actions";
import type { PublicUser } from "@/app/lib/auth/types";

interface PromoteAdminFormProps {
  existingAdmins: PublicUser[];
  primaryAdminId: string | null;
  selfUserId: string;
}

export function PromoteAdminForm({
  existingAdmins,
  primaryAdminId,
  selfUserId,
}: PromoteAdminFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PublicUser | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage(null);
    setFeedback(null);
    startTransition(async () => {
      const result = await promoteUserToAdminByEmail({ email });
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not promote user");
        return;
      }
      setFeedback(
        `${result.user?.name || result.user?.email} is now a sub-admin.`,
      );
      setEmail("");
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteAdmin(deleteTarget.id);
      if (!result.ok) {
        setDeleteError(result.error ?? "Could not delete admin");
        return;
      }
      setFeedback(
        `${deleteTarget.name || deleteTarget.email} has been removed.`,
      );
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack gap="lg">
        <Row align="center" gap="sm">
          <Box className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
            <Icon
              name="manage_accounts"
              filled
              className="text-on-secondary-container"
            />
          </Box>
          <Stack gap="none" className="flex-1">
            <Heading level={2} variant="headline-sm">
              Assign a sub-admin
            </Heading>
            <Text variant="body-sm" tone="muted">
              Promote any existing customer account to admin. They must have
              already signed up as a customer first.
            </Text>
          </Stack>
        </Row>

        <form onSubmit={onSubmit} noValidate>
          <Stack gap="md">
            <FormField
              label="Customer email"
              hint="They will gain full admin access immediately."
            >
              <TextField
                type="email"
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="someone@adicon.com"
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
                {pending ? "Promoting…" : "Promote to admin"}
              </Button>
            </Row>
          </Stack>
        </form>

        <Stack gap="sm">
          <Row justify="between" align="center">
            <Text
              variant="label-caps"
              tone="muted"
              as="span"
              className="tracking-[0.18em]"
            >
              Current admins ({existingAdmins.length})
            </Text>
            <LinkButton
              href="/admin/customers?role=admin"
              variant="ghost"
              size="sm"
              caps={false}
              className="rounded-full px-sm"
            >
              Manage in customers →
            </LinkButton>
          </Row>
          {existingAdmins.length === 0 ? (
            <Text variant="body-sm" tone="muted">
              No admins on record.
            </Text>
          ) : (
            <Stack gap="xs">
              {existingAdmins.map((admin) => {
                const isPrimary = admin.id === primaryAdminId;
                const isSelf = admin.id === selfUserId;
                return (
                  <Box
                    key={admin.id}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md"
                  >
                    <Row gap="md" align="center" justify="between" wrap>
                      <Stack gap="none" className="min-w-0 flex-1">
                        <Row gap="xs" align="center" wrap>
                          <Text
                            variant="body-md"
                            as="span"
                            className="font-semibold truncate"
                          >
                            {admin.name || admin.email}
                          </Text>
                          {isPrimary ? (
                            <Badge tone="primary" size="sm">
                              Primary
                            </Badge>
                          ) : (
                            <Badge tone="neutral" size="sm">
                              Sub-admin
                            </Badge>
                          )}
                          {isSelf ? (
                            <Badge tone="secondary" size="sm">
                              You
                            </Badge>
                          ) : null}
                        </Row>
                        <Text
                          variant="body-sm"
                          tone="muted"
                          as="span"
                          className="truncate"
                        >
                          {admin.email}
                        </Text>
                      </Stack>
                      {isPrimary || isSelf ? (
                        <Text
                          variant="body-sm"
                          tone="muted"
                          as="span"
                          className="text-[11px]"
                        >
                          {isPrimary
                            ? "Cannot be removed"
                            : "Cannot remove yourself"}
                        </Text>
                      ) : (
                        <IconButton
                          icon="delete"
                          label={`Remove admin ${admin.name || admin.email}`}
                          size="sm"
                          variant="plain"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(admin);
                          }}
                        />
                      )}
                    </Row>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Stack>

      <Modal
        open={deleteTarget !== null}
        onClose={() => {
          if (deletePending) return;
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        width="sm"
        ariaLabel="Remove admin"
      >
        <Stack gap="lg" className="px-lg py-lg">
          <Stack gap="sm" align="start">
            <Box className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <Icon
                name="delete"
                filled
                className="text-on-error-container text-xl"
              />
            </Box>
            <Heading level={2} variant="headline-sm">
              Remove this admin?
            </Heading>
            <Text variant="body-sm" tone="muted">
              This permanently deletes the admin account. Any orders or
              activity tied to them remain on file but will no longer link to a
              user. This action cannot be undone.
            </Text>
          </Stack>

          {deleteTarget ? (
            <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <Stack gap="xs">
                <Text variant="body-sm" className="font-semibold">
                  {deleteTarget.name || deleteTarget.email}
                </Text>
                <Text variant="body-sm" tone="muted">
                  {deleteTarget.email}
                </Text>
              </Stack>
            </Box>
          ) : null}

          {deleteError ? (
            <Text variant="body-sm" tone="error">
              {deleteError}
            </Text>
          ) : null}

          <Row gap="sm" justify="end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              caps={false}
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
              disabled={deletePending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              caps={false}
              onClick={confirmDelete}
              disabled={deletePending}
            >
              {deletePending ? "Removing…" : "Remove admin"}
            </Button>
          </Row>
        </Stack>
      </Modal>
    </Card>
  );
}
