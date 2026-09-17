"use client";

import { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  FileInput,
  FormField,
  Heading,
  Icon,
  Image,
  Row,
  Stack,
  TextField,
  Text,
  Modal,
  IconButton,
  Pagination,
  RadioOption
} from "@/app/components/ui";
import { cn } from "@/app/components/ui/cn";

const resolveSiteUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "https://www.adiconcollections.com";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const SHOP_URL = `${resolveSiteUrl().replace(/\/$/, "")}/shop`;

interface ProductItem {
  id: string;
  name: string;
  imageUrl: string;
}

interface CatalogMakerProps {
  availableProducts?: ProductItem[];
}

export function CatalogMaker({ availableProducts = [] }: CatalogMakerProps) {
  const [gridType, setGridType] = useState<"2x2" | "3x2">("2x2");
  
  const handleGridTypeChange = (value: string) => {
    const next = value as "2x2" | "3x2";
    setGridType(next);
    setImages(Array(next === "2x2" ? 4 : 6).fill(null));
  };
  
  const imageCount = gridType === "2x2" ? 4 : 6;
  const cols = gridType === "2x2" ? 2 : 3;
  const rows = gridType === "2x2" ? 2 : 2;
  
  const [images, setImages] = useState<(string | null)[]>(() => Array(imageCount).fill(null));
  const [label, setLabel] = useState("bouncy");
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const [pickingForIndex, setPickingForIndex] = useState<number | null>(null);
  const [productPage, setProductPage] = useState(1);
  const PRODUCTS_PER_PAGE = 6;

  const paginatedProducts = availableProducts.slice(
    (productPage - 1) * PRODUCTS_PER_PAGE,
    productPage * PRODUCTS_PER_PAGE,
  );
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // We keep a hidden canvas in memory (or off-screen)
  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvasRef.current = canvas;
    }
  }, []);

  function handleImageSelected(index: number, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImages = [...images];
      newImages[index] = e.target?.result as string;
      setImages(newImages);
    };
    reader.readAsDataURL(file);
  }

  function handlePickProductImage(index: number, url: string) {
    const newImages = [...images];
    newImages[index] = url;
    setImages(newImages);
    setPickingForIndex(null);
  }

  function handleRemoveImage(index: number) {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  }

  function openProductPicker(index: number) {
    setProductPage(1);
    setPickingForIndex(index);
  }

  async function generateCatalog() {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Config for grid
    const imgSize = 400; 
    canvas.width = cols * imgSize;
    canvas.height = rows * imgSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw all images
    const loadedImages = await Promise.all(
      images.map((src) => {
        return new Promise<HTMLImageElement | null>((resolve) => {
          if (!src) {
            resolve(null);
            return;
          }
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      })
    );

    loadedImages.forEach((img, i) => {
      if (!img) return;
      const x = (i % cols) * imgSize;
      const y = Math.floor(i / cols) * imgSize;
      
      // Cover the region
      const scale = Math.max(imgSize / img.width, imgSize / img.height);
      const scaledW = img.width * scale;
      const scaledH = img.height * scale;
      const offsetX = (imgSize - scaledW) / 2;
      const offsetY = (imgSize - scaledH) / 2;
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, imgSize, imgSize);
      ctx.clip();
      ctx.drawImage(img, x + offsetX, y + offsetY, scaledW, scaledH);
      ctx.restore();
    });

    // Draw the label in the center
    if (label) {
      const fontSize = 48;
      ctx.font = `bold ${fontSize}px sans-serif`;
      
      const textMetrics = ctx.measureText(label);
      const paddingX = 40;
      const paddingY = 24;
      
      const badgeWidth = textMetrics.width + paddingX * 2;
      const badgeHeight = fontSize + paddingY * 2;
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      // Badge background (rounded rect)
      ctx.fillStyle = "#ffffff";
      const radius = 24;
      const bx = cx - badgeWidth / 2;
      const by = cy - badgeHeight / 2;
      
      ctx.beginPath();
      ctx.moveTo(bx + radius, by);
      ctx.lineTo(bx + badgeWidth - radius, by);
      ctx.quadraticCurveTo(bx + badgeWidth, by, bx + badgeWidth, by + radius);
      ctx.lineTo(bx + badgeWidth, by + badgeHeight - radius);
      ctx.quadraticCurveTo(bx + badgeWidth, by + badgeHeight, bx + badgeWidth - radius, by + badgeHeight);
      ctx.lineTo(bx + radius, by + badgeHeight);
      ctx.quadraticCurveTo(bx, by + badgeHeight, bx, by + badgeHeight - radius);
      ctx.lineTo(bx, by + radius);
      ctx.quadraticCurveTo(bx, by, bx + radius, by);
      ctx.closePath();
      ctx.fill();
      
      // Shadow or border? Let's add a simple border
      ctx.strokeStyle = "#e5e5e5";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, cx, cy + 4);
    }

    setResultImage(canvas.toDataURL("image/jpeg", 0.9));
  }
  
  async function handleShare() {
    if (!resultImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });
    if (!blob) {
      console.error("Failed to create image blob for sharing");
      return;
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const file = new File([blob], "catalog.jpg", { type: "image/jpeg" });
        if (navigator.canShare && navigator.canShare({ files: [file], url: SHOP_URL })) {
          await navigator.share({
            title: "Check out our products!",
            text: "Take a look at these great items!",
            url: SHOP_URL,
            files: [file],
          });
          return;
        }
      } catch {
        // Suppress errors (like user cancellation) and stop execution
        return;
      }
    }

    // Fallback: try to copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        alert("Image copied to clipboard! You can paste it into your social media app.");
        return;
      } catch (err) {
        // Fallback to alert if clipboard fails
        console.error("Failed to copy image to clipboard", err);
      }
    }

    alert("Social sharing files is not supported on this browser. You can download the image instead.");
  }

  return (
    <Stack gap="xl">
      <Row gap="lg" className="flex-wrap items-start">
        {/* Editor Side */}
        <Stack gap="lg" className="flex-1 min-w-[300px]">
          <Card variant="outlined" padding="lg" rounded="2xl">
            <Stack gap="md">
              <Heading level={3} variant="headline-sm">Grid Images</Heading>
              <Stack gap="md">
                <RadioOption
                  name="gridType"
                  value="2x2"
                  checked={gridType === "2x2"}
                  onChange={handleGridTypeChange}
                >
                  <Stack gap="xs">
                    <Text variant="body-md">2×2 Grid</Text>
                    <Text variant="body-sm" tone="muted">4 images (square)</Text>
                  </Stack>
                </RadioOption>
                <RadioOption
                  name="gridType"
                  value="3x2"
                  checked={gridType === "3x2"}
                  onChange={handleGridTypeChange}
                >
                  <Stack gap="xs">
                    <Text variant="body-md">3×2 Grid</Text>
                    <Text variant="body-sm" tone="muted">6 images (taller)</Text>
                  </Stack>
                </RadioOption>
              </Stack>
              <Text variant="body-md" tone="muted">
                Upload up to {imageCount} images or pick from your products to form a {gridType} grid.
              </Text>
              <Box className={cn("grid gap-md", gridType === "2x2" ? "grid-cols-2" : "grid-cols-3")}>
                {images.map((src, i) => (
                  <Box key={i} className="aspect-square relative rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low flex flex-col items-center justify-center p-md text-center">
                    {src ? (
                      <>
                        <Image src={src} alt={`Grid item ${i}`} fit="cover" fill />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 rounded-full p-2 h-auto min-h-0"
                          onClick={() => handleRemoveImage(i)}
                          aria-label="Remove image"
                        >
                          <Icon name="close" />
                        </Button>
                      </>
                    ) : (
                      <Stack gap="md" align="center">
                        <FileInput onFileSelected={(file) => handleImageSelected(i, file)} accept="image/*">
                          Upload #{i + 1}
                        </FileInput>
                        <Text variant="body-sm" tone="muted">or</Text>
                        <Button variant="outline" size="sm" onClick={() => openProductPicker(i)}>
                          Pick Product
                        </Button>
                      </Stack>
                    )}
                  </Box>
                ))}
              </Box>
            </Stack>
          </Card>

          <Card variant="outlined" padding="lg" rounded="2xl">
            <Stack gap="md">
              <Heading level={3} variant="headline-sm">Badge Text</Heading>
              <FormField label="Center label">
                <TextField 
                  value={label} 
                  onChange={(e) => setLabel(e.target.value)} 
                  placeholder="e.g. bouncy ⭐" 
                />
              </FormField>
            </Stack>
          </Card>
          
          <Button onClick={generateCatalog} variant="primary" size="lg" className="w-full">
            Generate Catalog Image
          </Button>
        </Stack>

        {/* Preview Side */}
        <Stack gap="md" className="flex-1 min-w-[300px]">
          <Heading level={3} variant="headline-sm">Preview</Heading>
          {resultImage ? (
            <Stack gap="md">
              <Box className="rounded-2xl overflow-hidden border border-outline border-opacity-50">
                <Image src={resultImage} alt="Generated catalog" width={800} height={800} unoptimized className="w-full h-auto" />
              </Box>
              <Row gap="md">
                <Button 
                  className="flex-1"
                  variant="outline" 
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = resultImage;
                    link.download = "catalog.jpg";
                    link.click();
                  }}
                >
                  Download
                </Button>
                <Button
                  className="flex-1"
                  variant="primary"
                  onClick={handleShare}
                >
                  <Icon name="share" />
                  Share
                </Button>
              </Row>
            </Stack>
          ) : (
            <Box className="aspect-square rounded-2xl bg-surface-container-low border border-outline-variant flex items-center justify-center p-xl text-center">
              <Text variant="body-md" tone="muted">
                Add images and generate to see preview here.
              </Text>
            </Box>
          )}
        </Stack>
      </Row>

      <Modal open={pickingForIndex !== null} onClose={() => setPickingForIndex(null)} width="lg" ariaLabel="Pick Product Image">
        <Stack gap="none" className="flex-1 min-h-0 flex flex-col">
          <Row justify="between" align="center" gap="sm" className="shrink-0 p-lg sm:p-xl pb-sm">
            <Heading level={2} variant="headline-sm">Pick Product Image</Heading>
            <IconButton icon="close" label="Close" onClick={() => setPickingForIndex(null)} />
          </Row>
          <Box className="grid grid-cols-2 sm:grid-cols-3 gap-sm sm:gap-md content-start flex-1 min-h-0 overflow-y-auto px-lg sm:px-xl pb-lg sm:pb-xl">
            {paginatedProducts.map(p => (
              <Box 
                key={p.id} 
                className="cursor-pointer hover:opacity-80 transition-opacity border border-outline-variant rounded-lg overflow-hidden flex flex-col"
                onClick={() => pickingForIndex !== null && handlePickProductImage(pickingForIndex, p.imageUrl)}
              >
                <Box className="aspect-square relative bg-surface-container-low">
                  <Image src={p.imageUrl} alt={p.name} fill fit="cover" />
                </Box>
                <Box className="p-sm text-center bg-surface">
                  <Text variant="body-sm" className="truncate">{p.name}</Text>
                </Box>
              </Box>
            ))}
            {availableProducts.length === 0 && (
              <Text variant="body-sm" tone="muted" className="col-span-full">No products available.</Text>
            )}
          </Box>
          {availableProducts.length > PRODUCTS_PER_PAGE && (
            <Box className="shrink-0 border-t border-outline-variant">
              <Pagination
                totalRows={availableProducts.length}
                pagination={{
                  pageSize: PRODUCTS_PER_PAGE,
                  currentPage: productPage,
                  onPageChange: setProductPage,
                }}
              />
            </Box>
          )}
        </Stack>
      </Modal>
    </Stack>
  );
}
