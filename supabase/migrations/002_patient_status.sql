-- QueueCare 002: the patient's status page (US-5, #8).
-- Patients don't sign in: they open a link with their visit's secret public_code (in the QR).
-- This function is the only way the public can read the queue, and it returns only:
--   * the patient's own token, status and date,
--   * the token now with the doctor (already shown on the waiting-room screen),
--   * today's waiting queue WITHOUT names or token numbers: just the fields needed to work out
--     the patient's place (urgency, booked or walk-in, arrival and booking times, and a tie order),
--   * how long today's last five consultations took, for the wait estimate.
-- Run this once in Supabase → SQL Editor, after 001.

create function public.visit_status(p_code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  with me as (
    select id, token_number, status, visit_date
    from public.visits
    where public_code = p_code
  )
  select case when not exists (select 1 from me) then null else jsonb_build_object(
    'token_number', (select token_number from me),
    'status',       (select status from me),
    'visit_date',   (select visit_date from me),
    'with_doctor',  (
      select v.token_number from public.visits v
      where v.visit_date = (select visit_date from me) and v.status = 'called'
      order by v.called_at desc limit 1
    ),
    'waiting', coalesce((
      select jsonb_agg(jsonb_build_object(
        'me',         w.id = (select id from me),
        'urgency',    w.urgency,
        'kind',       w.kind,
        'arrived_at', w.arrived_at,
        'booked_at',  w.booked_at,
        'tie',        w.tie
      ))
      from (
        select v.id, v.urgency, v.kind, v.arrived_at, v.booked_at,
               row_number() over (order by v.token_number) as tie -- keeps the token order without revealing tokens
        from public.visits v
        where v.visit_date = (select visit_date from me) and v.status = 'waiting'
      ) w
    ), '[]'::jsonb),
    'recent_minutes', coalesce((
      select jsonb_agg(m.minutes order by m.done_at)
      from (
        select floor(extract(epoch from (v.done_at - v.called_at)) / 60)::int as minutes, v.done_at
        from public.visits v
        where v.visit_date = (select visit_date from me) and v.status = 'done'
          and v.called_at is not null and v.done_at is not null
        order by v.done_at desc
        limit 5
      ) m
    ), '[]'::jsonb)
  ) end;
$$;

-- Anyone may call it (patients have no account); the secret code is 32 random hex characters.
revoke execute on function public.visit_status(text) from public;
grant  execute on function public.visit_status(text) to anon, authenticated;
