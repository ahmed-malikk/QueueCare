# Test Plan: QueueCare v1.0

**Author:** Ahmed Malik · **Date:** 2026-10-09 · **Status:** Executed (see the [test report](test-report.md))
**Related:** [PRD](PRD.md) · [BRD](BRD.md) · [Test report](test-report.md) · Issue [#13](https://github.com/ahmed-malikk/QueueCare/issues/13)

## 1. Purpose

This plan defines how QueueCare v1.0 is tested before release: what is tested, how, where, and what counts as ready to ship. Results are recorded in the [test report](test-report.md), so the plan can be reused for later versions.

## 2. Scope

**In scope**

| Area | What is tested |
|---|---|
| Queue rules | Urgency order, aging (30 minutes per level, up to Urgent), booked head start, tie-breaks, wait estimate (`src/lib/priorityQueue.ts`) |
| Screen logic | Access rules, registration input, queue rows, Call next, patient status, waiting-room view (`src/lib/*.ts`) |
| Security | Row-level security, column grants and the two public database functions, acting as each role (`scripts/check-security.mjs`) |
| User journeys | The six user stories (US-1 to US-6), end to end in a real browser against the real database |
| Live updates | A change on one screen appears on another open screen without reloading (NFR-6) |
| Privacy | Public pages show no names and no medical details (NFR-4) |
| Responsive layout | Every screen usable at 375 px and 1280 px without sideways scrolling (NFR-2) |
| Performance | Patient page load on mobile data (NFR-2) and live-update delay (NFR-6), measured on the live site |

**Out of scope for v1.0:** load testing beyond one clinic (about 50 patients a day), Safari and Firefox, a formal accessibility audit, the Should items (#10–#12).

## 3. Test levels and approach

| Level | Tool | What it proves | Run with |
|---|---|---|---|
| **Unit** | Vitest | The rules give exactly the hand-calculated answers, including edge cases | `npm test` |
| **Security** | Node script with the Supabase client | Each role (public, receptionist, doctor) can do exactly what it should and nothing more | `npm run check:security` |
| **System (end-to-end)** | Playwright | A user can complete each story in the production build, in a real browser, against the real database | `npm run test:e2e`, or `E2E_BASE_URL=… npx playwright test` for the live site |
| **Regression (CI)** | GitHub Actions | Typecheck, unit tests and build pass on every push | automatic |
| **Manual** | A real phone | Scanning a printed or on-screen QR code opens the status page | by hand |

**Approach.** The decisions live in pure functions (`src/lib`), so they get the most thorough coverage at unit level, where tests are fast and exact. System tests check that each screen wires that logic up correctly, covering each acceptance criterion at least once. The security script is the only test that proves the database itself enforces the rules; the screens are not trusted to.

**Shared test data.** All system tests use the public demo accounts and one shared demo queue. Tests therefore run one at a time, check what must hold whoever acts first (for example "the called patient leaves every waiting list"), and a clean-up step after each run marks the tests' own patients as *missed* (nothing is deleted).

## 4. Test environments

| ID | Browser | Screen | Notes |
|---|---|---|---|
| ENV-1 | Microsoft Edge (desktop) | 1280 × 860 | |
| ENV-2 | Google Chrome (desktop) | 1280 × 860 | Also runs the multi-window display test |
| ENV-3 | Microsoft Edge, phone-sized | 375 × 812, touch | Smallest common phone width |
| ENV-4 | Node.js 22 (no browser) | – | Unit tests and the security script |
| ENV-5 | Live site | – | https://queuecare-zeta.vercel.app, server in Vercel's Mumbai region next to the database |
| ENV-6 | A real phone | – | Manual QR scan |

The system under test is the **production build** (`next build` + `next start` locally, or the Vercel deployment).

## 5. Entry and exit criteria

**Entry:** the build compiles, typecheck passes, the migrations (001–003) have been run.

**Exit (ready to release):**
- 100% of unit tests pass
- 100% of security checks pass
- 100% of system test cases pass on ENV-1, ENV-2 and ENV-3, locally and on the live site
- NFR-2 and NFR-6 measured on the live site and within target
- No open defect of severity *High* or *Critical*

**Defect severity:** *Critical* = data exposed or wrong patient called · *High* = a story cannot be completed, or wrong information shown to staff · *Medium* = works but unreliable or broken on one screen size · *Low* = cosmetic or a missing shortcut.

## 6. Unit test cases

| ID | Function | What it checks | Story |
|---|---|---|---|
| UT-01 | `minutesBetween` | Whole minutes, rounded down, never negative | US-3 |
| UT-02 | `effectiveArrival` | Booked patients count from 10 minutes before the booking, or from arrival if later | US-3 |
| UT-03 | `effectiveLevel` | Urgency plus one level per 30 minutes waited, capped at Urgent; Emergency stays Emergency | US-3 |
| UT-04 | `orderQueue` | Higher level first, then earlier arrival, then lower token | US-3 |
| UT-05 | `orderQueue` | Booked patients in the mix | US-3 |
| UT-06 | `nextPatient`, `wasCalledOutOfOrder` | Who is called next; when a call counts as a priority call | US-4, US-6 |
| UT-07 | `estimateWait` | Patients ahead × average of the last 5 consultations (10 min default), shown as 80–125%, rounded to 5 | US-5 |
| UT-08 | – | Reserved for estimated vs actual wait (#12, not in v1.0) | – |
| UT-09 | `homeFor` | Where each role lands after signing in | US-1 |
| UT-10 | `requiredRole` | Which pages need which role (and look-alike paths don't) | US-1 |
| UT-11 | `checkAccess` | Allowed, or sent to sign-in or to the person's own screen | US-1 |
| UT-12 | `formatToken` | `1` → `A-1` | US-2 |
| UT-13 | `parseBookedTime` | `HH:MM` today in Lahore; rejects impossible times | US-2 |
| UT-14 | `validateRegistration` | Clean data, or every error at once (name, type, time, urgency) | US-2 |
| UT-15 | `clinicDay` | The Lahore date, whatever the server's clock (UTC) says | US-2 |
| UT-16 | `formatEstimate` | "Next in line", "Under 5 min", "About 15–25 min" | US-2, US-5 |
| UT-17 | `urgencyLabel` | "Normal", "Urgent", "Emergency", "Raised to Urgent" | US-3 |
| UT-18 | `buildQueueView` | Rows in priority order with position, level and minutes waited | US-3 |
| UT-19 | `planCallNext` | Finish the current patient, call the next, flag a priority call | US-4 |
| UT-20 | `describeStatus` | The patient's place and wait from anonymous queue data; called, finished, missed, another day | US-5 |
| UT-21 | `describeWaitingRoom` | Now serving, next three, priority flag | US-6 |

## 7. Security checks (`npm run check:security`)

| Role | Check |
|---|---|
| Public | Cannot read visits · cannot register patients · can read the queue-changed signal · cannot call internal functions |
| Public | Can read a token's status with its code · the status contains no names or other token numbers · a wrong code shows nothing |
| Public | Can read the waiting-room display with no names or urgency · the display's next three match the app's queue rules (drift check) |
| Receptionist | Can see the queue · can register a patient and gets a token number |
| Doctor | Can see the queue · cannot register patients · can update a visit |
| Anyone | Cannot backdate an arrival · cannot rewrite a token number |

## 8. System test cases

Each case runs on ENV-1, ENV-2 and ENV-3 unless noted. IDs follow the BRD traceability table: ST-0n tests user story US-n; ST-00 is the shared page shell.

| ID | User story | Case | Expected result |
|---|---|---|---|
| ST-00 | – | Home page | Loads, shows the logo, no sideways scrolling |
| ST-00.1 | – | Tab icon | `/icon.svg` is served |
| ST-00.2 | – | Way home from sign-in | Header shows Home on the sign-in page, Staff on public pages |
| ST-00.3 | – | Way home from staff screens | Header shows Home on reception and doctor screens |
| ST-01.1 | US-1 | Signed-out visitor opens a staff screen | Sent to sign-in |
| ST-01.2 | US-1 | Wrong password | Error shown, stays on sign-in |
| ST-01.3 | US-1 | Receptionist signs in | Lands on reception; can't open the doctor's screen; sign-in page sends them back |
| ST-01.4 | US-1 | Doctor signs in | Lands on the doctor's screen; can't open reception |
| ST-01.5 | US-1 | Sign out | Staff screens locked again |
| ST-01.6 | US-1 | Sign-in page at 375 px | No sideways scrolling |
| ST-01.7 | US-1 | Demo account buttons | Fill in a working demo login |
| ST-02.1 | US-2 | Register a walk-in | Token `A-n`, QR code and status link shown; form clears with the cursor in the name box |
| ST-02.2 | US-2 | Empty name | Rejected, nothing issued |
| ST-02.3 | US-2 | Booked without a time | Time field appears; error shown; typed name kept |
| ST-02.4 | US-2 | Reception desk at 375 px | No sideways scrolling |
| ST-03.1 | US-3 | Raise a patient to Emergency | Badge and button change; the patient moves up the queue at once |
| ST-03.2 | US-3 | Long queue at 375 px | No sideways scrolling |
| ST-04.1 | US-4 | Doctor presses Call next with reception open in another window | A patient is called; the reception window drops them without reloading; delay measured (NFR-6, ≤ 2 s on the live site) |
| ST-04.2 | US-4 | Doctor's screen | With you now and Next up shown; no sideways scrolling |
| ST-05.1 | US-5 | Patient opens their link in a fresh, signed-out browser | Token and place shown; no patient name anywhere; live connection; no sideways scrolling |
| ST-05.2 | US-5 | Wrong or shortened link | "We couldn't find this token" |
| ST-06.1 | US-6 | Waiting-room display | Now serving and Next shown; at most three tokens; no names; live |
| ST-06.2 | US-6 | An emergency is called ahead of an earlier patient (ENV-2 only, a TV screen) | The display changes without reloading; when it shows that emergency, it says "Priority patient called" |

## 9. Non-functional measurements (live site)

| ID | Requirement | How it is measured | Target |
|---|---|---|---|
| NFR-2 | Patient page usable on a phone over mobile data | ST-05.1 at 375 px; three cold loads with Chrome throttled to 1.6 Mbps down, 750 kbps up, 150 ms extra latency | Fully loaded in under 3 s |
| NFR-4 | No names or medical details on public pages | ST-05.1, ST-06.1, security checks | No names, no urgency in public data |
| NFR-5 | Each role can only do what it needs, enforced by the database | Security checks | All pass |
| NFR-6 | Changes appear on all open screens within 2 seconds | ST-04.1 on the live site: time from the change being saved to the other window updating | ≤ 2 s |

## 10. Manual checks

| ID | Check | Environment |
|---|---|---|
| MT-01 | Scan the token's QR code with a real phone camera; the status page opens and shows the token | ENV-6 |
| MT-02 | Leave the status page open while the doctor calls patients; the page changes without touching it | ENV-6 |
