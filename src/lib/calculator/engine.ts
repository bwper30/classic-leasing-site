/**
 * Classic Leasing calculator engine — pure functions, no UI, no network.
 *
 * The comparison (brief s5):
 *   Keep it as you are  — the customer owns the car and pays every running cost from after-tax
 *                         pay, GST included.
 *   Packaged with us    — we buy the car at the agreed value and lease it back. The employer
 *                         deducts a pre-tax amount and an Employee Contribution Method (ECM)
 *                         post-tax contribution, claims the GST credits, and pays the rental,
 *                         the running costs and our fee. At the end the customer pays the
 *                         residual and owns the car again.
 *
 * Both paths end with the customer owning the same car, so the net result over the term is:
 *
 *     sum over years of (take-home packaged - take-home keeping)  +  agreed value received
 *     -  residual paid at the end (plus GST: the sale back is a taxable supply)
 *
 * Undiscounted. Every constant comes from src/config. If any tax constant is unverified, the
 * engine refuses to produce a number (brief s5, "Tax constants").
 */

import {
  INCOME_TAX_2026_27, MEDICARE_LEVY, STATUTORY_PERCENTAGE, GST_RATE,
  minimumResidualFraction, unverified,
} from '../../config/tax-fy2027';
import {
  LEASE_RATE, BASE_FEE_PER_YEAR, VARIABLE_FEE_RATE, VARIABLE_FEE_THRESHOLD,
  FEE_INCLUDES_GST, GST_ON_RUNNING_COSTS, RESIDUAL_PAYABLE_BASIS,
} from '../../config/pricing';

export const RUNNING_KEYS = ['fuel', 'insurance', 'registration', 'servicing', 'tyres', 'maintenance'] as const;
export type RunningKey = typeof RUNNING_KEYS[number];
export type RunningCosts = Record<RunningKey, number>;

export interface Inputs {
  salary: number;
  agreedValue: number;
  termYears: number;          // whole years, 1-5
  running: RunningCosts;      // annual, GST-inclusive, as the customer pays them
  shock?: number;             // one-off unexpected bill, GST-inclusive, in the middle year
}

export interface YearResult {
  year: number;
  runningGross: number;
  // keep it as you are
  keepTax: number;
  keepTakeHome: number;       // salary - tax - running costs
  // packaged
  rentalExGst: number;
  gstCreditsRunning: number;
  feeGross: number;
  feeNet: number;
  employeeContribution: number;
  preTaxDeduction: number;
  packagedTax: number;
  packagedTakeHome: number;   // salary - pre-tax - tax - post-tax contribution
  difference: number;         // packaged - keep; positive means better off packaged
  // the savings view (calculator table 1). All per year, all reconcile exactly:
  //   usedPackaged = running - gstSavingNet + leaseCharges - taxSaving
  gstSavingNet: number;       // GST credits on running costs, less the GST remitted on the employee contribution
  leaseCharges: number;       // lease rental plus administration fee, both ex GST (split not disclosed)
  taxSaving: number;          // income tax and Medicare levy, kept less packaged
  usedKeep: number;           // disposable (after-tax) income spent on the car, kept as you are
  usedPackaged: number;       // disposable income given up for the car, packaged
}

export interface Result {
  ok: true;
  years: YearResult[];
  agreedValue: number;
  residual: number;           // ex GST: what the rentals amortise down to
  residualPayable: number;    // what the customer pays at the end: the residual plus GST
  residualFraction: number;
  rentalPerYearExGst: number;
  leaseChargeTerm: number;    // total rentals ex GST - (agreed value - residual)
  cashFlowPerYear: number;    // steady-state take-home difference, no shock — the per-pay view
  cashFlowOverTerm: number;   // sum of yearly take-home differences (includes any shock)
  netOverTerm: number;        // cashFlowOverTerm + agreed value received - residual payable
  netPerYear: number;         // netOverTerm / years
  shockYear: number | null;
  shockEffect: { keep: number; packaged: number; differenceWithout: number; differenceWith: number } | null;
}

export interface Refusal { ok: false; reason: string }

/** Income tax plus Medicare levy on a taxable income (resident, 2026-27). */
export function incomeTax(taxable: number): number {
  const x = Math.max(0, taxable);
  let tax = 0;
  for (const b of INCOME_TAX_2026_27.value) {
    if (x >= b.from && (b.to === null || x <= b.to)) {
      tax = b.base + (x - (b.from - 1)) * b.rate;
      if (b.from === 0) tax = 0;
      break;
    }
  }
  return tax + x * MEDICARE_LEVY.value;
}

/** Marginal rate including Medicare, for display and tests. */
export function marginalRate(taxable: number): number {
  const b = INCOME_TAX_2026_27.value.find(b => taxable >= b.from && (b.to === null || taxable <= b.to))!;
  return b.rate + MEDICARE_LEVY.value;
}

/** Level monthly rental in arrears, ex GST, amortising the agreed value down to the residual. */
export function monthlyRental(value: number, residual: number, termYears: number, annualRate = LEASE_RATE.value): number {
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return (value - residual) / n;
  const pv = value - residual / Math.pow(1 + i, n);
  return (pv * i) / (1 - Math.pow(1 + i, -n));
}

export function variableFee(runningGross: number): number {
  return VARIABLE_FEE_RATE.value * Math.max(0, runningGross - VARIABLE_FEE_THRESHOLD.value);
}

export function gstCredit(running: RunningCosts): number {
  const g = GST_RATE.value;
  return RUNNING_KEYS.reduce((s, k) => s + (GST_ON_RUNNING_COSTS.value[k] ? running[k] * g / (1 + g) : 0), 0);
}

function sum(r: RunningCosts): number {
  return RUNNING_KEYS.reduce((s, k) => s + r[k], 0);
}

