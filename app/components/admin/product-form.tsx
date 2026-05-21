"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Box,
  Button,
  Card,
  Checkbox,
  ErrorBanner,
  FileInput,
  FormField,
  Heading,
  Modal,
  ProductThumb,
  Row,
  Select,
  Stack,
  Text,
  Textarea,
  TextField,
  type SelectOption,
} from "@/app/components/ui";
import type {
  ProductCategory,
  ProductRecord,
} from "@/app/lib/products/types";
import type { CategoryRecord, HairType } from "@/app/lib/taxonomy/types";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unexpected file reader result"));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function humanBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

interface ProductFormProps {
  mode: "create" | "edit";
  initial?: ProductRecord;
  hairTypes: HairType[];
  categories: CategoryRecord[];
}

interface FormState {
  name: string;
  description: string;
  category: ProductCategory;
  type: string;
  priceDollars: string;
  imageUrl: string;
  stock: string;
  featured: boolean;
}

function toInitialState(
  defaultCategory: string,
  initial?: ProductRecord,
): FormState {
  if (!initial) {
    return {
      name: "",
      description: "",
      category: defaultCategory,
      type: "",
      priceDollars: "",
      imageUrl: "",
      stock: "0",
      featured: false,
    };
  }
  return {
    name: initial.name,
    description: initial.description,
    category: initial.category,
    type: initial.type,
    priceDollars: (initial.priceCents / 100).toFixed(2),
    imageUrl: initial.imageUrl,
    stock: String(initial.stock),
    featured: initial.featured,
  };
}

