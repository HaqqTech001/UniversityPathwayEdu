import nodemailer from 'nodemailer';

const transportTimeouts={connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000};
const providers = {
  gmail: () => ({
    ...transportTimeouts,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: required('GMAIL_USER'), pass: required('GMAIL_APP_PASSWORD') },
  }),
  smtp: () => ({
    ...transportTimeouts,
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
  if (!html && text) {
    const origin=process.env.PUBLIC_WEB_URL || process.env.WEB_URL || '';
    const logo=origin.startsWith('https://') ? origin.replace(/\/$/,'')+'/images/pathway-logos/pathway-header.png' : '';
    const safe=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const image=logo ? '<img src="'+safe(logo)+'" alt="University Pathway Educational Consult" style="display:block;max-width:210px;max-height:72px;margin-bottom:16px">' : '';
    html='<html><body style="margin:0;padding:24px 12px;background:#F7F8FC;font-family:Arial,sans-serif"><div style="max-width:600px;margin:auto;background:white;border-radius:12px;overflow:hidden"><div style="padding:28px;background:#111A43;color:white">'+image+'<strong>University Pathway Educational Consult</strong></div><div style="padding:28px;color:#111A43"><h2 style="font-size:22px">'+safe(subject)+'</h2><div style="white-space:pre-line;line-height:1.65;color:#334155">'+safe(text)+'</div></div><div style="padding:20px 28px;background:#F7F8FC;color:#64748b;font-size:12px">University Pathway Educational Consult · 23 Olaiya Street, Sawmill Garage, Ilorin</div></div></body></html>';
  }
  return getMailer().sendMail({
    from: { name: process.env.MAIL_FROM_NAME || 'University Pathway Educational Consult', address: sender },
    to, subject, text, ...(html ? { html } : {}),
  });
}

// This module is server-only. Do not expose a public arbitrary-email endpoint.
// Supabase Auth confirmation/recovery emails still use Supabase's configured SMTP.
