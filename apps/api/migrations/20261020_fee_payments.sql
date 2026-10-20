-- Record payment transactions separately so the amount paid can be audited.
create table if not exists public.upec_fee_payments (
 id uuid primary key default gen_random_uuid(),
 invoice_id uuid not null references public.upec_student_monthly_fees(id),
 amount_ngn numeric(12,2) not null check(amount_ngn>0),
 reference text not null unique,
 recorded_by uuid not null references public.local_accounts(id),
 recorded_at timestamptz not null default now()
);
alter table public.upec_fee_payments enable row level security;
revoke all on public.upec_fee_payments from anon,authenticated;
create or replace function public.upec_record_fee_payment(p_invoice uuid,p_amount numeric,p_reference text,p_staff uuid)
returns public.upec_student_monthly_fees language plpgsql security definer set search_path=public,pg_temp as $$
declare bill public.upec_student_monthly_fees;
begin
 if p_amount is null or p_amount<=0 or length(trim(p_reference))<5 then raise exception 'Invalid payment details'; end if;
 if not exists(select 1 from public.local_staff_members where account_id=p_staff and active=true and (role in ('admin','super_admin') or permissions @> array['finance.manage']::text[])) then raise exception 'Not authorized'; end if;
 select * into bill from public.upec_student_monthly_fees where id=p_invoice for update;
 if not found then raise exception 'Invoice not found'; end if;
 if bill.status='waived' or bill.amount_paid_ngn+p_amount>bill.amount_due_ngn then raise exception 'Payment exceeds outstanding balance or bill is waived'; end if;
 insert into public.upec_fee_payments(invoice_id,amount_ngn,reference,recorded_by) values(p_invoice,p_amount,trim(p_reference),p_staff);
 update public.upec_student_monthly_fees set amount_paid_ngn=bill.amount_paid_ngn+p_amount,
 status=case when bill.amount_paid_ngn+p_amount=bill.amount_due_ngn then 'paid' else 'partial' end where id=p_invoice returning * into bill;
 return bill;
end $$;
revoke all on function public.upec_record_fee_payment(uuid,numeric,text,uuid) from public,anon,authenticated;
grant execute on function public.upec_record_fee_payment(uuid,numeric,text,uuid) to service_role;
