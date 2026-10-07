-- QueueCare demo data. Run in Supabase → SQL Editor AFTER creating the two demo users
-- in Authentication → Users (see the README for the demo accounts).

-- 1. Give the demo accounts their staff roles.
update public.profiles set role = 'receptionist', display_name = 'Demo receptionist'
  where id = (select id from auth.users where email = 'reception@queuecare.demo');

update public.profiles set role = 'doctor', display_name = 'Demo doctor'
  where id = (select id from auth.users where email = 'doctor@queuecare.demo');

-- 2. A few waiting patients for today, so every screen has something to show.
--    Token numbers are assigned automatically (A-1, A-2, …).
insert into public.visits (patient_name, kind, booked_at, urgency, arrived_at) values
  ('Demo patient 1', 'walk_in', null,                             0, now() - interval '42 minutes'),
  ('Demo patient 2', 'booked',  now() - interval '20 minutes',    0, now() - interval '35 minutes'),
  ('Demo patient 3', 'walk_in', null,                             1, now() - interval '25 minutes'),
  ('Demo patient 4', 'walk_in', null,                             0, now() - interval '15 minutes'),
  ('Demo patient 5', 'walk_in', null,                             0, now() - interval '5 minutes');

-- Check: should list two staff profiles and five waiting visits.
select p.role, p.display_name, u.email from public.profiles p join auth.users u on u.id = p.id where p.role <> 'patient';
select token_number, patient_name, kind, urgency, status from public.visits order by token_number;
