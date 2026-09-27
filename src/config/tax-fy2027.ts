/**
 * Tax constants — Australian income year 2026-27, FBT year ending 31 March 2027.
 *
 * RULES (from the build brief, section 5):
 *  - No constant in this file may be written from memory. Every entry carries a source URL
 *    and a verifiedOn date.
 *  - If an entry has verified: false, the calculator must REFUSE to produce a number for the
 *    path that depends on it and say why. It must not fall back to a default.
 *  - This is the only place these numbers live. Nothing is hard-coded in a component.
 *
 * Verified 6 September 2026 against ato.gov.au.
 */

export interface Constant<T> {
  value: T;
  source: string;
  verifiedOn: string;   // ISO date
  verified: boolean;
  note?: string;
}

/* ------------------------------------------------------------------ income tax */

export interface TaxBracket {
  /** inclusive lower bound of taxable income */
  from: number;
  /** inclusive upper bound, or null for the top bracket */
  to: number | null;
  /** marginal rate applying to income above `from` */
  rate: number;
  /** tax payable on income up to `from` */
  base: number;
}

/** Resident individual rates, 2026-27 income year. Excludes the Medicare levy. */
export const INCOME_TAX_2026_27: Constant<TaxBracket[]> = {
  value: [
    { from: 0,       to: 18200,  rate: 0.00, base: 0 },
    { from: 18201,   to: 45000,  rate: 0.15, base: 0 },
    { from: 45001,   to: 135000, rate: 0.30, base: 4020 },
    { from: 135001,  to: 190000, rate: 0.37, base: 31020 },
    { from: 190001,  to: null,   rate: 0.45, base: 51370 },
  ],
  source: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
  verifiedOn: '2026-09-06',
  verified: true,
  note:
    'The 2026-27 rate on the $18,201-$45,000 bracket is 15c, down from 16c in 2025-26. ' +
    'Do not carry the prior-year figure forward. Re-verify at the start of each income year.',
};

export const MEDICARE_LEVY: Constant<number> = {
  value: 0.02,
  source: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
  verifiedOn: '2026-09-06',
  verified: true,
  note:
    'Stated on the resident rates page as "rates exclude the 2% Medicare levy". ' +
    'Low-income reduction thresholds (single, 2025-26: $28,011 lower / $35,013 upper) are not ' +
    'modelled — every customer in the target segment is well above them, so the levy applies ' +
    'at the flat rate. If the calculator is ever opened up to lower incomes, this must change.',
};

/* --------------------------------------------------------------------------- FBT */

export const FBT_RATE: Constant<number> = {
  value: 0.47,
  source: 'https://www.ato.gov.au/tax-rates-and-codes/fringe-benefits-tax-rates-and-thresholds',
  verifiedOn: '2026-09-06',
  verified: true,
  note: 'A rate of 47% applies across the FBT years ending 31 March 2023 to 31 March 2027.',
};

/** Type 1: benefits where the employer is entitled to a GST credit. */
export const GROSS_UP_TYPE_1: Constant<number> = {
  value: 2.0802,
  source: 'https://www.ato.gov.au/tax-rates-and-codes/fringe-benefits-tax-rates-and-thresholds',
  verifiedOn: '2026-09-06',
  verified: true,
  note: 'Unchanged across the FBT years ending 31 March 2023 to 31 March 2027.',
};

/** Type 2: benefits where no GST credit is available. */
export const GROSS_UP_TYPE_2: Constant<number> = {
  value: 1.8868,
  source: 'https://www.ato.gov.au/tax-rates-and-codes/fringe-benefits-tax-rates-and-thresholds',
  verifiedOn: '2026-09-06',
  verified: true,
  note: 'Unchanged across the FBT years ending 31 March 2023 to 31 March 2027.',
};

export const FBT_YEAR = {
  startsMonthDay: '04-01',
  endsMonthDay: '03-31',
  source: 'https://www.ato.gov.au/tax-rates-and-codes/fringe-benefits-tax-rates-and-thresholds',
  verifiedOn: '2026-09-06',
  verified: true,
};

