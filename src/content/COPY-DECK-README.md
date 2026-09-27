# Website copy deck

One file per page. Written 5 September 2026 against **CL-02a** (writing style guide) and
**CL-02** (claims and disclaimers register), both in `01 - Foundation`.

## Conventions

- `{{TODO: ...}}` marks a value nobody has settled yet. Every one of these goes in a config
  file, not in a template. Do not replace one with a plausible guess.
- `[C-nn]` after a line traces it to a row in the claims register. If a sentence is edited so
  it no longer matches its row, the register is updated first. A reference to a *prohibited*
  row (SAV-060, for example) means the sentence was written to comply with that prohibition.
- **Never insert a row into the claims register — append it.** Inserting renumbers everything
  below and silently breaks every `[C-nn]` in this folder. It has already happened twice. The
  rule is now recorded on the register's How to use tab.
- `<!-- note: -->` blocks are for the builder and the owner. They are not copy.
- Headings are marked H1/H2/H3. Everything else is body copy or a button label.

## Decisions this copy already reflects

- **The lead is the maintenance fund.** An older car you intend to keep costs real money and
  the bills arrive unevenly. Setting money aside for them is the first argument. That a portion
  of the deduction is pre-tax is a supporting reason, and lower dollar depreciation than a new
  car is another. Repair-and-keep sits underneath as the reason the business exists.
- **Do not lean on "before tax".** The split between pre-tax and post-tax varies case by case
  with the FBT base value, and that is too complex for a web page. The site says "a portion"
  and the quote carries the detail [SAV-060].
- **GST wording follows the corpus.** "Running costs are generally net of GST, because the
  input tax credits are claimable by your employer" [SAV-020]. Keep "generally" — even the
  incumbents hedge this one.
- **The site is silent on registration and plates** [OWN-030]. Owner's decision, 28 Sep 2026: registration staying in the customer's name is handled on the phone and in the quote, not on the website.
- **No copy may depend on who funds the vehicle** [PRI-090]. Classic Leasing's own capital is the
  launch position; a financier is possible and the decision is open. What is constant either way:
  Classic Leasing is the lessor, the customer doesn't own the car during the term, the customer
  isn't borrowing, and we take no commission on the funding. Never write "there's no financier"
  or "we buy the car with our own capital" — the durable claim is that we decline the commission
  [PRI-030], which is a choice rather than a fact about the balance sheet.
- **Two claims quietly depend on the funding model and are not made:** that we set our own
  eligibility policy because we carry the asset (a financier brings a credit policy), and
  anything about the Division 66 GST credit, which follows whoever buys the car from the
  private seller.
- **Nothing promises the money will be there.** The fund builds over time. The wording is
  "once the balance has built up it should cover most of the work your car needs", and every
  hedge in that sentence is load-bearing [SVC-040].
- **The lease is between us and the customer.** A novation agreement passes responsibility for
  the rentals to the employer. Do not describe it as leasing the car back "through payroll" —
  that conflates two different documents [OWN-010, EMP-010].
- **No rate on the site.** The lease rate moves with funding costs and is quoted, not
  published [PRI-050]. Pricing transparency is carried by the practice, not a number [PRI-060].
- **No GST claim on the car.** The seller is a private individual and no credit arises. GST is
  claimed on running costs only [SAV-020, GST-020].
- **No loan language anywhere.** Lease, rental, agreed value, residual, return. Never
  repayment, interest, finance, borrowing [OWN-040].
- **No regulatory status asserted or denied** [REG-010, REG-020]. The licensing block is a config
  placeholder.
- **The About page is about the business, not the founder** (owner's decision, 5 Sep 2026).

## Revision 27 Sep 2026 — AI tells removed

Every page except the legal brief was edited to remove the constructions that make copy read as
machine-written. The previous version is in `_superseded v1 (6 Sep 2026)`. Hold to these when editing:

- No "X, not Y" or "X rather than Y" as a habit. Three remain in the whole deck; state things positively.
- No neat closing lines ("Good things are worth keeping", "That's the gap this business exists to fill").
  If the sentence before carries the point, stop there.
- Don't announce honesty ("the honest caveat", "a straight answer", "we won't reframe it"). Be candid instead.
- No straw man of the industry before saying what we do. State what we do.
- No "exactly", "actually" or "the real" as intensifiers.
- Don't reuse the same sentence on several pages unless it is a claims register wording the page cites.
- Don't count before listing ("Three things…") more than once a page, and vary headings — not every H2
  starts with "What".
- Figure text must still match the copy: fig. 01's foot note was changed with this revision.

## Word budgets

Home 300 · How it works 400 · Why we're different 400 · Eligibility 500 · Calculator 400 ·
For employers 600 · What it costs 350 · FAQ 800 · About 350 · Contact 150.

If a page comes in materially over budget, the answer is usually that it is doing another
page's job.

## What still blocks publication

1. Eligibility numbers — age at lease end, kilometres, value range [ELG-010].
2. Tax constants, each with an ATO source and a verified date [TAX-020].
3. The licensing position and any external dispute resolution membership [REG-010, REG-020].
4. ~~Registration in WA~~ — no longer blocks the website; it is not on the site (decision 28 Sep 2026).
5. Anything on the About page that needs a real trading entity and ABN.
