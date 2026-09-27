# Assumptions and unverified items

Everything the site depends on that is not yet settled, verified or approved. The production
build (`npm run build`) refuses to run while items marked **blocks launch** remain; the preview
build shows them as highlighted markers.

## Owner decisions

| Item | Where | Status |
|---|---|---|
| Eligibility rules: age at lease end 20, odometer 250,000 km, agreed value $5,000–$40,000, "needs work" routes to a conversation | `src/config/eligibility.ts` | Proposed 28 Sep 2026, awaiting approval — **blocks launch** |
| Running-cost ratio bands for the checker: 0.8 eligible, 0.5 outside | `src/config/eligibility.ts` | Calibrated from the calculator, awaiting approval — **blocks launch** |
| Calculator defaults: salary, term, kilometres, each running cost | `src/config/calculator.ts` | Placeholders — **blocks launch** |
| Default pay cycle (fortnightly) | `src/config/calculator.ts` | Placeholder — **blocks launch** |
| Which figure leads the result: take-home per pay, or the whole term including the agreed value paid at the start and the residual at the end | `src/config/calculator-basis.ts` | Set to take-home per pay — **blocks launch** |
| Whether the $1,200 base fee is GST-inclusive | `src/config/pricing.ts` | Assumed inclusive — **blocks launch** |
| Whether the residual is quoted inclusive of the GST on the sale back to the customer | `src/config/pricing.ts` | Assumed the residual is the whole amount payable — **blocks launch** |
| GST credits on insurance and registration | `src/config/pricing.ts` | Excluded (conservative) — confirm with the adviser |
| Kilometres: collected but do not change the result | `src/config/calculator.ts` | Keep for the quote, or drop the input |
| Term options 1–5 years | `eligibility.md` TODO | **blocks launch** |
| Trading entity, ABN, domain, email, phone, response time | `src/config/site.ts`, `contact.md` | **blocks launch** |

## The calculator's model

- **Comparison:** keeping the car and paying every running cost from after-tax pay, against
  packaging it — pre-tax deduction plus an ECM post-tax contribution, with GST credits on
  eligible running costs, the lease rental and the fee.
- **Both views are shown.** The difference in take-home pay (per pay and over the term), and the
  whole-term result, which adds the agreed value paid to the customer at the start and subtracts
  the residual paid at the end. Undiscounted.
- **The brief's rule of thumb** ("the deal works when the agreed value is at or below one year's
  running costs"; "$15,000 against $8,000 is marginally behind") matches the take-home view.
  On the whole-term view the same car is well ahead, because the $15,000 sale price counts.
  This is why the headline basis is an owner decision.
- **Lease rental:** level monthly rentals in arrears at the lease rate (12%), amortising the agreed
  value to the residual. Rental ex GST in the package (GST charged and credited to the employer).
- **Residual:** ATO minimum for the term, TD 93/142 with an 8-year effective life.
- **FBT:** statutory formula, 20% of the agreed value, reduced to nil by an ECM contribution. The
  employer remits GST on the contribution, so it funds the package net of one-eleventh.
- **Base value reduction after four years:** not modelled (see `tax-fy2027.ts`).
- **Tax constants** are for 2026–27 and the FBT year ending 31 March 2027. A lease longer than one
  year assumes today's rates hold. Re-verify each 1 July and 1 April.
- **Medicare levy:** flat 2%; low-income reductions not modelled (target salaries are well above).
- **Reimbursement limit:** the fund can only reimburse what has accumulated. The calculator works
  in whole years and does not model timing within a year, including the unexpected bill.
- **The fee** includes the 10% variable component on gross claims above $6,000 a year. The kink at
  $6,000 is modelled exactly.

## Tax and legal

- **Division 66 second-hand goods credit** (Classic Leasing's own GST position). Likely available
  where the lease documents contemplate the end-of-term sale and residual comparison from the
  outset — *LeasePlan Australia Ltd v FCT* [2009] FCA 1309, GSTD 2013/2, GSTD 2012/6. Re-check the
  determinations' current status before relying on it. If unavailable, the lease rate absorbs it;
  the calculator does not model it.
- **CGT on the customer's sale of the car:** cars are exempt (ITAA 1997 s118-5). Confirm with the adviser.
- **Whose four years start the base value reduction** in a sale and leaseback — for the adviser;
  affects 5-year quotes only.
- **Licensing position and external dispute resolution** — with the lawyer. The footer licensing
  block renders nothing until `SITE.licensingBlock` is set. Do not assert or deny a status.
- **Privacy policy, website terms, complaints procedure** — lawyer deliverables; the pages exist as
  placeholders — **blocks launch**.

## Copy written at build stage

These strings are not in the copy deck and need the owner's review against CL-02a and the claims
register before launch:

- Calculator: "Pay cycle", "Each year of the lease", "of which, lease charge on the agreed value",
  "Employee contribution, after tax", "Take-home pay after car costs", "Difference in take-home
  over the term", "Agreed value paid to you at the start", "Obligation", "Difference over the
  term", "An unexpected bill", the unexpected-bill sentence, "If your running costs are
  different", "Difference per year", the table caption, the basis note in the assumptions list,
  "Print or save this result", and the "what would change it" sentence.
- Eligibility checker: "Make and model", "Year", "Type", the four body-type options, each rule's
  reason, and the four-line criteria list.
- Contact: the "Check this:" prefix on field errors (from the design system's Field guidance).
- 404 page.

## Other

- **Money-flow diagram** (`src/figures/money-flow.svg`) predates the figure set: 960 units wide,
  no phone layout. On phones it scrolls sideways inside its own box. Redraw it in `figures.py` with
  a narrow layout.
- **Logo lockups** carry live Arial text; convert to outlines before launch.
- **Name clearance** (IP Australia classes 35 and 36, ASIC business name, .com.au domain) — before launch.
- **Photographs:** band slots exist; the home page band is text-only until a photograph is supplied.
