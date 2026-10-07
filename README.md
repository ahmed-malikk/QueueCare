# QueueCare

> Clinics in Lahore still run on paper tokens, and patients wait without knowing how long. QueueCare is a live clinic queue: urgent patients first, fair for everyone else, and an estimated wait on every phone.

**Status:** Day 0, planning and stakeholder interviews (started 2026-10-07). Project 2 of my 3-week portfolio.

## MVP (5 features)

1. **Logins with roles:** patient, receptionist, doctor
2. **Join the queue:** walk-in or booked, with an urgency level
3. **Doctor's "Call next":** the queue updates live on every screen
4. **Estimated wait time** for each patient
5. **Public token display** for the waiting room

**Stack:** Next.js + TypeScript · Supabase (Postgres, Auth, Realtime) · Vitest · Playwright · GitHub Actions · Vercel

## The core idea

A **priority queue** always gives the doctor the most urgent patient next; ties go to whoever arrived first, so it stays fair, and waiting time slowly raises priority so nobody waits forever. **Real-time** means the database pushes every change to every open screen, instead of each screen repeatedly asking for updates.

## Plan

| Day | Date | Work |
|---|---|---|
| 0 | Wed 7 Oct | Repo, issue board, interview guides, accounts |
| 1 | Thu 8 Oct | Interviews; BRD with as-is / to-be process maps and use cases; PRD; issues; scaffold; database design |
| 2 | Fri 9 Oct | Feature by feature: roles and demo logins, priority queue, join queue, call next, real-time, estimated wait, token display |
| 3 | Sat 10 Oct | System tests on desktop and phone, deploy, README, v1.0 release, pilot plan, gist check, lessons learned |

## Docs

- [Stakeholder interview guides](docs/interviews/)
