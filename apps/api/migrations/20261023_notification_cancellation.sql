-- Allow the delivery worker to cancel reminders for invoices settled after queueing.
alter table public.upec_email_outbox drop constraint if exists upec_email_outbox_status_check;
alter table public.upec_email_outbox add constraint upec_email_outbox_status_check check (status in ('pending','sending','sent','failed','cancelled'));
