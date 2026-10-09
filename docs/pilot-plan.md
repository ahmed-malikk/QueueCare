# Pilot Plan: QueueCare at a small clinic

**Author:** Ahmed Malik · **Date:** 2026-10-09 · **Status:** Planned, clinic not yet confirmed
**Related:** [PRD §5 success metrics](PRD.md) · [Interview findings](research/interview-findings.md) · [Test report](test-report.md) · Issue [#15](https://github.com/ahmed-malikk/QueueCare/issues/15)

## 1. Goal

Find out, with real patients, whether QueueCare does what the interviews asked for: tells patients how long they will wait, accurately enough that they trust it, and takes the "how much longer?" questions off the receptionist.

The pilot answers one question for each [PRD success metric](PRD.md):

| Metric (PRD §5) | Question the pilot answers |
|---|---|
| Estimate accuracy (primary) | Do at least 70% of actual waits fall inside the range we showed? |
| Fewer "how long?" questions | Does the receptionist get asked noticeably less? |
| Registration under 30 seconds | Can the receptionist keep up on a busy evening without falling back to paper? |
| Patients find their place unaided | Can first-time patients use the QR link without help? |

## 2. Clinic and people

| | |
|---|---|
| **Clinic** | A small 2-doctor family clinic in Lahore, like the one R1 works at (40–50 patients on a busy day, busiest in the evening). R1's clinic is the first choice; this still has to be confirmed with R1 and the clinic's doctor. |
| **Staff** | The receptionist (registers patients, sets urgency) and one doctor (calls patients). |
| **Patients** | Everyone who comes in during the pilot evenings. Using the QR link is optional. |
| **Me** | On site for the first evening to set up and help; on call for the rest. |

## 3. Duration and schedule

**Five clinic evenings in one week**, run **alongside the paper tokens**, so nothing breaks if the app or the internet fails.

| Day | What happens |
|---|---|
| Before | 20-minute walkthrough with the receptionist and doctor; create the clinic's own staff accounts (not the public demo accounts); set up the screens (section 4) |
| Evening 0 (baseline) | Paper only. The receptionist keeps a tally of "how long?" questions |
| Evenings 1–5 | QueueCare with paper tokens kept as a backup. Same tally every evening |
| After | 15-minute conversation with the receptionist and doctor; export and analyse the data |

## 4. Setup

| Screen | Device | Page |
|---|---|---|
| Reception | The clinic's existing desktop computer | `/reception` |
| Doctor | The doctor's phone or a cheap tablet on the desk | `/doctor` |
| Waiting room | The TV already in the waiting area (interviews), via a laptop or TV browser | `/display` |
| Patients | Their own phones, scanning the QR code on the receptionist's screen | `/status/…` |

Before the pilot: the clinic gets its **own** receptionist and doctor accounts (the demo accounts are public and must not be used with real patients), the Supabase project moves to a paid plan or gets a daily export (the free plan has no backups and pauses unused projects), and the demo test data is cleared.

## 5. What is measured, and how

| Measure | Source | How |
|---|---|---|
| Estimate accuracy | QueueCare's own records: for every visit, the estimate shown at registration (`estimate_low_min`, `estimate_high_min`) and the real wait (`called_at` minus `arrived_at`) | SQL query after the pilot: share of visits whose real wait was inside the range, and the median miss in minutes |
| "How long?" questions | A tally sheet at reception | One tick per question; baseline evening vs pilot evenings |
| Registration time | Spot timing on two evenings | Time from the patient reaching the desk to the token appearing, 10 patients each |
| Patients using the link | Short exit question to a sample of patients | "Did you scan the code? Did you understand your place and wait? Did you step out?" |
| Staff experience | End-of-pilot conversation | What helped, what got in the way, would they keep using it |

No medical details are recorded at any point; patients' names stay visible to staff only, as in the app today.

## 6. Success criteria

The pilot is a success if:
- **≥ 70%** of real waits fall inside the shown range (primary metric)
- "How long?" questions fall by **at least half** compared with the baseline evening
- The **median registration time is under 30 seconds**, and reception never had to stop using QueueCare to keep up
- At least **3 first-time patients** found their place and wait from the QR link without help
- The receptionist and doctor want to keep using it

If accuracy is below 70%, the estimate rules (average of the last five consultations, shown as 80–125%) are adjusted using the pilot's own data before trying again.

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Clinic internet drops | Medium | Screens stop updating | Paper tokens continue in parallel; screens show "Reconnecting…" and catch up when the connection returns |
| Receptionist too busy to use both systems | Medium | Data gaps | Start on a quieter evening; I help on evening 1; registration is designed for under 30 seconds |
| Patients without smartphones | Medium | Some can't use the link | The TV display and paper tokens still work for them |
| Patients called while outside | Low | A patient misses their turn | Existing practice continues (call the name, wait briefly); "missed and re-queue" (#10) is planned for v1.1 |
| Free hosting plan pauses or loses data | Medium | App unavailable, records lost | Paid plan or daily export before the pilot (section 4) |
| Privacy concern from the clinic | Low | Clinic declines | Only names and arrival times are stored, no medical details; public pages show token numbers only |
| Estimates are poor at first (few consultations to average) | High on evening 1 | Patients distrust the estimate | The first estimates use a 10-minute default; the range is shown as a range, not a promise |

## 8. After the pilot

Results (real numbers only) go into the README's Results section and a short pilot report. Changes it suggests go into the v1.1 backlog alongside the Should items: missed and re-queue (#10), an optional patient account (#11), and estimated-vs-actual reporting in the app (#12).
