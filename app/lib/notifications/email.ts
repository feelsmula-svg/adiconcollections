import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

const DEFAULT_FROM =
  process.env.NOTIFICATION_FROM_EMAIL ??
  "AdiCon Collections <adiconluxuryhair@yahoo.com>";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  /** MIME type, e.g. "application/pdf". */
  contentType?: string;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Optional override for the `From:` address (defaults to NOTIFICATION_FROM_EMAIL). */
  from?: string;
  /** Optional file attachments (e.g. an invoice PDF). */
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
  /** Provider message id, present when delivered. */
  id?: string;
  /** True when the helper just logged to console because no SMTP creds are configured. */
  logOnly?: boolean;
}

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.SMTP_HOST ?? "smtp.mail.yahoo.com";
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = (process.env.SMTP_SECURE ?? "true").toLowerCase() !== "false";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number.isFinite(port) ? port : 465,
    secure,
    auth: { user, pass },
  });
  return cachedTransporter;
}

/**
 * Best-effort email sender. Uses Nodemailer over SMTP when SMTP_USER/SMTP_PASS
 * are set; otherwise logs to stdout so devs see that an email would have gone
 * out. Never throws — callers don't need to catch.
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  if (recipients.length === 0) {
    return { ok: false, error: "No recipients" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const attachmentNote = input.attachments?.length
      ? `\n  attachments: ${input.attachments.length}`
      : "";
    console.info(
      `[email] SMTP creds not set — would have sent:\n` +
        `  to: ${recipients.join(", ")}\n` +
        `  subject: ${input.subject}${attachmentNote}`,
    );
    return { ok: true, logOnly: true };
  }

  try {
    const info = await transporter.sendMail({
      from: input.from ?? DEFAULT_FROM,
      to: recipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments,
    });
    return { ok: true, id: info.messageId };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Email request failed";
    console.error("[email] send error:", message);
    return { ok: false, error: message };
  }
}
