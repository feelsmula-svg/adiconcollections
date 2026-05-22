import { z } from "zod";

const discountSchema = z.object({
  type: z.enum(["percent", "fixed", "free-shipping"]),
  value: z.number().int().min(0).max(1_000_000_00),
  minSubtotalCents: z.number().int().min(0).max(1_000_000_00).default(0),
});

export const campaignSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(120, "Name is too long"),
    headerText: z
      .string()
      .trim()
      .max(200, "Header text too long")
      .optional()
      .default(""),
    modalTitle: z
      .string()
      .trim()
      .max(160, "Modal title too long")
      .optional()
      .default(""),
    modalBody: z
      .string()
      .trim()
      .max(1000, "Modal body too long")
      .optional()
      .default(""),
    ctaLabel: z
      .string()
      .trim()
      .max(60, "CTA label too long")
      .optional()
      .default(""),
    ctaHref: z
      .string()
      .trim()
      .max(200, "CTA href too long")
      .optional()
      .default(""),
    promoCode: z
      .string()
      .trim()
      .toUpperCase()
      .max(40, "Promo code too long")
      .optional()
      .default(""),
    discount: discountSchema.optional(),
    showInHeader: z.boolean().default(false),
    showModal: z.boolean().default(false),
    enabled: z.boolean().default(false),
    startsAt: z
      .string()
      .trim()
      .max(40)
      .optional()
      .default(""),
    endsAt: z
      .string()
      .trim()
      .max(40)
      .optional()
      .default(""),
  })
  .refine(
    (data) => {
      // Header campaigns need text.
      if (data.showInHeader && !data.headerText) return false;
      // Modal campaigns need a title.
      if (data.showModal && !data.modalTitle) return false;
      return true;
    },
    {
      message:
        "Header banner needs header text; modal popup needs a modal title.",
    },
  );

export type CampaignInput = z.infer<typeof campaignSchema>;
