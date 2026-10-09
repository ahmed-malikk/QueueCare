-- QueueCare 003: the waiting-room "Now serving" display (US-6, #9).
-- A public screen, so it may show token numbers but no names and no medical details. Urgency
-- is a medical detail, so this function puts the queue in order HERE and returns only:
--   * the token with the doctor and whether it was called out of normal order,
--   * the next three tokens, in the order the doctor will call them,
--   * how many patients are waiting.
-- The order follows the same rules as src/lib/priorityQueue.ts (PRD §6). The security check
-- script compares this function's order with orderQueue() on the real queue, so the two
-- can't drift apart unnoticed.
-- Run this once in Supabase → SQL Editor, after 002.

create function public.waiting_room() returns jsonb
language sql stable security definer set search_path = '' as $$
  with today as (
    select (now() at time zone 'Asia/Karachi')::date as day
  ),
  waiting as (
    select
      v.token_number,
      -- Booked patients count from 10 minutes before their booking, or their arrival if later.
      case when v.kind = 'booked' and v.booked_at is not null
           then greatest(v.arrived_at, v.booked_at - interval '10 minutes')
           else v.arrived_at end as effective_arrival,
      v.urgency
    from public.visits v, today
    where v.visit_date = today.day and v.status = 'waiting'
  ),
  ranked as (
    select
      token_number,
      effective_arrival,
      -- Emergency stays 2; otherwise every 30 whole minutes waited adds a level, up to Urgent (1).
      case when urgency = 2 then 2
           else least(urgency + floor(greatest(floor(extract(epoch from (now() - effective_arrival)) / 60), 0) / 30), 1)
      end as level
    from waiting
  ),
  current_call as (
    select v.token_number, v.called_out_of_order
    from public.visits v, today
    where v.visit_date = today.day and v.status = 'called'
    order by v.called_at desc
    limit 1
  )
  select jsonb_build_object(
    'with_doctor', (select token_number from current_call),
    'priority',    coalesce((select called_out_of_order from current_call), false),
    'next', coalesce((
      select jsonb_agg(n.token_number order by n.level desc, n.effective_arrival, n.token_number)
      from (
        select token_number, level, effective_arrival from ranked
        order by level desc, effective_arrival, token_number
        limit 3
      ) n
    ), '[]'::jsonb),
    'waiting_count', (select count(*) from waiting)
  );
$$;

revoke execute on function public.waiting_room() from public;
grant  execute on function public.waiting_room() to anon, authenticated;
