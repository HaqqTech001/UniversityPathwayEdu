-- Billing reminders use each invoice's explicit due date; no assumed payment date.
alter table public.upec_student_monthly_fees add column if not exists due_on date;
create index if not exists upec_monthly_fee_due_reminders on public.upec_student_monthly_fees(due_on) where status in ('unpaid','partial');
