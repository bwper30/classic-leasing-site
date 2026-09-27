# Is my car eligible?

<!-- note: a checker, not a wall of text. Every rule reads from src/config/eligibility.ts.
The copy must not restate a number. The "needs a conversation" path matters more here than at
a normal provider — design for it. -->

## H1

Is your car eligible?

## Intro

Six questions. It takes about a minute and you don't have to give us your details to get an
answer.

What matters most is whether the car costs a decent amount to run relative to what it's worth. [SAV-050]

---

## Questions

**1. What is it?**
Make, model and year. If it's unusual, just tell us in your own words.

**2. How far has it travelled?**
Odometer reading, near enough.

**3. Roughly what's it worth?**
What you'd expect if you sold it privately today. A rough figure is fine.

**4. What does it cost you to run in a year?**
Fuel, servicing, tyres, registration and insurance. Include the parts you know are coming.

**5. How long would you want the lease to run?**
{{TODO: term options — 1 to 5 years}}

**6. What condition is it in?**
- Good, with service history
- Sound, history is patchy
- Needs work

---

## Result states

### State 1 — Looks eligible

**H2:** Looks like we can work with this.

On what you've told us, your car fits our criteria. The next step is a quote, which sets out
the agreed value, the rental, your running-cost budget and our fee.

We'll still need to look at the car properly before anything is agreed. [ELG-010]

**Get a quote** → /contact

---

### State 2 — Needs a conversation

**H2:** This one needs a conversation.

Your car sits outside one of our criteria, but that doesn't settle it. The rules are a starting
point and a car that warrants a closer look gets one. [ELG-010]

Here's what fell outside: **{{TODO: reason, rendered from the rule that failed}}**

Tell us about the car and we'll come back to you.

**Talk to us** → /contact

---

### State 3 — Outside our criteria

**H2:** We don't think this one works.

Here's why: **{{TODO: reason, rendered from the rule that failed}}**

We could take you through a quote anyway, but on what you've told us it wouldn't be worth your
time or ours. If something about the car changes, or you think we've read it wrong, tell us.

**Tell us anyway** → /contact

---

## Below the checker

### H2 — Our criteria

{{TODO: eligibility criteria — vehicle age at lease end, kilometres, minimum and maximum agreed
value, body type, condition. Render from config. Show "criteria coming soon" until settled.}}

Running costs matter more than anything on that list. A car with low running costs and a high agreed value is a poor fit even when it passes every rule, and a car that costs a lot to keep on the road but isn't worth much is what this is built for. [SAV-050]
