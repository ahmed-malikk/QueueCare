-- QueueCare: initial database schema and security rules.
-- Run once in Supabase → SQL Editor. Safe to read top to bottom: every block says what it does.
--
-- Design:
--   profiles     each signed-in user's role (patient by default; staff roles are set by an admin)
--   visits       one row per patient visit: token, name, walk-in/booked, urgency, status, timestamps
--   queue_ticks  a single public row that changes whenever the queue changes (no patient data);
--                public screens listen to it and then fetch the data they are allowed to see
--
-- Security: row-level security (RLS) is on for every table, and access is granted explicitly
-- (the project does not expose new tables automatically).

-- ── Roles ────────────────────────────────────────────────────────────────────

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'patient' check (role in ('patient', 'receptionist', 'doctor')),
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Every new sign-up gets a profile with the patient role. Staff roles are only ever set
-- by an admin in the SQL Editor, so nobody can sign up as a receptionist or doctor.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The signed-in user's role, used by the security rules below.
create function public.app_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid();
$$;

grant select on public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

-- ── Visits ───────────────────────────────────────────────────────────────────

create table public.visits (
  id                  uuid primary key default gen_random_uuid(),
  visit_date          date not null, -- the clinic day of arrived_at; always set by the trigger below
  token_number        integer not null,
  patient_name        text not null check (char_length(btrim(patient_name)) between 1 and 80),
  kind                text not null check (kind in ('walk_in', 'booked')),
  booked_at           timestamptz,
  urgency             smallint not null default 0 check (urgency between 0 and 2), -- 0 normal, 1 urgent, 2 emergency
  status              text not null default 'waiting' check (status in ('waiting', 'called', 'done', 'missed')),
  arrived_at          timestamptz not null default now(),
  called_at           timestamptz,
  done_at             timestamptz,
  called_out_of_order boolean not null default false, -- drives "Priority patient called" on the waiting-room screen
  estimate_low_min    integer,                        -- estimate shown at registration, kept to measure accuracy
  estimate_high_min   integer,
  public_code         text not null unique default replace(gen_random_uuid()::text, '-', ''), -- secret part of the QR link
  patient_id          uuid references public.profiles (id),                                   -- optional patient account
  created_by          uuid references auth.users (id) default auth.uid(),
  unique (visit_date, token_number),
  check (kind = 'walk_in' or booked_at is not null)
);

alter table public.visits enable row level security;

create index visits_queue_idx on public.visits (visit_date, status);

-- Before each new visit is saved:
--   1. visit_date is derived from arrived_at (Lahore time), so the two can never disagree.
--      It is stored, not just calculated, because (visit_date, token_number) must be unique.
--   2. Token numbers restart at 1 every day (A-1, A-2, …). The lock stops two receptionists
--      registering at the same instant from getting the same number.
create function public.assign_token_number() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.visit_date := (new.arrived_at at time zone 'Asia/Karachi')::date;
  perform pg_advisory_xact_lock(hashtext('visits_token_number'));
  select coalesce(max(token_number), 0) + 1 into new.token_number
    from public.visits where visit_date = new.visit_date;
  return new;
end;
$$;

create trigger visits_assign_token
  before insert on public.visits
  for each row execute function public.assign_token_number();

grant select on public.visits to authenticated;
-- Registering a patient: arrival time is always "now" (set by the database), so nobody can
-- backdate an arrival to move someone up the queue. Token number and visit date come from the trigger.
grant insert (patient_name, kind, booked_at, urgency, estimate_low_min, estimate_high_min, patient_id)
  on public.visits to authenticated;
-- Staff may only change the columns that are meant to change. Token, arrival time, visit date
-- and the original estimate can never be rewritten, which keeps the history trustworthy.
grant update (urgency, status, called_at, done_at, called_out_of_order, patient_id) on public.visits to authenticated;

create policy "Staff can see the queue"
  on public.visits for select to authenticated
  using (public.app_role() in ('receptionist', 'doctor'));

create policy "Patients with an account can see their own visits"
  on public.visits for select to authenticated
  using (patient_id = auth.uid());

create policy "Receptionists can register patients"
  on public.visits for insert to authenticated
  with check (public.app_role() = 'receptionist');

create policy "Staff can update the queue"
  on public.visits for update to authenticated
  using (public.app_role() in ('receptionist', 'doctor'))
  with check (public.app_role() in ('receptionist', 'doctor'));

-- No delete policy: visits are never deleted, so estimated vs actual waits can be measured.

-- ── Public change signal ─────────────────────────────────────────────────────

create table public.queue_ticks (
  id         smallint primary key default 1 check (id = 1),
  changed_at timestamptz not null default now()
);

insert into public.queue_ticks (id) values (1);

alter table public.queue_ticks enable row level security;

grant select on public.queue_ticks to anon, authenticated;

create policy "Anyone can see when the queue last changed"
  on public.queue_ticks for select to anon, authenticated
  using (true);

create function public.touch_queue_tick() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.queue_ticks set changed_at = now() where id = 1;
  return null;
end;
$$;

create trigger visits_touch_tick
  after insert or update on public.visits
  for each statement execute function public.touch_queue_tick();

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Staff screens listen to visits (RLS still applies); public screens listen to queue_ticks.

alter publication supabase_realtime add table public.visits, public.queue_ticks;

-- ── Lock down internal functions ─────────────────────────────────────────────
-- Functions in the public schema can be called through the API by default.
-- These are internal (triggers and the role check), so outsiders must not call them.

revoke execute on function public.handle_new_user()     from public, anon, authenticated;
revoke execute on function public.assign_token_number() from public, anon, authenticated;
revoke execute on function public.touch_queue_tick()    from public, anon, authenticated;
revoke execute on function public.app_role()            from public, anon;
grant  execute on function public.app_role()            to authenticated;
