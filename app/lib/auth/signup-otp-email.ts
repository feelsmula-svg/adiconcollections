import "server-only";

import { sendEmail } from "@/app/lib/notifications/email";
import { renderBrandedEmail } from "@/app/lib/notifications/email-template";

/**
 * Best-effort delivery of the signup OTP. Never throws — callers should
 * already have committed the pending-signup record before invoking this.
 */
export async function sendSignupOtpEmail(
  to: string,
  name: string,
  code: string,
): Promise<void> {
  const firstName = name.split(" ")[0] || name;
  const rendered = renderBrandedEmail({
    preheader: `Your AdiCon verification code is ${code}.`,
    title: "Verify your AdiCon account",
    intro: `Hi ${firstName},`,
    body:
      `Use the 6-digit code below to finish creating your AdiCon account. ` +
      `The code expires in 10 minutes.\n\n` +
      `Your code: ${code}\n\n` +
      `If you didn't request this, you can safely ignore this email.`,
    footerNote:
      "Never share this code with anyone. AdiCon staff will never ask for it.",
  });
  try {
    await sendEmail({
      to,
      subject: `Your AdiCon verification code: ${code}`,
      html: rendered.html,
      text: rendered.text,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "OTP email send failed";
    console.error("[auth/signup] otp email error:", message);
  }
}
