import { z } from "zod";

import { ORDER_STATUSES, SHIPPING_CARRIERS, TRACKING_STEP_KEYS } from "./types";

export const trackingStepSchema = z.object({
  key: z.enum(TRACKING_STEP_KEYS as unknown as [string, ...string[]]),
  label: z.string().trim().min(1, "Label is required").max(80, "Too long"),
  timestamp: z.string().trim().max(80, "Too long").optional().or(z.literal("")),
  status: z.enum(["complete", "current", "upcoming"]),
});

export const updateOrderTrackingSchema = z.object({
  status: z
    .enum(ORDER_STATUSES as unknown as [string, ...string[]])
    .optional(),
  tracking: z.array(trackingStepSchema).optional(),
  expectedDelivery: z
    .string()
    .trim()
    .max(40, "Too long")
    .optional()
    .or(z.literal("")),
  requiresSignature: z.boolean().optional(),
});

export type UpdateOrderTrackingInput = z.infer<
  typeof updateOrderTrackingSchema
>;

const carrierEnum = z.enum(
  SHIPPING_CARRIERS as unknown as [string, ...string[]],
);

export const orderActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("advance") }),
  z.object({ action: z.literal("revert") }),
  z.object({
    action: z.literal("cancel"),
    reason: z.string().trim().min(1, "Reason is required").max(280, "Too long"),
  }),
  z.object({ action: z.literal("restore") }),
  z.object({
    action: z.literal("update-shipping"),
    carrier: carrierEnum.optional(),
    carrierName: z.string().trim().max(80, "Too long").optional(),
    trackingNumber: z.string().trim().max(80, "Too long").optional(),
  }),
  z.object({
    action: z.literal("update-notes"),
    adminNotes: z.string().max(2000, "Too long"),
  }),
  z.object({
    action: z.literal("update-expected-delivery"),
    expectedDelivery: z
      .string()
      .trim()
      .max(40, "Too long")
      .optional()
      .or(z.literal("")),
  }),
  z.object({
    action: z.literal("update-signature"),
    requiresSignature: z.boolean(),
  }),
]);

export type OrderActionInput = z.infer<typeof orderActionSchema>;