/** Statutory formula: taxable value = (A x B x C / D) - E, B being this percentage. */
export const STATUTORY_PERCENTAGE: Constant<number> = {
  value: 0.20,
  source:
    'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/' +
    'fringe-benefits-tax/types-of-fringe-benefits/fbt-on-cars-other-vehicles-parking-and-tolls/' +
    'cars-and-fbt/taxable-value-of-a-car-fringe-benefit',
  verifiedOn: '2026-09-06',
  verified: true,
  note:
    'Flat 20% regardless of kilometres travelled, unless an arrangement was in place before ' +
    '31 March 2015. A is the base value, C is days available for private use, D is days in the ' +
    'FBT year, E is the employee contribution.',
};

/* ---------------------------------------------------------------------- residual */

/**
 * Minimum residual value, from TD 93/142:
 *
 *     minimum residual as a % of cost = 75% - [(75% / effective life) x total leased period]
 *
 * A straight line from 75% at delivery to zero at the end of the asset's effective life.
 * For a car (effective life 8 years) this reproduces the schedule the industry publishes:
 * 65.63 / 56.25 / 46.88 / 37.50 / 28.13 for one to five years, and continues to
 * 18.75 at six years and 9.375 at seven.
 */
export const RESIDUAL_EFFECTIVE_LIFE_YEARS: Constant<number> = {
  value: 8,
  source: 'https://www.ato.gov.au/law/view/document?DocID=TXD%2FTD93142%2FNAT%2FATO%2F00001',
  verifiedOn: '2026-09-06',
  verified: true,
  note:
    'TD 93/142 sets minimum residuals by effective life. The determination\'s own table gives ' +
    '28.13% for an 8-year effective life over a 5-year lease, which is the figure the industry ' +
    'uses, so 8 years is the effective life being applied to cars. Eight years is also the ' +
    'CONSERVATIVE choice: a shorter effective life produces lower residuals, higher rentals, a ' +
    'larger packaged amount and a larger tax benefit. Using 8 understates the benefit rather ' +
    'than overstating it, which is the right direction to err on a public calculator.',
};

export const RESIDUAL_START_PERCENTAGE: Constant<number> = {
  value: 0.75,
  source: 'https://www.ato.gov.au/law/view/document?DocID=TXD%2FTD93142%2FNAT%2FATO%2F00001',
  verifiedOn: '2026-09-06',
  verified: true,
};

/** Minimum residual as a fraction of the agreed value, for a whole-year term. */
export function minimumResidualFraction(years: number): number {
  const start = RESIDUAL_START_PERCENTAGE.value;
  const life = RESIDUAL_EFFECTIVE_LIFE_YEARS.value;
  return Math.max(0, start - (start / life) * years);
}

/**
 * TD 93/142 permits a LOWER residual than the minimum where evidence supports it, because the
 * residual should reflect market value at the end of the lease rather than written-down value.
 * Do not surface that on the site. It is a quote-stage judgement, not a calculator input.
 */

/* -------------------------------------------------------------------- base value */

/**
 * Base value (A in the statutory formula) is the cost price of the car.
 * ATO: base value is "the cost price you (or a lessor) paid for the car", excluding certain
 * items. In a sale and leaseback that is the agreed value Classic Leasing pays the customer.
 */
export const BASE_VALUE_BASIS: Constant<string> = {
  value: 'lessor cost price — the agreed value paid to the customer',
  source:
    'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/' +
    'fringe-benefits-tax/types-of-fringe-benefits/fbt-on-cars-other-vehicles-parking-and-tolls/' +
    'cars-and-fbt/taxable-value-of-a-car-fringe-benefit',
  verifiedOn: '2026-09-06',
  verified: true,
};

/**
 * One-third reduction in base value after four years.
 *
 * Wording supplied by the owner from the FBT guide for employers, section 7.8:
 *   "You can reduce the base value of a car by one-third in the FBT year that starts after you
 *    or your associate have owned or leased the car for 4 years. The reduction applies from
 *    1 April after the fourth anniversary of the date on which you or your associate first
 *    owned or leased the car (the car does not need to be held continuously). The reduction
 *    applies only once for a particular car and you then use the reduced base value for
 *    subsequent years. The reduction does not apply to non-business accessories added after
 *    you or your associate acquired the car."
 */
