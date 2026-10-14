import nodemailer from 'nodemailer';

const providers = {
  gmail: () => ({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: required('GMAIL_USER'), pass: required('GMAIL_APP_PASSWORD') },
  }),
  smtp: () => ({
    host: required('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user: required('SMTP_USER'), pass: required('SMTP_PASSWORD') },
  }),
};

function required(key) {
  const value = process.env[key]?.trim();
  if (!value) throw new Error('Missing email configuration: ' + key);
  return value;
}

let transporter;
let activeProvider;

export function getMailer() {
  const provider = process.env.MAIL_PROVIDER || 'gmail';
  if (!providers[provider]) throw new Error('Unsupported mail provider: ' + provider);
  if (!transporter || activeProvider !== provider) {
    transporter = nodemailer.createTransport(providers[provider]());
    activeProvider = provider;
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) throw new Error('Missing email fields');
  const sender = required('MAIL_FROM');
  return getMailer().sendMail({
    from: { name: process.env.MAIL_FROM_NAME || 'University Pathway Educational Consult', address: sender },
    to, subject, text, ...(html ? { html } : {}),
  });
}

// This module is server-only. Do not expose a public arbitrary-email endpoint.
// Supabase Auth confirmation/recovery emails still use Supabase's configured SMTP.
