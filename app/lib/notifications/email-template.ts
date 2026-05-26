import "server-only";

/**
 * Single source of truth for every transactional email's HTML/plaintext
 * shape. Every transactional email should run through `renderBrandedEmail`
 * so brand changes (color, logo, footer copy) happen in one place.
 */

const BRAND_NAME = "AdiCon Collections";
const BRAND_TAGLINE = "Premium hair, delivered with care";
const SUPPORT_EMAIL = "adiconluxuryhair@yahoo.com";
const PRIMARY = "#6c2f00";
const TEXT = "#201a18";
const MUTED = "#6b6b6b";
const SURFACE = "#fff8f5";

export interface RenderBrandedEmailInput {
  /** Hidden one-line preview text shown in the inbox list. */
  preheader?: string;
  title: string;
  /** Optional greeting line above the body, e.g. "Hi Jasmine,". */
  intro?: string;
  /** Body copy. Use \n\n to separate paragraphs. */
  body?: string;
  /** Optional CTA button label. Requires `ctaHref`. */
  ctaLabel?: string;
  /** Absolute URL for the CTA. Callers should resolve NEXT_PUBLIC_SITE_URL. */
  ctaHref?: string;
  /** Optional small note in the footer block (e.g. "You're receiving this because…"). */
  footerNote?: string;
}

export interface RenderedEmail {
  html: string;
  text: string;
}

export function renderBrandedEmail(
  input: RenderBrandedEmailInput,
): RenderedEmail {
  return { html: renderHtml(input), text: renderText(input) };
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Resolve a relative path against NEXT_PUBLIC_SITE_URL. Pass-through for
 * absolute URLs. Returns null if the input is empty.
 */
export function absoluteUrl(pathOrUrl: string | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!base) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function renderText(input: RenderBrandedEmailInput): string {
  const lines: string[] = [];
  lines.push(input.title);
  lines.push("");
  if (input.intro) {
    lines.push(input.intro);
    lines.push("");
  }
  if (input.body) {
    lines.push(input.body);
    lines.push("");
  }
  if (input.ctaLabel && input.ctaHref) {
    lines.push(`${input.ctaLabel}: ${input.ctaHref}`);
    lines.push("");
  }
  lines.push("—");
  lines.push(`${BRAND_NAME} · ${SUPPORT_EMAIL}`);
  if (input.footerNote) {
    lines.push(input.footerNote);
  }
  return lines.join("\n");
}

function renderHtml(input: RenderBrandedEmailInput): string {
  const paragraphs = (input.body ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return [
    `<!doctype html>`,
    `<html><head><meta charset="utf-8"><title>${escapeHtml(input.title)}</title></head>`,
    `<body style="margin:0;padding:0;background:${SURFACE};font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:${TEXT};">`,
    input.preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${SURFACE};">${escapeHtml(input.preheader)}</div>`
      : "",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};padding:32px 16px;">`,
    `<tr><td align="center">`,
    `<table role="presentation" width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ecdcd0;">`,
    // header
    `<tr><td style="padding:20px 28px;border-bottom:1px solid #f0e3d8;">`,
    `<div style="font-size:18px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${PRIMARY};">${escapeHtml(BRAND_NAME)}</div>`,
    `<div style="font-size:12px;color:${MUTED};margin-top:2px;">${escapeHtml(BRAND_TAGLINE)}</div>`,
    `</td></tr>`,
    // body
    `<tr><td style="padding:28px;">`,
    `<h1 style="font-size:22px;line-height:1.3;margin:0 0 16px 0;color:${PRIMARY};">${escapeHtml(input.title)}</h1>`,
    input.intro
      ? `<p style="font-size:15px;line-height:1.55;margin:0 0 14px 0;">${escapeHtml(input.intro)}</p>`
      : "",
    paragraphs
      .map(
        (p) =>
          `<p style="font-size:14px;line-height:1.6;margin:0 0 14px 0;">${escapeHtml(p)}</p>`,
      )
      .join(""),
    input.ctaLabel && input.ctaHref
      ? `<p style="margin:20px 0 0 0;"><a href="${escapeHtml(input.ctaHref)}" style="display:inline-block;padding:12px 22px;background:${PRIMARY};color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">${escapeHtml(input.ctaLabel)}</a></p>`
      : "",
    `</td></tr>`,
    // footer
    `<tr><td style="padding:18px 28px;border-top:1px solid #f0e3d8;background:#fbf3ec;">`,
    `<p style="font-size:12px;line-height:1.5;color:${MUTED};margin:0;">${escapeHtml(BRAND_NAME)} · <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};text-decoration:underline;">${SUPPORT_EMAIL}</a></p>`,
    input.footerNote
      ? `<p style="font-size:11px;line-height:1.5;color:${MUTED};margin:6px 0 0 0;">${escapeHtml(input.footerNote)}</p>`
      : "",
    `</td></tr>`,
    `</table>`,
    `</td></tr></table>`,
    `</body></html>`,
  ].join("");
}
