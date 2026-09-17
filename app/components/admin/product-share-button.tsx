"use client";

import { useState } from "react";
import { IconButton } from "@/app/components/ui";

interface ProductShareButtonProps {
  productId: string;
  productName: string;
}

export function ProductShareButton({ productId, productName }: ProductShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    // Determine the base URL depending on if window is available
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}/products/${productId}`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: productName,
          text: `Check out ${productName} at Adicon Collections!`,
          url,
        });
      } catch {
        // Suppress errors from user cancellation
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          alert("Product link copied to clipboard!");
        }
      } catch (err) {
        console.error("Failed to copy link", err);
      }
    }
  };

  return (
    <IconButton
      icon="share"
      label="Share product"
      variant="plain"
      size="sm"
      onClick={handleShare}
      disabled={isSharing}
    />
  );
}
