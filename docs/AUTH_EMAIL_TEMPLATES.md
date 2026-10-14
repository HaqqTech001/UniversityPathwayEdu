# UPEC Supabase authentication email templates

Configure in Supabase Dashboard → Authentication → Email Templates. Supabase Auth owns these messages; changing the Express SMTP variables alone does not configure Auth delivery.

## Confirm signup — subject
Your UPEC verification code

## Confirm signup — HTML
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#0b1a42"><div style="background:#123578;color:#fff;padding:22px;border-radius:14px 14px 0 0"><h1 style="margin:0;font-size:24px">University Pathway</h1><p style="margin:6px 0 0">Educational Consult</p></div><div style="padding:28px;border:1px solid #e2e8f0"><h2>Verify your email address</h2><p>Welcome to UPEC. Enter this six-digit code in the verification screen to activate your account.</p><div style="font-size:34px;letter-spacing:8px;font-weight:700;text-align:center;padding:20px;background:#f1f5f9;border-radius:10px">{{ .Token }}</div><p>Do not share this code with anyone. If you did not register, ignore this message.</p></div><p style="color:#64748b;font-size:12px">University Pathway Educational Consult · This is an automated security message.</p></div>

## Reset password — subject
Reset your UPEC password

## Reset password — HTML
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#0b1a42"><div style="background:#123578;color:#fff;padding:22px;border-radius:14px 14px 0 0"><h1 style="margin:0;font-size:24px">University Pathway</h1><p style="margin:6px 0 0">Educational Consult</p></div><div style="padding:28px;border:1px solid #e2e8f0"><h2>Password recovery</h2><p>Enter this six-digit recovery code on the UPEC password recovery screen.</p><div style="font-size:34px;letter-spacing:8px;font-weight:700;text-align:center;padding:20px;background:#f1f5f9;border-radius:10px">{{ .Token }}</div><p>If you did not request a password reset, you can ignore this message. Never share this code.</p></div><p style="color:#64748b;font-size:12px">University Pathway Educational Consult · This is an automated security message.</p></div>

## Required deployment checks
1. Configure Supabase Authentication → SMTP Settings using a verified Gmail sender and a Google App Password; keep credentials only in secure configuration.
2. Save both email templates above in Supabase Dashboard.
3. Verify email confirmation is enabled and check OTP expiry and resend rate limits.
4. Test signup, resend, OTP verification, password recovery, and password update with a real inbox.
5. Replace Gmail with a verified official no-reply sender after domain purchase. Never use an unverified from-address.
