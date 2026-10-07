# Stakeholder Interview Findings

**Author:** Ahmed Malik · **Interviews:** 7 October 2026 · **Participants:** 1 receptionist, 3 patients · **Location:** Lahore

## 1. Purpose

Before writing requirements for QueueCare, I interviewed the people who live with clinic queues every day, to understand how queues work today (the as-is process), what actually hurts, and what any solution must respect.

## 2. Method

- **Semi-structured interviews** (9–18 minutes) using two prepared question guides (Appendix A).
- Questions asked about **real recent visits**, not opinions. The QueueCare idea was introduced only in the last questions, so it did not bias earlier answers.
- Consent was given for note-taking. Participants are anonymised (R1, P1–P3), and no medical details were recorded.

## 3. Participants

| ID | Role | Context | Format | Length |
|---|---|---|---|---|
| R1 | Receptionist, about 2 years in post | Small 2-doctor family clinic | In person | 18 min |
| P1 | Patient, male, 26–30 | Evening visit to a private GP / family clinic | In person | 10 min |
| P2 | Parent, female, 35–40, with a child | Booked evening visit to a pediatric / family clinic | Phone | 11 min |
| P3 | Patient, male, 50–55, regular visitor | Visit to a family doctor, shortly after opening | In person | 9 min |

## 4. How it works today (as-is)

1. A patient arrives; the receptionist asks whether they have an appointment or are a walk-in.
2. Walk-ins get a **handwritten paper token**; appointments are written separately in a **paper register**.
3. Patients wait in a shared waiting area. Tokens are called **verbally** when the doctor says they are ready.
4. The order changes **manually**: appointment patients may be called earlier, and urgent cases go ahead after the receptionist checks with the doctor.
5. If a called patient is not present, the receptionist calls their name, waits briefly, then moves on, and the absent patient can lose their place.
6. Patients ask the receptionist for updates; the receptionist estimates from the number of patients ahead and the doctor's pace.

Tools today: a desktop computer for basic records, a phone, a paper register and paper tokens. The waiting area has a TV, used for general information, not the queue.

## 5. Key numbers

| Measure | What I heard |
|---|---|
| Typical wait | 30–60 min (R1); 65–70 min (P1); 45–50 min after a booked time (P2); 35–40 min (P3) |
| Expected vs actual wait | P1 expected 20–30 min, waited 65–70 · P3 expected about 25 min, waited 35–40 |
| Patients waiting at peak | 15–20 (R1); 8–15 seen by patients |
| Consultation length | 8–12 min, but "some patients take much longer" (R1) |
| Patients per busy day | 40–50 (R1) |
| Busiest time | Evenings, after work (R1, P1, P2) |

## 6. Findings

### F1. Not knowing how long is the main pain, more than the wait itself (4 of 4)
> "Mujhe pata hi nahi tha ke 20 minute hain ya ek ghanta." (P1)
> "Wait se zyada problem ye thi ke pata nahi tha doctor kitna late hain." (P2)
> "Patients sab se zyada ye poochte hain ke abhi aur kitni dair lage gi." (R1)

Both patients who said what they expected (P1, P3) waited longer than they thought. The receptionist's biggest problem is not issuing tokens but **answering the same question all evening** while also handling registrations, calls and payments.

### F2. Patients want to step out, but fear losing their turn (4 of 4)
> "Agar mujhe pata hota ke abhi 40 minute hain to main bahar chala jata." (P1)
> "Bahar jao to darr hota hai ke number na nikal jaye." (P3)

People already leave to eat, pray, sit in the car or run errands (R1), and P3 has seen patients lose their place. P2, waiting with a restless child, would have waited in the car. **The real value of an estimate is knowing whether it's safe to leave.**

### F3. Queue order already has exceptions; people accept them, but want them explained (4 of 4)
> "Emergency ho to pehle dekhna chahiye, lekin baqi logon ko bhi samajh aana chahiye." (P2)

Appointments and urgent cases already break first-come-first-served, and this causes complaints and arguments (R1). All three patients agreed that urgent cases should go first, and P1 and P2 added that **others should be able to understand why** the order changed, so it doesn't feel random.

### F4. Not everyone will use a phone; the token and a screen must stay (3 of 4)
> "Screen pe bas ye pata chal jaye ke kaunsa number chal raha hai, kaafi hai." (P3)

Elderly and non-smartphone patients still need a **paper token** (R1, P3), and even P1, a confident phone user, wants a token handed to him on arrival. A **"Now serving" screen** in the waiting room was valued by R1, P2 and P3, and the TV already exists.

### F5. Estimates must be honest ranges, based on the doctor's real pace (3 of 4)
> "Exact time na dein, andaza bata dein." (P3)
> "Har patient ka time same nahi hota, is liye exact waiting time dena mushkil hota hai." (R1)