export function ProductForm({
  mode,
  initial,
  hairTypes,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const defaultCategory = categories[0]?.slug ?? "wigs";
  const categoryOptions: SelectOption[] = categories.map((cat) => ({
    value: cat.slug,
    label: cat.label,
  }));
  const [state, setState] = useState<FormState>(() =>
    toInitialState(defaultCategory, initial),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imageReading, setImageReading] = useState(false);

  async function handleImageSelected(file: File | null) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Image must be JPG, PNG, WEBP, or GIF.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(
        `Image is ${humanBytes(file.size)} — please pick one under ${humanBytes(
          MAX_IMAGE_BYTES,
        )}.`,
      );
      return;
    }
    setError(null);
    setImageReading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      update("imageUrl", dataUrl);
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : "Could not read image";
      setError(message);
    } finally {
      setImageReading(false);
    }
  }

  const typeOptionsForCategory = hairTypes.filter(
    (type) => type.category === state.category,
  );
  const typeOptions: SelectOption[] = [
    { value: "", label: "Select a type…" },
    ...typeOptionsForCategory.map((type) => ({
      value: type.slug,
      label: type.label,
    })),
  ];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const priceCents = Math.round(Number(state.priceDollars) * 100);
    const stock = Number(state.stock);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError("Enter a valid price.");
      setSaving(false);
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setError("Enter a valid stock count.");
      setSaving(false);
      return;
    }
    if (!state.imageUrl) {
      setError("Upload a product image before saving.");
      setSaving(false);
      return;
    }

    const payload = {
      name: state.name,
      description: state.description,
      category: state.category,
      type: state.type,
      priceCents,
      imageUrl: state.imageUrl,
      stock,
      featured: state.featured,
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${initial?.id}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Save failed");
      }
      router.push("/admin/products");
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
    if (!initial) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${initial.id}`, {
        method: "DELETE",
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Delete failed");
      }
      setDeleteOpen(false);
      router.push("/admin/products");
      router.refresh();
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : "Delete failed";
      setError(message);
      setSaving(false);
    }
  }

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <form onSubmit={handleSubmit} className="contents" noValidate>
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={2} variant="headline-sm">
              {mode === "create" ? "Upload product" : "Edit product"}
            </Heading>
            <Text variant="body-sm" tone="muted">
              Fill in the details below. Upload a product image from your
              computer — it&apos;s saved with the product as base64, no external
              hosting needed.
            </Text>
          </Stack>

          <FormField label="Product name" required>
            <TextField
              value={state.name}
              placeholder="Raw Cambodian Straight 22&quot;"
              onChange={(event) => update("name", event.target.value)}
              required
            />
          </FormField>

          <FormField label="Description" required>
            <Textarea
              value={state.description}
              placeholder="Origin, texture, weight, suggested care..."
              rows={4}
              onChange={(event) => update("description", event.target.value)}
              required
            />
          </FormField>

          <Row gap="md" className="flex-wrap">
            <Box className="flex-1 min-w-[220px]">
              <FormField
                label="Category"
                required
                hint={
                  categoryOptions.length === 0
                    ? "No categories yet — add one in Taxonomy."
                    : "Edit categories in Taxonomy."
                }
              >
                <Select
                  options={categoryOptions}
                  value={state.category}
                  onChange={(event) => update("category", event.target.value)}
                />
              </FormField>
            </Box>
            <Box className="flex-1 min-w-[220px]">
              <FormField
                label="Type"
                required
                hint={
                  typeOptionsForCategory.length === 0
                    ? "No types yet for this category — add one in Hair Types."
                    : "Pick a hair type from the taxonomy."
                }
              >
                <Select
                  options={typeOptions}
                  value={state.type}
                  onChange={(event) => update("type", event.target.value)}
                  required
                />
              </FormField>
            </Box>
          </Row>

          <Row gap="md" className="flex-wrap">
            <Box className="flex-1 min-w-[180px]">
              <FormField label="Price (USD)" required hint="Decimal dollars">
                <TextField
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.priceDollars}
                  placeholder="725.00"
                  onChange={(event) =>
                    update("priceDollars", event.target.value)
                  }
                  required
                />
              </FormField>
            </Box>
            <Box className="flex-1 min-w-[180px]">
              <FormField label="Stock" required>
                <TextField
                  type="number"
                  step="1"
                  min="0"
                  value={state.stock}
                  placeholder="0"
                  onChange={(event) => update("stock", event.target.value)}
                  required
                />
              </FormField>
            </Box>
          </Row>

          <FormField
            label="Product image"
            required
            hint={`JPG, PNG, WEBP, or GIF up to ${humanBytes(MAX_IMAGE_BYTES)}. Uploaded images are stored as base64 with the product.`}
          >
            <Row gap="sm" align="center" className="flex-wrap">
              <FileInput
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                disabled={saving || imageReading}
                onFileSelected={handleImageSelected}
              >
                {imageReading
                  ? "Reading…"
                  : state.imageUrl
                    ? "Replace image"
                    : "Choose image"}
              </FileInput>
              {state.imageUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  caps={false}
                  size="sm"
                  disabled={saving || imageReading}
                  onClick={() => update("imageUrl", "")}
                >
                  Remove
                </Button>
              ) : null}
            </Row>
          </FormField>

          {state.imageUrl ? (
            <ProductThumb
              src={state.imageUrl}
              alt="Preview"
              size="xl"
              rounded="xl"
            />
          ) : null}

          <Checkbox
            checked={state.featured}
            onChange={(checked) => update("featured", checked)}
            label="Feature on homepage"
          />

          <ErrorBanner message={error} />

          <Row gap="sm" justify="between" className="flex-wrap">
            {mode === "edit" ? (
              <Button
                type="button"
                variant="destructive"
                caps={false}
                onClick={() => setDeleteOpen(true)}
                disabled={saving}
              >
                Delete product
              </Button>
            ) : (
              <Box />
            )}
            <Row gap="sm">
              <Button
                type="button"
                variant="ghost"
                caps={false}
                onClick={() => router.push("/admin/products")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                caps={false}
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : mode === "create"
                    ? "Upload product"
                    : "Save changes"}
              </Button>
            </Row>
          </Row>
        </Stack>
      </form>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!saving) setDeleteOpen(false);
        }}
        ariaLabel="Delete product"
      >
        <Stack gap="md" className="p-lg">
          <Heading level={3} variant="headline-sm">
            Delete this product?
          </Heading>
          <Text variant="body-sm" tone="muted">
            {initial?.name
              ? `“${initial.name}” will be removed from the catalog. This cannot be undone.`
              : "This cannot be undone."}
          </Text>
          <Row gap="sm" justify="end">
            <Button
              type="button"
              variant="ghost"
              caps={false}
              onClick={() => setDeleteOpen(false)}
              disabled={saving}
            >
              Keep product
            </Button>
            <Button
              type="button"
              variant="destructive"
              caps={false}
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Deleting…" : "Delete product"}
            </Button>
          </Row>
        </Stack>
      </Modal>
    </Card>
  );
}
