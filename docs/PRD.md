# PRD: QueueCare

**Author:** Ahmed Malik · **Date:** 7 October 2026 · **Status:** Building · **Related:** [BRD](BRD.md) · [interview findings](research/interview-findings.md)

## 1. Problem

At small private clinics in Lahore, patients get a paper token but no idea how long they'll wait: 35–70 minutes in my interviews, longer than expected. They stay glued to the waiting room for fear of missing their turn, and the receptionist spends the evening answering *"aur kitni dair lage gi?"* while also registering patients, taking calls and payments. Urgent and booked patients change the order without explanation, which causes complaints.

**Evidence:** interviews on 7 October 2026 with a receptionist at a 2-doctor family clinic and three patients (findings F1–F7). All four named not knowing the wait as the main problem.

## 2. Target user

**Primary:** the receptionist at a small private clinic (1–2 doctors, 40–50 patients on a busy evening) who runs the queue alone with paper tokens.
**Secondary:** patients waiting there (some with children, some without smartphones) and the doctor who calls them.

## 3. Goals and non-goals

**Goals**
- Every waiting patient can see their place and an honest estimated wait, on their phone or the waiting-room screen.
- Patients can step out without losing their turn.
- Urgent and booked patients are prioritised by clear rules, and the waiting room can see when the order changes.
- A receptionist can run it alone, without training, alongside paper tokens.

**Non-goals (v1)**
- WhatsApp or SMS alerts (needs a paid messaging service).
- Working fully offline.
- Medical records, triage or diagnosis: QueueCare manages the queue, not the patient's care.
- Payments, multiple clinics or multiple doctors' queues.
- A mobile app: patients use a web link.

## 4. User stories

| # | As a… | I want to… | So that… | Acceptance criteria | BRD |
|---|---|---|---|---|---|
| US-1 | receptionist or doctor | sign in and see only my role's screens | the queue can't be changed by anyone else | Given valid staff credentials, I land on my role's dashboard; a receptionist can't open the doctor's screen and vice versa; signed-out users can't open staff screens | FR-1, NFR-5 |
| US-2 | receptionist | register a patient as walk-in or booked, with an urgency level, and get a token number | I can issue tokens as fast as on paper | Given a name or initials, type and urgency, a sequential token (A-1, A-2…) is created in under 30 seconds on one screen; empty name is rejected | FR-2, NFR-1 |
| US-3 | receptionist | change a patient's urgency when the doctor asks | urgent cases are seen first without manual reordering | Changing urgency immediately reorders the queue by the rules in §6 on every screen | FR-4, FR-5 |
| US-4 | doctor | press "Call next" | the right patient comes in and everyone sees it | The highest-priority waiting patient becomes "called"; all open screens update within 2 seconds without refreshing | FR-6, FR-7, NFR-6 |
| US-5 | patient | open the link or QR code on my token, without signing in | I know my place and roughly how long I'll wait, and can step out | The page shows my token, my place in the queue and an estimated wait as a range; it updates live; it shows no other patient's name; it works at 375 px | FR-3, FR-8, NFR-2, NFR-4 |
| US-6 | patient in the waiting room | see a "Now serving" screen | I know where the queue is without a phone | The screen shows the current token and the next 3 in very large text; when a patient is called out of normal order it shows "Priority patient called"; no names | FR-9, NFR-3, NFR-4 |
| US-7 | receptionist | mark a called patient as missed and put them back in the queue | someone who stepped out isn't lost | A missed patient leaves the "now serving" slot and can be re-queued with one action | FR-10 |
| US-8 | patient | optionally create an account | I can see my visits and bookings | Signing up is never required to use the status link; an account shows only my own visits | FR-11 |
| US-9 | clinic owner | see estimated vs actual waits | I can trust the estimates | Each visit stores its estimate at registration and its actual wait when called; a summary shows the share of visits within the estimated range | FR-12 |

**Priority:** US-1 to US-6 are **Must** (the MVP). US-7 to US-9 are **Should**, built only after the Musts are done and tested.

## 5. Success metrics

- **Primary: estimate accuracy.** At least **70%** of visits in the pilot have an actual wait inside the estimated range (from US-9 data).
- **Secondary:**
  - The receptionist reports fewer "how long?" questions during the pilot (before/after comparison with R1).
  - Registering a patient takes **under 30 seconds** (timed in usability testing).
  - 3 of 3 first-time patients can find their place and wait from the QR link without help.
- **How measured:** visit timestamps stored by QueueCare (US-9); a short before/after conversation with the pilot receptionist; timed usability tests.

## 6. Solution overview

A Next.js web app on Vercel, with **Supabase** as the backend: a Postgres database, sign-in for staff, and **Realtime**, which pushes every queue change to all open screens.

**Screens:** receptionist dashboard · doctor screen · public patient status page (via token link or QR) · waiting-room display · optional patient account.

**The core logic: a priority queue** (`src/lib/priorityQueue.ts`, pure TypeScript, no UI). The doctor's "Call next" always takes the patient with the highest **effective priority**:

1. **Urgency:** Emergency > Urgent > Normal.
2. **Aging:** every **30 minutes** of waiting counts as one urgency level, up to Urgent, so a Normal patient can't be overtaken forever. Emergencies always come first.
3. **Booked patients** count as arriving **10 minutes before** their booked time (or when they actually arrived, if later), giving them a head start over walk-ins without overtaking more urgent patients.
4. **Ties** go to whoever has the earlier effective arrival time: fair, first come, first served.

**Estimated wait (a range):** patients ahead × the doctor's average time over the last 5 consultations (10 minutes until there is enough data), shown as 80–125% of that figure and rounded to 5 minutes, e.g. *"about 25–40 min"*. The page notes that urgent arrivals can change it.

**Why it fits:** the rules match what the receptionist and patients described (urgent first, booked counts, fairness, nobody forgotten); the logic is a pure function that can be unit-tested against hand-worked examples; and Realtime replaces the verbal calling and repeated questions.

**Privacy and security:** staff screens require sign-in; Postgres row-level security enforces each role's permissions in the database itself; public pages show tokens only, never names.

## 7. Risks and assumptions

| Risk | Likelihood | Mitigation |
|---|---|---|
| New skills (Supabase, sign-in, Realtime, database security) slow the 3-day build | High | Musts first; Shoulds only after; learn each piece in small steps with a gist check per key file |
| Estimates are wrong when consultation times vary a lot | Medium | Show a range, not an exact time; measure accuracy (US-9) |
| Clinic internet drops | Medium | Screens keep the last known queue and show "reconnecting"; paper tokens still work |
| Patient privacy on public screens | Medium | Tokens only, no names or medical details; tests check it |
| Patients without smartphones are left out | Medium | Waiting-room screen and paper token remain |
| Assumption: the clinic has a screen and a computer that can open a web page | Low | Confirmed by R1 |

## 8. Release plan

- **v0.1, Fri 9 October 2026:** US-1 to US-6 working end to end, with tests.
- **v1.0, Sat 10 October 2026:** deployed on Vercel with demo accounts and sample data; system tests on desktop and phone; README; US-7 to US-9 if time allows.
- **Pilot (after v1.0):** a few days with a small clinic, measuring estimated vs actual wait. The plan will be in `docs/pilot-plan.md`.

## 9. Results

To be completed after launch and the pilot, with real numbers only.
