import "server-only";

import { getUserRepository } from "@/app/lib/auth/user-repository";
import { sendEmail, type EmailAttachment } from "./email";
import { absoluteUrl, renderBrandedEmail } from "./email-template";
import { getNotificationRepository } from "./notification-repository";
import type { NotificationKind } from "./types";

export interface NotifyAdminsInput {
  kind: NotificationKind;
  title: string;
  body?: string;
  /** Optional internal link rendered in the bell dropdown and the email CTA. */
  link?: string;
  /** Override the email subject (defaults to `title`). */
  emailSubject?: string;
  /** Override the email body HTML (defaults to a render of `title`/`body`). */
  emailHtml?: string;
}

export interface NotifyUserInput {
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
  /** When set, also email the user at this address. */
  email?: string;
  emailSubject?: string;
  emailHtml?: string;
  /** Optional file attachments included on the email (e.g. an invoice PDF). */
  attachments?: EmailAttachment[];
}

/**
 * Records an in-app notification on a single user's account and, if `email`
 * is provided, sends them a copy by email too. Best-effort.
 */
export async function notifyUser(input: NotifyUserInput): Promise<void> {
  if (!input.userId) return;

  try {
    const repo = await getNotificationRepository();
    await repo.create({
      kind: input.kind,
      title: input.title,
      body: input.body,
      link: input.link,
      recipientUserId: input.userId,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "user notification failed";
    console.error("[notify-user] create error:", message);
  }

  if (input.email) {
    try {
      const subject = input.emailSubject ?? input.title;
      if (input.emailHtml) {
        await sendEmail({
          to: input.email,
          subject,
          html: input.emailHtml,
          attachments: input.attachments,
        });
      } else {
        const rendered = renderBrandedEmail({
          title: input.title,
          body: input.body,
          ctaLabel: input.link ? "Open in AdiCon" : undefined,
          ctaHref: absoluteUrl(input.link) ?? undefined,
        });
        await sendEmail({
          to: input.email,
          subject,
          html: rendered.html,
          text: rendered.text,
          attachments: input.attachments,
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "user email failed";
      console.error("[notify-user] email error:", message);
    }
  }
}

/**
 * Records an in-app admin notification and emails every approved admin.
 * Best-effort: every step is wrapped so a failure in one channel never
 * blocks the caller's primary operation (e.g., order creation).
 */
export async function notifyAdmins(input: NotifyAdminsInput): Promise<void> {
  // Persist the in-app notification.
  try {
    const repo = await getNotificationRepository();
    await repo.create({
      kind: input.kind,
      title: input.title,
      body: input.body,
      link: input.link,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "notification create failed";
    console.error("[notify] create error:", message);
  }

  // Email all approved admins.
  try {
    const userRepo = await getUserRepository();
    const admins = await userRepo.list({
      role: "admin",
      adminStatus: "approved",
    });
    const recipients = admins
      .map((admin) => admin.email)
      .filter((email): email is string => Boolean(email));
    if (recipients.length === 0) return;

    const subject = input.emailSubject ?? input.title;
    if (input.emailHtml) {
      await sendEmail({ to: recipients, subject, html: input.emailHtml });
    } else {
      const rendered = renderBrandedEmail({
        title: input.title,
        body: input.body,
        ctaLabel: input.link ? "Open in admin" : undefined,
        ctaHref: absoluteUrl(input.link) ?? undefined,
        footerNote: "You're receiving this because you're an AdiCon admin.",
      });
      await sendEmail({
        to: recipients,
        subject,
        html: rendered.html,
        text: rendered.text,
      });
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "notification email failed";
    console.error("[notify] email error:", message);
  }
}
