"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorBanner,
  FormField,
  Heading,
  Modal,
  Row,
  Stack,
  Text,
  TextField,
  Textarea,
  type DataTableColumn,
} from "@/app/components/ui";
import type { CategoryRecord } from "@/app/lib/taxonomy/types";

interface CategoryManagerProps {
  initial: CategoryRecord[];
}

interface FormState {
  slug: string;
  label: string;
  description: string;
}

function emptyState(): FormState {
  return { slug: "", label: "", description: "" };
}

interface PendingDelete {
  id: string;
  label: string;
}

const CATEGORIES_PAGE_SIZE = 8;

export function CategoryManager({ initial }: CategoryManagerProps) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Save failed");
      }
      setState(emptyState());
      router.refresh();
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : "Save failed";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/categories/${pendingDelete.id}`,
        { method: "DELETE" },
      );
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Delete failed");
      }
      setPendingDelete(null);
      router.refresh();
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : "Delete failed";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  const columns: DataTableColumn<CategoryRecord>[] = [
    {
      key: "label",
      header: "Label",
      mobilePrimary: true,
      render: (cat) => (
        <Stack gap="none">
          <Row gap="xs" align="center" className="flex-wrap">
            <Text variant="body-md" as="span" className="font-semibold">
              {cat.label}
            </Text>
            {cat.isSystem ? <Badge tone="neutral">System</Badge> : null}
          </Row>
          <Text variant="body-sm" tone="muted" as="span">
            {cat.slug}
          </Text>
        </Stack>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (cat) => (
        <Text variant="body-sm" tone="muted" as="span">
          {cat.description || "—"}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      mobileFooter: true,
      render: (cat) =>
        cat.isSystem ? (
          <Text variant="body-sm" tone="muted" as="span">
            Built-in
          </Text>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            caps={false}
            onClick={() => setPendingDelete({ id: cat.id, label: cat.label })}
          >
            Delete
          </Button>
        ),
    },
  ];

  return (
    <Stack gap="lg">
      <Card variant="outlined" padding="lg" rounded="2xl">
        <form onSubmit={handleCreate} className="contents" noValidate>
          <Stack gap="md">
            <Heading level={2} variant="headline-sm">
              Add category
            </Heading>
            <Text variant="body-sm" tone="muted">
              Categories group products in the storefront and feed the
              &quot;Category&quot; dropdown across the admin. System categories
              ship with the app and cannot be deleted.
            </Text>
            <Row gap="md" className="flex-wrap">
              <Box className="flex-1 min-w-[200px]">
                <FormField label="Label" required>
                  <TextField
                    value={state.label}
                    placeholder="Ponytails"
                    onChange={(event) => update("label", event.target.value)}
                    required
                  />
                </FormField>
              </Box>
              <Box className="flex-1 min-w-[200px]">
                <FormField
                  label="Slug"
                  required
                  hint="Lowercase, dashes. Auto-cleaned."
                >
                  <TextField
                    value={state.slug}
                    placeholder="ponytails"
                    onChange={(event) => update("slug", event.target.value)}
                    required
                  />
                </FormField>
              </Box>
            </Row>
            <FormField label="Description">
              <Textarea
                rows={2}
                value={state.description}
                placeholder="Short customer-facing description (optional)."
                onChange={(event) => update("description", event.target.value)}
              />
            </FormField>

            <ErrorBanner message={error} />

            <Row justify="end" gap="sm">
              <Button
                type="submit"
                variant="primary"
                caps={false}
                disabled={saving}
              >
                {saving ? "Saving…" : "Add category"}
              </Button>
            </Row>
          </Stack>
        </form>
      </Card>

      <Card variant="outlined" padding="none" rounded="2xl">
        <DataTable
          columns={columns}
          rows={initial}
          rowKey={(cat) => cat.id}
          pagination={{
            pageSize: CATEGORIES_PAGE_SIZE,
            currentPage: page,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              title="No categories yet"
              description="Add your first one above."
            />
          }
        />
      </Card>

      <Modal
        open={pendingDelete !== null}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        ariaLabel="Delete category"
      >
        <Stack gap="md" className="p-lg">
          <Heading level={3} variant="headline-sm">
            Delete this category?
          </Heading>
          <Text variant="body-sm" tone="muted">
            {pendingDelete
              ? `“${pendingDelete.label}” will be removed. Products and hair types tagged with this category keep the tag string until you change them.`
              : ""}
          </Text>
          <Row gap="sm" justify="end">
            <Button
              type="button"
              variant="ghost"
              caps={false}
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              caps={false}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete category"}
            </Button>
          </Row>
        </Stack>
      </Modal>
    </Stack>
  );
}
