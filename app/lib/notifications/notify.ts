import "server-only";

import { getUserRepository } from "@/app/lib/auth/user-repository";
import { sendEmail } from "./email";
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
      const html =
        input.emailHtml ?? defaultEmailHtml(input.title, input.body, input.link);
      await sendEmail({ to: input.email, subject, html });
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
    const html =
      input.emailHtml ??
      defaultEmailHtml(input.title, input.body, input.link);

    await sendEmail({
      to: recipients,
      subject,
      html,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "notification email failed";
    console.error("[notify] email error:", message);
  }
}

function defaultEmailHtml(
  title: string,
  body?: string,
  link?: string,
): string {
  const linkUrl = link
    ? `${(process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "")}${link}`
    : null;
  return [
    `<div style="font-family: Inter, system-ui, sans-serif; color: #201a18; max-width: 540px; margin: 0 auto; padding: 24px;">`,
    `<h1 style="font-size: 20px; margin: 0 0 12px 0; color: #6c2f00;">${escapeHtml(title)}</h1>`,
    body
      ? `<p style="font-size: 14px; line-height: 1.55; margin: 0 0 16px 0;">${escapeHtml(body)}</p>`
      : "",
    linkUrl
      ? `<p style="margin: 16px 0 0 0;"><a href="${escapeHtml(linkUrl)}" style="display:inline-block; padding: 10px 16px; background: #6c2f00; color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600;">Open in admin</a></p>`
      : "",
    `<p style="margin-top: 24px; font-size: 12px; color: #6b6b6b;">— AdiCon admin</p>`,
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
