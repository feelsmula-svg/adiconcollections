"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import { sendEmail } from "@/app/lib/notifications/email";
import { getNotificationRepository } from "@/app/lib/notifications/notification-repository";
import { getMessageRepository } from "./message-repository";
import type {
  ContactMessage,
  ContactMessageStatus,
  ContactReplyChannel,
} from "./types";

const replySchema = z.object({
  messageId: z.string().trim().min(1, "Missing message id"),
  body: z
    .string()
    .trim()
    .min(1, "Reply cannot be empty")
    .max(4000, "Reply is too long"),
  channel: z.enum(["email", "in-app", "both"]),
});

export type ReplyInput = z.infer<typeof replySchema>;

export interface ReplyResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  message?: ContactMessage;
  /** True when the email leg actually delivered (vs. logged to console). */
  emailDelivered?: boolean;
  /** True when an in-app notification was created for the customer. */
  inAppDelivered?: boolean;
}

export async function replyToContactMessage(
  input: ReplyInput,
): Promise<ReplyResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getMessageRepository();
  const message = await repo.findById(parsed.data.messageId);
  if (!message) {
    return { ok: false, error: "Message not found" };
  }

  const channel: ContactReplyChannel = parsed.data.channel;
  const wantEmail = channel === "email" || channel === "both";
  const wantInApp = channel === "in-app" || channel === "both";

  let emailDelivered = false;
  let inAppDelivered = false;

  // Resolve the recipient's userId if the sender was signed in OR if their
  // email matches an existing customer account — that way the in-app
  // notification reaches them when they log in.
  let recipientUserId = message.userId;
  if (!recipientUserId && wantInApp) {
    try {
      const userRepo = await getUserRepository();
      const customer = await userRepo.findByEmail(message.email);
      if (customer) recipientUserId = customer.id;
    } catch {
      // best-effort lookup
    }
  }

  if (wantEmail) {
    const result = await sendEmail({
      to: message.email,
      subject: `Re: ${message.subject}`,
      html: defaultReplyEmail(
        message.name,
        message.subject,
        parsed.data.body,
        actor.name || actor.email,
      ),
    });
    emailDelivered = result.ok && !result.logOnly;
    if (!result.ok) {
      return {
        ok: false,
        error: result.error ?? "Email could not be sent",
      };
    }
  }

  if (wantInApp && recipientUserId) {
    try {
      const notifRepo = await getNotificationRepository();
      await notifRepo.create({
        kind: "admin-reply",
        title: `Re: ${message.subject}`,
        body: parsed.data.body,
        link: `/account/messages/${message.id}`,
        recipientUserId,
      });
      inAppDelivered = true;
    } catch (error: unknown) {
      const m =
        error instanceof Error ? error.message : "notification create failed";
      console.error("[messages] in-app notify error:", m);
    }
  }

  const updated = await repo.appendReply(parsed.data.messageId, {
    reply: {
      body: parsed.data.body,
      channel,
      authorEmail: actor.email,
      authorName: actor.name,
    },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${parsed.data.messageId}`);

  return {
    ok: true,
    message: updated ?? message,
    emailDelivered,
    inAppDelivered,
  };
}

export async function updateContactMessageStatus(
  messageId: string,
  status: ContactMessageStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }
  const trimmed = messageId.trim();
  if (!trimmed) return { ok: false, error: "Missing message id" };

  const repo = await getMessageRepository();
  const updated = await repo.updateStatus(trimmed, status);
  if (!updated) return { ok: false, error: "Message not found" };
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${trimmed}`);
  return { ok: true };
}

function defaultReplyEmail(
  customerName: string,
  originalSubject: string,
  body: string,
  authorName: string,
): string {
  return [
    `<div style="font-family: Inter, system-ui, sans-serif; color: #201a18; max-width: 540px; margin: 0 auto; padding: 24px;">`,
    `<p style="font-size: 14px; line-height: 1.55; margin: 0 0 16px 0;">Hi ${escapeHtml(customerName)},</p>`,
    `<p style="font-size: 14px; line-height: 1.55; margin: 0 0 16px 0; white-space: pre-wrap;">${escapeHtml(body)}</p>`,
    `<p style="font-size: 14px; line-height: 1.55; margin: 0 0 16px 0;">— ${escapeHtml(authorName)}, AdiCon concierge</p>`,
    `<hr style="border:none; border-top: 1px solid #e5d9d2; margin: 24px 0;" />`,
    `<p style="font-size: 12px; color: #6b6b6b; margin: 0;">In reply to: <em>${escapeHtml(originalSubject)}</em></p>`,
    `</div>`,
  ].join("");
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