Consultations vary (8–12 minutes and sometimes much longer), and the doctor running late was P2's real frustration. A **range** ("about 25–40 min"), updated from how fast the doctor is actually seeing patients, is more credible than an exact promise.

### F6. Phone access should be a link or WhatsApp, not a new app (2 of 3 patients)
> "App download karne ke bajaye WhatsApp pe message aa jaye to zyada easy hai." (P1)

P1 and P2 preferred **a simple website or WhatsApp** over installing an application.

### F7. The receptionist needs fewer steps, and can't rely fully on the internet (R1)
> "Simple ho to acha hai, receptionist ka kaam aur complicated nahi hona chahiye."
> "Agar net chala jaye to phir masla ban jata hai."

Registering a patient must be fast, with no double entry, and usable without training. Internet outages are a real concern.

## 7. What this changes in the requirements

| Finding | Requirement | Priority (MoSCoW) | Change from the original MVP |
|---|---|---|---|
| F1, F5 | Show each patient an **estimated wait as a range**, recalculated from the doctor's actual pace | Must | Sharper: a range, not an exact time |
| F2, F6 | Patients follow their place through a **link or QR code on their token, with no app and no sign-in needed** | Must | **Changed:** sign-in is no longer required to see your place |
| F6 | Patients **may** create an account (e.g. to see their booking), but it is never required | Should | Kept from the original MVP, now optional |
| F4 | The **receptionist registers every patient** and issues the token number; paper tokens still work | Must | Confirmed: receptionist-led, not self-service |
| F4 | **Waiting-room "Now serving" screen** | Must | Confirmed |
| F3 | Urgent and booked patients are prioritised by the system, and the waiting-room screen shows **"Priority patient called"** when the order changes, with no medical detail | Must | Added: transparency of priority |
| F3 | Waiting time slowly raises priority, so nobody waits indefinitely | Must | Confirmed |
| F7 | One-screen receptionist dashboard; registering a patient takes seconds | Must (usability) | Added as a non-functional requirement |
| F2 | Mark a patient as **"stepped out"** instead of skipping them | Could (v1.1) | New idea, deferred |
| F6 | **WhatsApp** alerts when a turn is near | Won't (v1) | Deferred: needs a paid messaging service |
| F7 | Keep working during **internet outages** | Won't (v1) | Deferred; recorded as a risk |

**Biggest change:** the original MVP required patients to sign in. The interviews showed patients want **a link, not an app**, and some won't use a phone at all. So the receptionist registers every patient, and anyone can follow their place through their token's link or QR code without signing in. Receptionists and doctors sign in; a patient account remains **optional** for patients who want one.

## 8. Limitations

- One receptionist and three patients, all in Lahore and at small private clinics. Larger hospitals or specialist clinics may work differently.
- Patient participants were recruited informally, so the sample is small and not random.
- Wait times are as remembered by participants, not measured. The QueueCare pilot will measure estimated against actual waits.

---

## Appendix A: Questions asked

**Receptionist (R1)**
1. Walk me through what happens from the moment a patient walks in until they see the doctor.
2. How do you give out tokens or numbers today?
3. How do patients with an appointment fit in with walk-ins? Who goes first?
4. What are the busiest times? Roughly how many people are waiting at the peak?
5. How does the doctor tell you they're ready for the next patient?
6. What happens when someone arrives who is clearly more urgent?
7. Who decides they skip the queue? Are there any rules?
8. Do other patients complain when someone goes ahead? What do you say?
9. Has anyone waited a very long time because others kept going ahead?
10. When a patient asks "how long will it take?", what do you tell them, and how do you estimate it?
11. Roughly how long does one consultation take? Does it vary a lot?
12. How often do patients leave and come back? What happens if someone misses their turn?
13. What is the most frustrating part of managing the queue?
14. Have you ever lost track of who was next, or had an argument about turns?
15. What tools do you use? Is there reliable internet and a screen in the waiting area?
16. If patients could see their token and an estimated wait on their phone, and a screen showed "Now serving", what would help? What would worry you?
17. What would make you not use a system like this?
18. Is there anything I should have asked but didn't?

**Patients (P1–P3)**
1. Tell me about the last time you went to a clinic. What happened from when you arrived?
2. How did you get your turn: a token, a number, your name in a register?
3. How long did you wait? Was that normal?
4. Did anyone tell you how long it would take? Was it accurate?
5. What did you do while you waited? Could you leave and come back?
6. How did you know when it was your turn? Did you worry you'd miss it?
7. Did anyone go ahead of you? How did you feel about it?
8. What was the worst part of the wait?
9. If someone is more urgent, is it fair for them to go first? What would make it feel fair?
10. If you could see your token and estimated wait on your phone, would you use it? What would you do with that time?
11. Would you rather use WhatsApp, a website, or a screen in the waiting room?
12. Is there anything else about waiting at clinics that bothers you?

Patient interviews were offered in English or Urdu.