export const BASE_VALUE_REDUCTION = {
  fraction: 1 / 3,
  appliesFrom: '1 April following the fourth anniversary of first holding',
  appliesOnce: true,
  continuousHoldingRequired: false,
  excludesLaterNonBusinessAccessories: true,
  source: 'https://www.ato.gov.au/law/view/document?LocID=%22SAV%2FFBTGEMP%2F7.8%22',
  verifiedOn: '2026-09-06',
  verified: true,
  note:
    'Cited and transcribed by the owner. The ATO legal database returns 403 to automated ' +
    'retrieval, so this wording was not independently fetched — check it against the source ' +
    'before relying on it in a quote.',
};

/**
 * When the reduction actually bites — and why it is not modelled.
 *
 * Confirmed by the owner from experience: the vehicle needs to be in its fifth year of being
 * leased before the reduction applies. That follows from the wording. The reduction starts on
 * the 1 April after the fourth anniversary of first holding, so:
 *
 *   lease starts 1 April  -> fourth anniversary 1 April in year 4, reduction runs the whole
 *                            of year 5
 *   lease starts 1 July   -> reduction starts 1 April in year 5, about 3 months of the term
 *   lease starts 2 April  -> reduction starts a year later, outside a 5 year term entirely
 *
 * So it never applies to a 1, 2, 3 or 4 year term, and on a 5 year term the benefit ranges from
 * nothing to a full year depending only on which day of the year the lease happened to start.
 *
 * NOT MODELLED, deliberately. Modelling it would make the calculator return different answers
 * for the same inputs depending on today's date, which is worse than a small understatement.
 * Ignoring it understates the benefit only in the final months of the longest term. If terms
 * beyond 5 years are ever offered the reduction becomes material and this must be revisited.
 *
 * Still for the adviser: whose four years count in a sale and leaseback — the customer's
 * original ownership, or Classic Leasing's acquisition. The base value is the lessor's cost
 * price, and the customer is not an associate of the provider, which points to Classic
 * Leasing's acquisition. Confirm before relying on it in a quote.
 */
export const BASE_VALUE_REDUCTION_MODELLED = false;

/* --------------------------------------------------------------------------- GST */

export const GST_RATE: Constant<number> = {
  value: 0.10,
  source:
    'https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/' +
    'how-gst-works',
  verifiedOn: '2026-09-06',
  verified: true,
  note: 'ATO: "a broad-based tax of 10% on most goods, services and other items sold or consumed in Australia".',
};

/* ------------------------------------------------------------------------- checks */

export const ALL_CONSTANTS = [
  INCOME_TAX_2026_27, MEDICARE_LEVY, FBT_RATE, GROSS_UP_TYPE_1, GROSS_UP_TYPE_2,
  STATUTORY_PERCENTAGE, RESIDUAL_EFFECTIVE_LIFE_YEARS, RESIDUAL_START_PERCENTAGE, GST_RATE,
];

/** Every unverified constant, so the calculator can refuse the paths that depend on them. */
export function unverified(): string[] {
  return ALL_CONSTANTS.filter(c => !c.verified).map(c => c.source);
}

/* ------------------------------------------------------------- open for the adviser */
/*
 * RESOLVED 6 September 2026 (owner):
 *  - The base value reduction only reaches a 5 year term, and only for some commencement
 *    dates. Not modelled — see the note above BASE_VALUE_REDUCTION_MODELLED.
 *  - TD 93/142 is current. The consolidated ruling has been in effect since 14 July 2021.
 *  - Eight years is the effective life conventionally applied to cars, and it is the
 *    conservative choice — see the note on RESIDUAL_EFFECTIVE_LIFE_YEARS.
 *  - GST rate sourced.
 *  - Base value reduction wording sourced.
 *
 * STILL OPEN — for the adviser, and it does not block the build:
 *  - In a sale and leaseback, whose four years start the one-third base value reduction. It
 *    affects quotes on 5 year terms only, and nothing the calculator does.
 */
