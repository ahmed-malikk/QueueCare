# Lessons Learned: QueueCare

**Author:** Ahmed Malik · **Date:** 2026-10-09 · **Project:** QueueCare v1.0 (project 2 of my 3-week portfolio) · **Live:** https://queuecare-zeta.vercel.app

What building, testing and shipping QueueCare taught me, and what I'm changing for the next project.

---

## 1. Technologies: what each one did

| Layer | What I used | What I learned |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Server Components read data on the server; Server Actions handle forms. This version renamed middleware to `proxy.ts` and added `refresh()`, so reading the version's own docs first saved time |
| Database | **Supabase Postgres** | Triggers can enforce rules the app can't get wrong: token numbers per day under a lock, arrival time always set by the database |
| Security | **Row-level security** and column grants | The database decides who can read and change what. Pages and actions check too, but a missing check can't leak data |
| Sign-in | **Supabase Auth** with cookie sessions | `getClaims()` verifies the login token locally (ES256), saving a network trip on every page. Defaults matter: `signOut()` signs out every device unless told otherwise |
| Live updates | **Supabase Realtime** | One small "something changed" table that public screens can listen to without seeing any patient data; a safety refresh covers missed messages |
| Styling | **Tailwind CSS** + **shadcn/ui** | Components copied into the repo can be changed; a design grows from the product's own world (the paper token slip), not from a template |
| Testing | **Vitest**, **Playwright**, a security script | Three kinds of proof: the rules are right, the screens work, and the database refuses what it should |
| Hosting | **Vercel**, Mumbai region | Putting the server next to the database halved the live-update delay |

**Biggest technology lesson:** a backend is mostly about *who is allowed to do what*. Most of the hard decisions in QueueCare were permissions and privacy, not features.

## 2. How good software is structured

- **Pure core, imperative shell.** Every decision is a pure function in `src/lib` (queue order, access, validation, Call next). Pages only read, call and save. 77 unit tests run in about two seconds.
- **One source of truth.** The reception list, the doctor's Next up, the patient's place and Call next all use the same `orderQueue`, so the screens can't disagree.
- **Check the shape, then the meaning.** `"25:00"` has the right shape and the wrong meaning; checking only the shape lets an `Invalid Date` slip through and fail later, far from the cause.
- **Security as close to the data as possible.** The proxy is a quick first check, the page checks the role, the Server Action checks again (it's a public endpoint), and row-level security is the final word.
- **Privacy by design.** Public pages call database functions that return token numbers only. When the waiting-room screen needed the queue in order, the order was computed in the database so urgency never leaves it, and a test compares that order with the app's rules.

## 3. Testing: what actually happened

- **A code review found the worst bug, not a test.** After a failed registration, the previous patient's QR code stayed on screen. Every test registered patients that succeeded, so none could see it. Asking "what does the screen show after a failure that follows a success?" did.
- **Measure before claiming.** Live updates took 0.9–2.7 s on my PC, over the 2-second target. Measuring showed why (each database round trip from my PC to Mumbai took 0.2–1.5 s); moving the server next to the database brought it to 0.8–0.9 s.
- **Shared test data needs care.** Tests in three browsers changed each other's data in one demo queue, overloaded the local server and filled the demo queue with 44 test patients. Running tests one at a time and tidying up after each run fixed both, and made the suite faster.
- **A misleading error message hides the real problem.** When sign-in failed in a test, the app said "wrong password" for every failure, so I couldn't tell whether it was a rate limit or the network. The fix showed the real reason, and investigating it found a worse bug: signing out ended every session of the shared demo accounts.
- **Flaky isn't random.** Every intermittent failure had a cause (slow network, leaked browser windows, parallel tests). Reading the trace before changing code found each one.

**Final numbers (v1.0):** 77 / 77 unit tests, 16 / 16 security checks, 23 system test cases × 3 environments passing on the local build and the live site. Details: [test plan](test-plan.md) · [test report](test-report.md).

## 4. Business analysis

- **Interviews changed the product.** The brief said "show the wait". The interviews said the real value is knowing whether it's safe to step out, which is why the status page says "this page updates by itself, so you can step out".
- **Ask about real recent visits, not opinions.** Numbers like "expected 20–30 minutes, waited 65–70" came from asking about the last visit.
- **Trace everything.** Requirement → user story → issue → test ID made the test report easy to write and showed nothing was missed.

## 5. Project management

- **MVP discipline held.** All six Must stories shipped; the three Should stories (missed and re-queue, patient accounts, estimated-vs-actual reporting) went to the backlog instead of delaying the release.
- **Unplanned work was real and worth it:** a design system, a redesign, a code review and seven defect fixes. Each had its own issue, so the board still told the truth.
- **Deploy before the last day.** Deploying on day 4 left time to measure the live site and fix what it showed.

## 6. Did the changes from FlowPlan work?

| Promised after FlowPlan | What happened |
|---|---|
| Board and tooling before day 1; commit after every feature | Done: 24 issues on the board, one commit per issue |
| PRD and BRD first, stories straight into issues | Done before any feature code |
| Phone width from the first screen | Done: every system test runs at 375 px |
| Explain each key file back as it's written | Partly: explain-backs fell behind in the second half; the gist check is still to do |
| Backend skills step by step | Done: schema and security first, then one screen at a time |
| Real users early | Done: four interviews on day 2 |

## 7. What I'm changing for the next project (CommitteeKeeper)

1. **Review the code before every commit of a key feature**, not once: the best catch of this project came from a review.
2. **Design test data from day one:** separate test accounts or a test-only marker, and a clean-up step, before writing the first system test.
3. **Measure the non-functional targets on the deployed site early**, not just before release.
4. **Keep the explain-backs going all the way through** the project, one key file at a time.
5. **Read the defaults** of every service used (like `signOut`'s scope), not just the parts I call.

## Still open on QueueCare

- The pilot at a real clinic ([pilot plan](pilot-plan.md))
- The manual check with a real phone camera (test report MT-01, MT-02)
- The gist check (three checkpoint questions from the portfolio plan)
- Should stories for v1.1: [#10](https://github.com/ahmed-malikk/QueueCare/issues/10), [#11](https://github.com/ahmed-malikk/QueueCare/issues/11), [#12](https://github.com/ahmed-malikk/QueueCare/issues/12)
