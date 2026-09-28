# Classic Leasing website

The marketing site and calculator for Classic Leasing. Static pages built with Astro; the
calculator and eligibility checker run in the visitor's browser; two small Cloudflare functions
take the enquiry form and count anonymous funnel events.

What is not settled yet is listed in [ASSUMPTIONS.md](ASSUMPTIONS.md).

## Changing the words

All the copy is in `src/content/pages/`, one Markdown file per page, in the same format as the
original copy deck. Edit on github.com (open the file, click the pencil, commit) and the site
rebuilds.

- `## H2 — Something` is a section heading. `## H1`, `## Intro`, `## Body` are labels, not headings.
- `**Button text** → /page` is a button.
- `[SAV-010]` keys trace each sentence to the claims register. Keep them; the build strips them
  from the page. A key that isn't in the register stops the build.
- `<!-- note: -->` blocks are notes for the builder and never appear on the site.
- `{{TODO: ...}}` marks something unsettled. It shows highlighted in a preview and stops a launch build.
- When the claims register changes, re-export its keys to `data/claims-keys.csv`.

## Changing a number

Every number lives in `src/config/`:

| File | What |
|---|---|
| `pricing.ts` | Lease rate, base and variable fee, GST treatment of costs |
| `tax-fy2027.ts` | Tax, Medicare, FBT, residual and GST constants, each with an ATO source and date |
| `calculator.ts` | Calculator defaults, per-km rules, limits, the two what-if sliders and their table |
| `calculator-basis.ts` | Which result leads: take-home per pay, or the whole term |
| `eligibility.ts` | Every eligibility rule and its reason |
| `site.ts` | Business name, ABN, contact details, licensing block |

Change the value, commit, and the site rebuilds. If you change pricing, re-run the eligibility
calibration (see the comment on `runningCostRatio` in `eligibility.ts`).

The lease rate is never shown on the site. A build check stops any page that prints it.

## Figures

The 14 line drawings are generated in OneDrive, `Marketing collateral/13 - Images/Diagrams`, by
`figures.py`. Regenerate there and copy both layouts of any changed figure into `src/figures/`.
Never edit an SVG by hand.

## Building

```
npm ci
npm test               # calculator and eligibility tests
npm run build:preview  # shows TODOs as highlighted markers
npm run build          # launch build — refuses to run while anything is unsettled
```

## Deploying

Deployment is by GitHub Actions (`.github/workflows/deploy.yml`) uploading to Cloudflare Pages
with a single Cloudflare API token. No Cloudflare GitHub app. One-time setup:

1. In Cloudflare, create a Pages project called `classic-leasing` (direct upload) and a D1 database
   called `classic-leasing`. Put the database id in `wrangler.toml` and apply `schema.sql`.
2. Create an API token with permission *Cloudflare Pages: Edit* for this account only.
3. In the GitHub repository: add the secret `CLOUDFLARE_API_TOKEN`, the variables
   `CLOUDFLARE_ACCOUNT_ID` and `DEPLOY_ENABLED=true`.
4. In Cloudflare Zero Trust, put the whole site behind Access (one-time PIN to your email).
   Removing Access is the launch switch.
5. Optional: a Turnstile site and secret for the enquiry form (`TURNSTILE_SECRET` in the Pages
   project settings).

To stop deployments at once, revoke the API token in Cloudflare.

## Reading enquiries and funnel counts

Enquiries and daily counts are in D1 (Cloudflare dashboard → D1 → classic-leasing → Console):

```
SELECT * FROM enquiries ORDER BY id DESC;
SELECT event, SUM(n) FROM funnel GROUP BY event;
```
