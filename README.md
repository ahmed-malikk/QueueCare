# QueueCare

> A live clinic queue for small clinics in Lahore: urgent patients are seen first, everyone else is served fairly in order, and every patient can see their place and estimated wait.

![Status: in development](https://img.shields.io/badge/status-in%20development-orange) ![Target: v1.0 October 2026](https://img.shields.io/badge/target-v1.0%20Oct%202026-blue)

## The problem

Many clinics still run on paper tokens. Patients don't know how long they'll wait or when their turn will come, receptionists answer "how long?" all day, and urgent cases are handled informally, which can feel unfair to everyone else.

## Planned features (v1.0)

| Feature | Description |
|---|---|
| Staff sign-in with roles | Receptionists and doctors each see only their own screens |
| Join the queue | Walk-in or booked patients, each with an urgency level |
| Call next | The doctor calls the next patient; every open screen updates instantly |
| Patient status link | Each token has a link and QR code showing the patient's place and an estimated wait range, with no app or sign-in needed |
| Waiting-room display | A public screen showing the token now being served, and when a priority patient is called |

## How it works

- **Priority queue:** the most urgent patient is always called next. Patients with the same urgency are seen in order of arrival, and waiting time gradually raises priority so nobody waits indefinitely.
- **Real-time updates:** the database pushes every change to all open screens, so the doctor, receptionist and waiting room always show the same queue.

## Documentation

| Document | Contents |
|---|---|
| [Interview findings](docs/research/interview-findings.md) | Interviews with a clinic receptionist and three patients in Lahore |
| [Business Requirements Document](docs/BRD.md) | Stakeholders, as-is and to-be processes, requirements (MoSCoW), use cases, traceability |
| [Product Requirements Document](docs/PRD.md) | User stories, success metrics, priority and estimate rules, release plan |
| [Project board](https://github.com/users/ahmed-malikk/projects/1) | Every story as an issue, from Todo to Done |

## Tech stack

Next.js · TypeScript · Supabase (Postgres, Auth, Realtime) · Vitest · Playwright · GitHub Actions · Vercel

## Author

**Ahmed Malik** · Part of my portfolio covering software development, business analysis and product management.
