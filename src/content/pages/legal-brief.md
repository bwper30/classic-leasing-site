# Legal pages — brief, not copy

<!-- note: these are NOT drafted here. Privacy policy, website terms and the complaints
procedure are lawyer deliverables, and the licensing position is unresolved. This file records
what each page has to do so the brief can go to the lawyer and the builder can lay out empty
routes. -->

## Pages required

1. Privacy policy
2. Website terms of use
3. General advice disclaimer
4. Complaints and dispute resolution

---

## 1. Privacy policy — lawyer

Must cover what's collected through the quote form and the calculator, what it's used for, who
it's disclosed to, how it's stored, how someone accesses or corrects it, and how to complain.
Australian Privacy Principles compliant.

Note for the lawyer: the calculator collects no personal information and the site collects
nothing until the quote form is submitted. Analytics are limited to a privacy-respecting page
count with no cookie banner.

## 2. Website terms — lawyer

Standard terms of use. Must include that the calculator produces indicative figures only and
does not constitute an offer.

## 3. General advice disclaimer — can be drafted from Q2

Use the standard qualifier verbatim:

> This is general information only. It doesn't take account of your objectives, financial
> situation or needs, and it isn't tax, credit or financial advice. Get your own advice before
> you decide.

This appears on every page that explains tax, and in the calculator. [TAX-030, Q2]

## 4. Complaints and dispute resolution — blocked

{{TODO: blocked pending finance-law advice. Do not name an external dispute resolution scheme
that we are not a member of. [REG-020]}}

The page can be built with the internal complaints process only — how to complain, who it goes
to, and the timeframe for a response — with the external scheme block rendered from config once
membership exists.

---

## Site-wide licensing block

{{TODO: licensing or authorisation status. Do not assert or deny one. [REG-010]}}

Build the footer so a licence or authorisation number and an external dispute resolution line
drop in from a single config file without touching templates. Until then the block renders
nothing at all. An empty footer is correct. A footer saying we aren't required to hold a
licence is a regulatory claim and is prohibited.
