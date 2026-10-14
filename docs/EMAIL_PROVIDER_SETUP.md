# UPEC transactional email provider

UPEC's Express backend now has a server-only `sendEmail` function in `apps/api/src/mail.js`. It is intended for authorized application notifications (welcome, admissions, payments and CBT notices). Do not expose it as an unauthenticated email-sending endpoint.

## Gmail now

In `apps/api/.env`, configure `MAIL_PROVIDER=gmail`, `MAIL_FROM` and `GMAIL_USER` to your sender Gmail address, and `GMAIL_APP_PASSWORD` to a Google App Password (not the regular Google password). Enable 2-Step Verification as required by Google. Keep these values server-side and never commit them.

Install API dependencies with `pnpm install` from the repository root. `sendEmail({to, subject, text, html})` can then be called from authenticated backend services. No email route or automated notification dispatcher has been enabled yet.

## Supabase Auth OTP

Supabase Auth still handles registration, confirmation OTPs, login, recovery and sessions. To deliver those messages through Gmail instead of Supabase's default email sender, configure **Supabase Dashboard → Authentication → SMTP Settings → Enable custom SMTP** with smtp.gmail.com, port 465, sender Gmail, and Google App Password. This setting is separate from the Express backend mailer and must be completed in the Supabase dashboard. Apply the templates in `docs/AUTH_EMAIL_TEMPLATES.md`.

Custom SMTP does not immediately clear existing rate limits; verify the Auth rate-limit settings and wait for active limits to expire. Do not use the backend mailer to generate independent signup/recovery OTPs without a fully integrated, secure Auth design.

## Resend later

When a domain is verified, either use Resend's SMTP credentials with `MAIL_PROVIDER=smtp` (host `smtp.resend.com`, port 465, secure true, username `resend`, password your Resend API key), or introduce a Resend API adapter behind `sendEmail`. Update Supabase Auth custom SMTP separately to Resend so verification and recovery continue working. Never put provider secrets in the frontend.
