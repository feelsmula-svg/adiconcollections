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
  Select,
  Stack,
  Text,
  TextField,
  Textarea,
  type DataTableColumn,
  type SelectOption,
} from "@/app/components/ui";
import type { ProductCategory } from "@/app/lib/products/types";
import type { CategoryRecord, HairType } from "@/app/lib/taxonomy/types";
import { resolveCategoryLabel } from "@/app/lib/taxonomy/types";

interface HairTypeManagerProps {
  initial: HairType[];
  categories: CategoryRecord[];
}

interface FormState {
  slug: string;
  label: string;
  description: string;
  category: ProductCategory;
}

function emptyState(defaultCategory: string): FormState {
  return {
    slug: "",
    label: "",
    description: "",
    category: defaultCategory,
  };
}

interface PendingDelete {
  id: string;
  label: string;
}

const HAIR_TYPES_PAGE_SIZE = 8;

export function HairTypeManager({ initial, categories }: HairTypeManagerProps) {
  const router = useRouter();
  const defaultCategory = categories[0]?.slug ?? "wigs";
  const categoryOptions: SelectOption[] = categories.map((cat) => ({
    value: cat.slug,
    label: cat.label,
  }));
  const [state, setState] = useState<FormState>(() =>
    emptyState(defaultCategory),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
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
      const response = await fetch("/api/admin/hair-types", {
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
      setState(emptyState(defaultCategory));
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
        `/api/admin/hair-types/${pendingDelete.id}`,
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

  const columns: DataTableColumn<HairType>[] = [
    {
      key: "label",
      header: "Label",
      mobilePrimary: true,
      render: (type) => (
        <Stack gap="none">
          <Text variant="body-md" as="span" className="font-semibold">
            {type.label}
          </Text>
          <Text variant="body-sm" tone="muted" as="span">
            {type.slug}
          </Text>
        </Stack>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (type) => (
        <Badge tone="neutral">
          {resolveCategoryLabel(type.category, categories)}
        </Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (type) => (
        <Text variant="body-sm" tone="muted" as="span">
          {type.description || "—"}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      mobileFooter: true,
      render: (type) => (
        <Button
          variant="ghost"
          size="sm"
          caps={false}
          onClick={() => setPendingDelete({ id: type.id, label: type.label })}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Stack gap="xl">
      <Card variant="outlined" padding="lg" rounded="2xl">
        <form onSubmit={handleCreate} className="contents" noValidate>
          <Stack gap="md">
            <Heading level={2} variant="headline-sm">
              Add hair type
            </Heading>
            <Text variant="body-sm" tone="muted">
              Define the textures and styles your customers can browse. These
              feed the product upload form&apos;s &quot;Type&quot; dropdown.
            </Text>
            <Row gap="md" className="flex-wrap">
              <Box className="flex-1 min-w-[200px]">
                <FormField label="Label" required>
                  <TextField
                    value={state.label}
                    placeholder="Bone Straight"
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
                    placeholder="bone-straight"
                    onChange={(event) => update("slug", event.target.value)}
                    required
                  />
                </FormField>
              </Box>
              <Box className="flex-1 min-w-[200px]">
                <FormField
                  label="Category"
                  required
                  hint={
                    categoryOptions.length === 0
                      ? "No categories yet — add one above first."
                      : "Categories are managed in the Categories section."
                  }
                >
                  <Select
                    options={categoryOptions}
                    value={state.category}
                    onChange={(event) =>
                      update("category", event.target.value)
                    }
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
                {saving ? "Saving…" : "Add hair type"}
              </Button>
            </Row>
          </Stack>
        </form>
      </Card>

      <Card variant="outlined" padding="none" rounded="2xl">
        <DataTable
          columns={columns}
          rows={initial}
          rowKey={(type) => type.id}
          pagination={{
            pageSize: HAIR_TYPES_PAGE_SIZE,
            currentPage: page,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              title="No hair types yet"
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
        ariaLabel="Delete hair type"
      >
        <Stack gap="md" className="p-lg">
          <Heading level={3} variant="headline-sm">
            Delete this hair type?
          </Heading>
          <Text variant="body-sm" tone="muted">
            {pendingDelete
              ? `“${pendingDelete.label}” will be removed. Products already tagged with it keep the tag string.`
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
              {deleting ? "Deleting…" : "Delete hair type"}
            </Button>
          </Row>
        </Stack>
      </Modal>
    </Stack>
  );
}
