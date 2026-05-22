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
  IconButton,
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
const MAX_IMAGES = 8;
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

interface LengthRow {
  uiKey: string;
  length: string;
  priceDollars: string;
}

interface FormState {
  name: string;
  description: string;
  category: ProductCategory;
  type: string;
  priceDollars: string;
  images: string[];
  stock: string;
  featured: boolean;
  lengthOptions: LengthRow[];
}

function makeLengthRow(initial?: {
  length: string;
  priceCents: number;
}): LengthRow {
  return {
    uiKey: `len-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    length: initial?.length ?? "",
    priceDollars:
      initial && initial.priceCents > 0
        ? (initial.priceCents / 100).toFixed(2)
        : "",
  };
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
      images: [],
      stock: "0",
      featured: false,
      lengthOptions: [],
    };
  }
  const images =
    initial.images && initial.images.length > 0
      ? [...initial.images]
      : initial.imageUrl
        ? [initial.imageUrl]
        : [];
  return {
    name: initial.name,
    description: initial.description,
    category: initial.category,
    type: initial.type,
    priceDollars: (initial.priceCents / 100).toFixed(2),
    images,
    stock: String(initial.stock),
    featured: initial.featured,
    lengthOptions: (initial.lengthOptions ?? []).map(makeLengthRow),
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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageSelected(file: File | null) {
    if (!file) return;
    if (state.images.length >= MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images per product.`);
      return;
    }
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
      setState((prev) => ({ ...prev, images: [...prev.images, dataUrl] }));
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : "Could not read image";
      setError(message);
    } finally {
      setImageReading(false);
    }
  }

  function removeImage(index: number) {
    setState((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setState((prev) => {
      const next = [...prev.images];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return { ...prev, images: next };
    });
  }

  function addLengthRow() {
    setState((prev) => ({
      ...prev,
      lengthOptions: [...prev.lengthOptions, makeLengthRow()],
    }));
  }

  function updateLengthRow(
    uiKey: string,
    field: "length" | "priceDollars",
    value: string,
  ) {
    setState((prev) => ({
      ...prev,
      lengthOptions: prev.lengthOptions.map((row) =>
        row.uiKey === uiKey ? { ...row, [field]: value } : row,
      ),
    }));
  }

  function removeLengthRow(uiKey: string) {
    setState((prev) => ({
      ...prev,
      lengthOptions: prev.lengthOptions.filter((row) => row.uiKey !== uiKey),
    }));
  }

  const typeOptionsForCategory = hairTypes.filter(
    (type) => type.category === state.category,
  );
  const typeRequired = typeOptionsForCategory.length > 0;
  const typeOptions: SelectOption[] = [
    {
      value: "",
      label: typeRequired ? "Select a type…" : "Not applicable",
    },
    ...typeOptionsForCategory.map((type) => ({
      value: type.slug,
      label: type.label,
    })),
  ];

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
    if (state.images.length === 0) {
      setError("Upload at least one product image before saving.");
      setSaving(false);
      return;
    }

    const lengthOptions: { length: string; priceCents: number }[] = [];
    for (const row of state.lengthOptions) {
      const trimmedLabel = row.length.trim();
      if (trimmedLabel.length === 0 && row.priceDollars.trim().length === 0) {
        continue; // skip empty rows
      }
      if (trimmedLabel.length === 0) {
        setError('Each length row needs a label (e.g. 18").');
        setSaving(false);
        return;
      }
      const cents = Math.round(Number(row.priceDollars) * 100);
      if (!Number.isFinite(cents) || cents < 0) {
        setError(`Length "${trimmedLabel}" needs a valid price.`);
        setSaving(false);
        return;
      }
      lengthOptions.push({ length: trimmedLabel, priceCents: cents });
    }

    const payload = {
      name: state.name,
      description: state.description,
      category: state.category,
      type: state.type,
      priceCents,
      images: state.images,
      stock,
      featured: state.featured,
      ...(lengthOptions.length > 0 ? { lengthOptions } : {}),
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
              Fill in the details below. Upload up to {MAX_IMAGES} images per
              product. The first image is the cover everywhere; the rest appear
              in the product gallery.
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

          <Box className="grid grid-cols-1 md:grid-cols-2 items-start gap-md">
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
            <FormField
              label="Type"
              required={typeRequired}
              hint={
                typeRequired
                  ? "Pick a hair type from the taxonomy."
                  : "This category has no hair types — leave blank."
              }
            >
              <Select
                options={typeOptions}
                value={state.type}
                onChange={(event) => update("type", event.target.value)}
                required={typeRequired}
                disabled={!typeRequired}
              />
            </FormField>
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-2 items-start gap-md">
            <FormField
              label="Base price (USD)"
              required
              hint="Used when the product has no length variants."
            >
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
            <FormField
              label="Stock"
              required
              hint="Units available right now."
            >
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

          <Stack gap="sm">
            <Row justify="between" align="center" wrap gap="sm">
              <Stack gap="none">
                <Heading level={3} variant="headline-sm" size="body-lg">
                  Product images
                </Heading>
                <Text variant="body-sm" tone="muted">
                  JPG, PNG, WEBP, or GIF up to {humanBytes(MAX_IMAGE_BYTES)}{" "}
                  each. {state.images.length}/{MAX_IMAGES} uploaded.
                </Text>
              </Stack>
              <FileInput
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                disabled={
                  saving || imageReading || state.images.length >= MAX_IMAGES
                }
                onFileSelected={handleImageSelected}
              >
                {imageReading
                  ? "Reading…"
                  : state.images.length === 0
                    ? "Choose first image"
                    : "+ Add image"}
              </FileInput>
            </Row>

            {state.images.length === 0 ? (
              <Box className="rounded-xl border border-dashed border-outline-variant p-lg">
                <Stack gap="xs" align="center" className="text-center">
                  <Text variant="body-sm" tone="muted">
                    No images yet. Upload at least one to publish this product.
                  </Text>
                </Stack>
              </Box>
            ) : (
              <Box className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm">
                {state.images.map((src, index) => (
                  <Box
                    key={`${src.slice(0, 32)}-${index}`}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-sm"
                  >
                    <Stack gap="xs">
                      <Box className="relative">
                        <ProductThumb
                          src={src}
                          alt={`Product image ${index + 1}`}
                          size="lg"
                          rounded="lg"
                        />
                        {index === 0 ? (
                          <Box className="absolute top-1 left-1 px-xs py-[2px] rounded-full bg-primary text-on-primary text-[10px] font-semibold tracking-[0.14em] uppercase">
                            Cover
                          </Box>
                        ) : null}
                      </Box>
                      <Row gap="xs" justify="between" align="center">
                        <Row gap="xs" align="center">
                          <IconButton
                            icon="arrow_back"
                            label="Move left"
                            size="sm"
                            variant="plain"
                            onClick={() => moveImage(index, -1)}
                            disabled={saving || index === 0}
                          />
                          <IconButton
                            icon="arrow_forward"
                            label="Move right"
                            size="sm"
                            variant="plain"
                            onClick={() => moveImage(index, 1)}
                            disabled={
                              saving || index === state.images.length - 1
                            }
                          />
                        </Row>
                        <IconButton
                          icon="delete"
                          label="Remove image"
                          size="sm"
                          variant="plain"
                          onClick={() => removeImage(index)}
                          disabled={saving}
                        />
                      </Row>
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}
          </Stack>

          <Stack gap="sm">
            <Row justify="between" align="center" wrap gap="sm">
              <Stack gap="none">
                <Heading level={3} variant="headline-sm" size="body-lg">
                  Length & price variants
                </Heading>
                <Text variant="body-sm" tone="muted">
                  Optional. Add a row for each length you sell this product in
                  (e.g. 16&quot;, 18&quot;) with its price. Leave empty if the
                  product comes in a single length only.
                </Text>
              </Stack>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                caps={false}
                onClick={addLengthRow}
                disabled={saving || state.lengthOptions.length >= 20}
              >
                + Add length
              </Button>
            </Row>

            {state.lengthOptions.length === 0 ? (
              <Box className="rounded-xl border border-dashed border-outline-variant p-md">
                <Text variant="body-sm" tone="muted">
                  No length variants. The base price above is used at checkout.
                </Text>
              </Box>
            ) : (
              <Stack gap="xs">
                {state.lengthOptions.map((row) => (
                  <Box
                    key={row.uiKey}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-sm"
                  >
                    <Box className="grid grid-cols-[1fr_1fr_auto] items-end gap-sm">
                      <FormField label="Length">
                        <TextField
                          value={row.length}
                          placeholder='18"'
                          onChange={(event) =>
                            updateLengthRow(
                              row.uiKey,
                              "length",
                              event.target.value,
                            )
                          }
                          disabled={saving}
                        />
                      </FormField>
                      <FormField label="Price (USD)">
                        <TextField
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.priceDollars}
                          placeholder="125.00"
                          onChange={(event) =>
                            updateLengthRow(
                              row.uiKey,
                              "priceDollars",
                              event.target.value,
                            )
                          }
                          disabled={saving}
                        />
                      </FormField>
                      <Box className="pb-xs">
                        <IconButton
                          icon="delete"
                          label={`Remove length ${row.length || "row"}`}
                          size="sm"
                          variant="plain"
                          onClick={() => removeLengthRow(row.uiKey)}
                          disabled={saving}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>

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
