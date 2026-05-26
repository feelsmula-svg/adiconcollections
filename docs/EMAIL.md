# Email setup

Transactional email is sent via **Nodemailer over SMTP**. The default
configuration uses the existing `adiconluxuryhair@yahoo.com` Yahoo mailbox —
no domain verification required.

## What gets sent today

| Event | Recipient | Trigger |
| --- | --- | --- |
| Welcome | New customer | `POST /api/auth/signup` |
| Password reset link | Account owner | `POST /api/auth/forgot-password` |
| Admin request received | New admin (pending) | `POST /api/auth/admin-signup` |
| Admin approval | Newly approved admin | "Approve" button in `/admin/settings` |
| Contact auto-acknowledgement | Customer who submitted | `POST /api/contact/messages` |
| Concierge reply | Customer | Admin replies in `/admin/messages/[id]` |
| Order confirmed | Customer | Successful Stripe payment |
| Order status changes (advance / cancel / restore) | Customer | Admin actions on `/admin/orders/[id]` |
| Payment failure | Customer + admins | Stripe webhook |
| New order placed | All approved admins | Successful Stripe payment |

Every email runs through `renderBrandedEmail()` in
`app/lib/notifications/email-template.ts` so the layout, colors, and footer
stay consistent.

## Required environment variables

Copy these from `.env.example` into `.env.local`:

```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=adiconluxuryhair@yahoo.com
SMTP_PASS=your_yahoo_app_password_here
NOTIFICATION_FROM_EMAIL=AdiCon Collections <adiconluxuryhair@yahoo.com>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

When `SMTP_USER` or `SMTP_PASS` is missing, `sendEmail` returns
`{ ok: true, logOnly: true }` and prints the would-have-sent details to the
server console — handy for local development without leaking real mail.

## Generating the Yahoo App Password

Yahoo blocks SMTP logins with regular account passwords. You must create a
one-off **app password**:

1. Sign in to <https://login.yahoo.com/>.
2. Open **Account Info → Account security**.
3. Click **Generate app password** (or **Manage app passwords**).
4. Name it something like `AdiCon Collections SMTP`.
5. Copy the 16-character password Yahoo generates and paste it into
   `SMTP_PASS` (no spaces). You won't be able to see it again.
6. Restart `npm run dev` so the new env is picked up.

If the mailbox is protected with 2-Step Verification you'll only be able to
generate app passwords after enabling it.

## Production (Vercel / hosting provider)

Set the same five `SMTP_*` variables plus `NOTIFICATION_FROM_EMAIL` and
`NEXT_PUBLIC_SITE_URL` in your hosting provider's environment settings, then
redeploy. `NEXT_PUBLIC_SITE_URL` should be the public origin (e.g.
`https://adiconcollections.com`) so the CTA links inside emails resolve.

## Verifying it works

1. **Log-only smoke test** — leave `SMTP_USER`/`SMTP_PASS` blank, run
   `npm run dev`, and hit the forgot-password flow. The server console should
   print `[email] SMTP creds not set — would have sent: …`.
2. **Real send** — fill in the SMTP creds and:
   - Sign up at `/` (modal) with a test address you control. The welcome
     email should arrive within ~30s.
   - Click "Forgot password?" and confirm the reset link emails through,
     opens `/auth/reset?token=…`, and lets you set a new password.
   - Submit the contact form. The customer auto-ack should hit your inbox
     and the admins should receive the existing notification too.
   - As a second admin, approve a pending admin signup — the new admin
     should receive the approval mail.
   - Place a test order with Stripe test cards (`4242 4242 4242 4242`).
     Both the customer confirmation and the admin "new order" mail should
     arrive.
3. **Inspect headers** — open a received email's raw source and confirm
   `From:` matches `NOTIFICATION_FROM_EMAIL` and there's a
   `Content-Type: multipart/alternative` block (HTML + plaintext).

## Switching providers later

Because every send goes through `sendEmail()` in
`app/lib/notifications/email.ts`, swapping Yahoo for Gmail, Zoho, SES,
SendGrid, etc. only touches that one file plus the env vars. The public API
(`sendEmail`, `notifyUser`, `notifyAdmins`, `renderBrandedEmail`) stays the
same, so no call sites change.
