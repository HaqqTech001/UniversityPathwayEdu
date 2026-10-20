-- Recover exhausted notification emails after a crashed worker.
create or replace function public.upec_claim_notification_emails(p_limit integer default 10)
returns setof public.upec_email_outbox language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update public.upec_email_outbox
 set status='failed',claimed_until=null,last_error=coalesce(last_error,'Maximum retries reached')
 where attempts>=5 and (status='pending' or (status='sending' and claimed_until<now()));
 return query
 with chosen as (
 select id from public.upec_email_outbox
 where ((status='pending' and next_attempt_at<=now()) or
        (status='sending' and claimed_until<now())) and attempts<5
 order by next_attempt_at,id for update skip locked
 limit least(greatest(p_limit,1),20)
 )
 update public.upec_email_outbox o set
 status='sending',attempts=o.attempts+1,claimed_until=now()+interval '5 minutes'
 from chosen where o.id=chosen.id returning o.*;
end $$;
revoke all on function public.upec_claim_notification_emails(integer) from public,anon,authenticated;
grant execute on function public.upec_claim_notification_emails(integer) to service_role;
