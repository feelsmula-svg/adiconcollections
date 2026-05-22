import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM =
  process.env.NOTIFICATION_FROM_EMAIL ?? "AdiCon <onboarding@resend.dev>";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Optional override for the `From:` address (defaults to NOTIFICATION_FROM_EMAIL). */
  from?: string;
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
  /** Provider message id, present when delivered. */
  id?: string;
  /** True when the helper just logged to console because no provider is configured. */
  logOnly?: boolean;
}

/**
 * Best-effort email sender. Uses Resend's HTTP API when `RESEND_API_KEY` is
 * set; otherwise logs to stdout so the dev sees that an email would have
 * gone out. Never throws — callers don't need to catch.
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  if (recipients.length === 0) {
    return { ok: false, error: "No recipients" };
  }

  if (!apiKey) {
    console.info(
      `[email] RESEND_API_KEY not set — would have sent:\n` +
        `  to: ${recipients.join(", ")}\n` +
        `  subject: ${input.subject}`,
    );
    return { ok: true, logOnly: true };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from ?? DEFAULT_FROM,
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        `[email] resend.send failed ${response.status}: ${errorBody}`,
      );
      return { ok: false, error: `Resend returned ${response.status}` };
    }
    const data = (await response.json().catch(() => null)) as
      | { id?: string }
      | null;
    return { ok: true, id: data?.id };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Email request failed";
    console.error("[email] send error:", message);
    return { ok: false, error: message };
  }
}
