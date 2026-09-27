#!/usr/bin/env node
/**
 * Pre-build checks from the build brief's definition of done (s9). A production build stops on
 * any failure. A preview build (PREVIEW=1) reports TODOs and provisional values as warnings,
 * because previews are meant to show them.
 *
 *  1. Every claims key used in the copy exists in data/claims-keys.csv (exported from the
 *     claims register — re-export when the register changes).
 *  2. No {{TODO}} token in the copy                                  (production only)
 *  3. No provisional config value (calculator defaults, eligibility)  (production only)
 *  4. Required business details present in src/config/site.ts        (production only)
 *  5. No prohibited product words in customer-facing copy (loan, interest, borrow…), except
 *     sentences that deny or contrast them.
 *  6. No percentage lease rate in the copy.
 *  7. No registration or number-plate claim in the copy.
 *  8. No "save the GST on the car" claim.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PREVIEW = !!process.env.PREVIEW;
const root = new URL('..', import.meta.url).pathname;
const errors = [], warnings = [];
const fail = (m) => errors.push(m);
const warnOrFail = (m) => (PREVIEW ? warnings : errors).push(m);

const keys = new Set(readFileSync(join(root, 'data/claims-keys.csv'), 'utf8').split('\n').slice(1).map(l => l.split(',')[0]).filter(Boolean));
for (let q = 1; q <= 7; q++) keys.add(`Q${q}`);

const dir = join(root, 'src/content/pages');
const pages = readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'legal-brief.md');
for (const f of pages) {
  const src = readFileSync(join(dir, f), 'utf8');
  const copy = src.replace(/<!--[\s\S]*?-->/g, '');
  for (const m of copy.matchAll(/\[((?:[A-Z]{2,4}-\d{3}|Q\d)(?:,\s*(?:[A-Z]{2,4}-\d{3}|Q\d))*)\]/g)) {
    for (const k of m[1].split(/,\s*/)) if (!keys.has(k)) fail(`${f}: claims key ${k} is not in the register`);
  }
  // TODOs the build fills in itself (from config or at run time) are not owner items.
  const FILLED = /rendered from|financial year|^\s*date\s*$|eligibility criteria —|licensing|link to privacy|response time|trading entity, ABN\s*$|term options/;
  for (const m of copy.matchAll(/\{\{TODO:([\s\S]*?)\}\}/g)) {
    if (!FILLED.test(m[1].replace(/\s+/g, ' '))) warnOrFail(`${f}: TODO —${m[1].replace(/\s+/g, ' ')}`);
  }

  // Sentences, with keys stripped, for the wording checks.
  const text = copy.replace(/\[[^\]]*\]/g, '').replace(/\{\{TODO:[\s\S]*?\}\}/g, '').replace(/\s+/g, ' ');
  const sentences = text.split(/(?<=[.?!])\s+/);
  const CONTRAST = /\b(not|isn't|aren't|never|no|won't|don't|rather than|instead of|if you borrowed)\b/i;
  for (const s of sentences) {
    if (/\b(loan|interest rate|borrow\w*|repayments?|APR|comparison rate|principal|finance)\b/i.test(s) && !CONTRAST.test(s)
        && !/\bfinancier\b/i.test(s) && !/\bnon-?finance\b/i.test(s)) {
      // "interest" alone is allowed ("note our interest on the policy"); only credit senses are checked.
      if (!/our interest on the policy/i.test(s)) fail(`${f}: prohibited product word in "${s.trim().slice(0, 120)}"`);
    }
    if (/\b\d+(\.\d+)?\s?%\s*(lease rate|rate)|lease rate of \d/i.test(s)) fail(`${f}: a lease rate percentage appears: "${s.trim()}"`);
    if (/\b(registration stays|number plates?|rego stays|plates stay)\b/i.test(s)) fail(`${f}: registration or plate claim: "${s.trim()}"`);
    if (/save the GST on (the|your) car/i.test(s) && !/\bno\b|\bnot\b|careful/i.test(s)) fail(`${f}: GST-on-the-car claim: "${s.trim()}"`);
  }
}

// Config: provisional values and required business details.
const cfg = (p) => readFileSync(join(root, 'src/config', p), 'utf8');
const provisional = (src, name) => {
  const n = (src.match(/provisional:\s*true/g) || []).length;
  if (n) warnOrFail(`${name}: ${n} provisional value(s) awaiting the owner`);
};
provisional(cfg('calculator.ts'), 'calculator.ts');
provisional(cfg('calculator-basis.ts'), 'calculator-basis.ts');
provisional(cfg('eligibility.ts'), 'eligibility.ts');
for (const k of ['tradingEntity', 'abn', 'domain', 'email', 'responseTime']) {
  if (new RegExp(`\\b${k}:\\s*null`).test(cfg('site.ts'))) warnOrFail(`site.ts: ${k} is not set`);
}
const pricing = cfg('pricing.ts');
const unsettled = (pricing.match(/settled:\s*false/g) || []).length;
if (unsettled) warnOrFail(`pricing.ts: ${unsettled} assumption(s) the owner has not confirmed`);

if (warnings.length) console.log(`Preview build — ${warnings.length} item(s) not settled yet:\n  ` + warnings.join('\n  '));
if (errors.length) { console.error(`\nContent check failed (${errors.length}):\n  ` + errors.join('\n  ')); process.exit(1); }
console.log('Content check passed.');
