# Test Report: QueueCare v1.0

**Author:** Ahmed Malik · **Date:** 2026-10-09 · **Build tested:** `17818fb` (local production build and the live site)
**Related:** [Test plan](test-plan.md) · [PRD](PRD.md) · Issue [#13](https://github.com/ahmed-malikk/QueueCare/issues/13)

## 1. Summary

| Level | Result |
|---|---|
| Unit tests (Vitest) | **77 / 77 passed** (21 groups, UT-01 to UT-21; UT-08 reserved for v1.1) |
| Security checks | **16 / 16 passed** |
| System tests, local production build | **67 passed, 2 skipped by design** (23 cases × 3 environments; ST-06.2 runs on ENV-2 only) |
| System tests, live site | **67 passed, 2 skipped by design** |
| CI (typecheck, unit tests, build) | Passing on every push |
| Manual phone checks (MT-01, MT-02) | Pending (see section 5) |

**Exit criteria:** met, except the manual phone checks, which are recorded as outstanding in the v1.0 release notes. No High or Critical defect is open.

## 2. Non-functional results (live site)

| ID | Target | Measured | Result |
|---|---|---|---|
| NFR-6 | Other open screens update within 2 s | **0.8 s (Edge), 0.9 s (Chrome), 0.8 s (phone view)** from the change being saved to the other window updating; 1.3–1.4 s from the doctor's click | Pass |
| NFR-2 | Patient page loads in under 3 s on mobile data | Three cold loads at 375 px, throttled to 1.6 Mbps down, 750 kbps up, 150 ms extra latency: token visible after **0.48–0.57 s**, page fully loaded after **2.28–2.32 s** | Pass |
| NFR-4 | No names or medical details on public pages | ST-05.1 and ST-06.1 find no patient name; security checks find no names and no urgency in the public functions' responses | Pass |
| NFR-5 | Roles enforced by the database | 16 / 16 security checks | Pass |

The same live-update measurement on the local build was 0.9–2.7 s, because every database round trip then crossed the internet from the test PC to the database in Mumbai (0.2–1.5 s measured per round trip). Running the deployed server code in the same region as the database (Vercel `bom1`) is what brings it under 2 seconds.

## 3. Defects

| ID | Defect | Severity | Found by | Fix |
|---|---|---|---|---|
| D-01 | After a failed registration, the previous patient's token and QR code stayed on screen next to the error, so the receptionist could give patient B patient A's QR code | High | Code review of #5, before it was committed | Fixed before commit (`6d1ca2d`): a failed attempt clears the token card |
| D-02 | Six smaller code-review findings: link built from a request header, a read error crashing registration, "Next in line" shown when someone was ahead, a token not announced to screen readers, the clinic's time zone defined in three places, a length message contradicting the rule | Medium / Low | Code review of #5 | Fixed before commit (`6d1ca2d`) |
| D-03 | No way back from the sign-in page except the logo | Low | Trying the app ([#17](https://github.com/ahmed-malikk/QueueCare/issues/17)) | `ec88c88` |
| D-04 | System test patients piled up in the demo queue (44 waiting on one day) | Low | Screenshot review ([#20](https://github.com/ahmed-malikk/QueueCare/issues/20)) | `e846b27`: after each run, the tests' own patients are marked missed |
| D-05 | A missed live-update message left a screen out of date until the next change | Medium | ST-04.1, one run in five ([#21](https://github.com/ahmed-malikk/QueueCare/issues/21)) | `b1ec808`: refresh on reconnect and every 30 s |
| D-06 | Staff screens showed "Staff" instead of a way home | Low | Trying the app ([#22](https://github.com/ahmed-malikk/QueueCare/issues/22)) | `8643360` |
| D-07 | Sign-in said "wrong password" for every failure (including too many attempts and connection problems), and signing out ended the account's session on every device, so one demo visitor's sign-out signed out everyone | High | Investigating an ST-01.3 failure ([#23](https://github.com/ahmed-malikk/QueueCare/issues/23)) | `adb645e`: real reasons shown; sign out ends only this browser's session |

**Test-suite problems (not product defects).** Running the three browser profiles in parallel made them change each other's data in the shared demo queue and overloaded the single local server with live refreshes, so browser windows sometimes hung while closing. Tests now run one at a time and always close their extra windows (`4710f4d`); the full suite also got faster (about 4 minutes).

## 4. Coverage against the user stories

| Story | Unit tests | System tests | Result |
|---|---|---|---|
| US-1 Staff sign-in with roles | UT-09 to UT-11 | ST-01.1 to ST-01.7 | Pass |
| US-2 Register a patient and issue a token | UT-12 to UT-16 | ST-02.1 to ST-02.4 | Pass |
| US-3 Change urgency | UT-01 to UT-05, UT-17, UT-18 | ST-03.1, ST-03.2 | Pass |
| US-4 Call next, every screen updates live | UT-06, UT-19 | ST-04.1, ST-04.2 | Pass |
| US-5 Patient status by link or QR | UT-07, UT-16, UT-20 | ST-05.1, ST-05.2 | Pass |
| US-6 Waiting-room display | UT-06, UT-21 | ST-06.1, ST-06.2 | Pass |

## 5. Outstanding

| Item | Status |
|---|---|
| MT-01 Scan a token's QR code with a real phone | Pending: to be done by the author on his own phone after release |
| MT-02 Status page updates on a real phone while the doctor calls patients | Pending |
| Usability test with a receptionist | Planned as part of the [pilot plan](pilot-plan.md) |
| Safari and Firefox | Not tested in v1.0 |
| System tests in CI | Not in CI: they need the demo accounts and change shared demo data, so they run locally and against the live site before each release |