/** One year of the comparison. `running` already includes any shock for that year. */
export function yearResult(inp: Inputs, running: RunningCosts, rentalExGst: number, year: number): YearResult {
  const g = GST_RATE.value;
  const S = inp.salary;
  const R = sum(running);

  // Keep it as you are: every running cost from after-tax pay, GST included.
  const keepTax = incomeTax(S);
  const keepTakeHome = S - keepTax - R;

  // Packaged. The rental is charged with GST and the employer claims it back, so the package
  // carries it ex GST. Running costs carry GST; the credits on the eligible ones are claimed.
  const gstCreditsRunning = gstCredit(running);
  const feeGross = BASE_FEE_PER_YEAR.value + variableFee(R);
  const feeNet = FEE_INCLUDES_GST.value ? feeGross / (1 + g) : feeGross;
  const packageNet = rentalExGst + (R - gstCreditsRunning) + feeNet;

  // ECM: a post-tax contribution equal to the taxable value reduces it to nil. The employer
  // remits GST on the contribution, so it funds the package net of one-eleventh.
  const employeeContribution = STATUTORY_PERCENTAGE.value * inp.agreedValue;
  const contributionNet = employeeContribution / (1 + g);
  const preTaxDeduction = Math.max(0, packageNet - contributionNet);

  const packagedTax = incomeTax(S - preTaxDeduction);
  const packagedTakeHome = S - preTaxDeduction - packagedTax - employeeContribution;

  const taxSaving = keepTax - packagedTax;
  const gstSavingNet = gstCreditsRunning - (employeeContribution - contributionNet);
  const leaseCharges = rentalExGst + feeNet;
  const usedPackaged = preTaxDeduction + employeeContribution - taxSaving;
  return {
    gstSavingNet, leaseCharges, taxSaving, usedKeep: R, usedPackaged,
    year, runningGross: R, keepTax, keepTakeHome,
    rentalExGst, gstCreditsRunning, feeGross, feeNet,
    employeeContribution, preTaxDeduction, packagedTax, packagedTakeHome,
    difference: packagedTakeHome - keepTakeHome,
  };
}

export function calculate(inp: Inputs): Result | Refusal {
  const missing = unverified();
  if (missing.length) {
    return { ok: false, reason: 'A tax figure this depends on has not been verified, so we won’t show a number.' };
  }
  const n = Math.round(inp.termYears);
  if (n < 1 || n > 5) return { ok: false, reason: 'The lease term must be between one and five years.' };
  if (!(inp.agreedValue > 0)) return { ok: false, reason: 'Enter what the car is worth.' };

  const residualFraction = minimumResidualFraction(n);
  const residual = inp.agreedValue * residualFraction;
  const rentalPerYearExGst = monthlyRental(inp.agreedValue, residual, n) * 12;
  const leaseChargeTerm = rentalPerYearExGst * n - (inp.agreedValue - residual);

  const shockYear = inp.shock && inp.shock > 0 ? Math.ceil(n / 2) : null;
  const years: YearResult[] = [];
  for (let y = 1; y <= n; y++) {
    const running = { ...inp.running };
    if (shockYear === y) running.maintenance += inp.shock!;
    years.push(yearResult(inp, running, rentalPerYearExGst, y));
  }

  const steady = yearResult(inp, inp.running, rentalPerYearExGst, 0);
  let shockEffect: Result['shockEffect'] = null;
  if (shockYear) {
    const withShock = years[shockYear - 1];
    shockEffect = {
      keep: inp.shock!,
      packaged: (steady.packagedTakeHome - withShock.packagedTakeHome),
      differenceWithout: steady.difference,
      differenceWith: withShock.difference,
    };
  }

  const residualPayable = RESIDUAL_PAYABLE_BASIS.value === 'plus-gst' ? residual * (1 + GST_RATE.value) : residual;
  const netOverTerm = years.reduce((s, y) => s + y.difference, 0) + inp.agreedValue - residualPayable;
  return {
    ok: true, years, agreedValue: inp.agreedValue, residual, residualPayable, residualFraction,
    rentalPerYearExGst, leaseChargeTerm,
    cashFlowPerYear: steady.difference,
    cashFlowOverTerm: years.reduce((s, y) => s + y.difference, 0),
    netOverTerm,
    netPerYear: netOverTerm / n,
    shockYear, shockEffect,
  };
}

/** Scale the running-cost mix to a new annual total (for the sensitivity slider). */
export function scaleRunning(r: RunningCosts, total: number): RunningCosts {
  const t = sum(r);
  const out = {} as RunningCosts;
  for (const k of RUNNING_KEYS) out[k] = t > 0 ? r[k] * total / t : total / RUNNING_KEYS.length;
  return out;
}

export type Basis = 'cashFlow' | 'overTerm';

/** Benefit per year at a given total running cost, holding the customer's mix.
 * 'cashFlow' = take-home difference per year (excludes the sale price received and the residual);
 * 'overTerm' = the whole-term result divided by the years (includes both). */
export function netPerYearAt(inp: Inputs, runningTotal: number, salary = inp.salary, basis: Basis = 'overTerm'): number | null {
  const r = calculate({ ...inp, salary, shock: 0, running: scaleRunning(inp.running, runningTotal) });
  if (!r.ok) return null;
  return basis === 'cashFlow' ? r.cashFlowPerYear : r.netPerYear;
}

/** Running cost at which the result crosses zero, for calibrating the eligibility ratio. */
export function breakEvenRunning(inp: Inputs, salary = inp.salary, basis: Basis = 'cashFlow'): number | null {
  let lo = 0, hi = 100000;
  const f = (x: number) => netPerYearAt(inp, x, salary, basis)!;
  if (f(hi) < 0) return null;
  if (f(lo) > 0) return 0;
  for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}
