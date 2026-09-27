import { describe, it, expect } from 'vitest';
import {
  incomeTax, monthlyRental, variableFee, calculate, netPerYearAt, breakEvenRunning, marginalRate,
  type Inputs,
} from '../src/lib/calculator/engine';
import { minimumResidualFraction } from '../src/config/tax-fy2027';

const running = { fuel: 2600, insurance: 1400, registration: 900, servicing: 1200, tyres: 600, maintenance: 3000 };
const base: Inputs = { salary: 160000, agreedValue: 15000, termYears: 3, running };

describe('tax', () => {
  it('matches the 2026-27 brackets at the thresholds', () => {
    expect(incomeTax(18200)).toBeCloseTo(18200 * 0.02, 6);
    expect(incomeTax(45000)).toBeCloseTo(4020 + 900, 6);
    expect(incomeTax(135000)).toBeCloseTo(31020 + 2700, 6);
    expect(incomeTax(190000)).toBeCloseTo(51370 + 3800, 6);
    expect(incomeTax(200000) - incomeTax(190000)).toBeCloseTo(10000 * 0.47, 6);
  });
  it('reports marginal rates including Medicare', () => {
    expect(marginalRate(160000)).toBeCloseTo(0.39, 6);
    expect(marginalRate(220000)).toBeCloseTo(0.47, 6);
  });
});

describe('residual and rental', () => {
  it('reproduces the published minimum residual schedule', () => {
    const want = [0.65625, 0.5625, 0.46875, 0.375, 0.28125];
    want.forEach((w, i) => expect(minimumResidualFraction(i + 1)).toBeCloseTo(w, 6));
  });
  it('amortises the agreed value exactly to the residual', () => {
    const v = 15000, rv = v * minimumResidualFraction(3), pmt = monthlyRental(v, rv, 3, 0.12);
    let bal = v;
    for (let m = 0; m < 36; m++) bal = bal * 1.01 - pmt;
    expect(bal).toBeCloseTo(rv, 4);
  });
});

describe('fee', () => {
  it('has a kink at the $6,000 threshold on gross claims', () => {
    expect(variableFee(5999)).toBe(0);
    expect(variableFee(6000)).toBe(0);
    expect(variableFee(7000)).toBeCloseTo(100, 6);
  });
  it('makes the benefit slope flatter above the threshold, not smoothed', () => {
    const d = (a: number, b: number) => (netPerYearAt(base, b)! - netPerYearAt(base, a)!) / (b - a);
    const below = d(4000, 5500), above = d(7000, 8500);
    expect(below).toBeGreaterThan(above);
    expect(below - above).toBeGreaterThan(0.02);
  });
});

describe('the comparison', () => {
  it('shows every mandatory line and a residual', () => {
    const r = calculate(base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.residual).toBeGreaterThan(0);
    expect(r.leaseChargeTerm).toBeGreaterThan(0);
    expect(r.years[0].feeGross).toBeGreaterThanOrEqual(1200);
    expect(r.years[0].employeeContribution).toBeCloseTo(3000, 6);
  });

  it('produces a negative result when the car is worth a lot and costs little to run', () => {
    const r = calculate({ ...base, agreedValue: 45000, running: { fuel: 1500, insurance: 900, registration: 800, servicing: 500, tyres: 200, maintenance: 0 } });
    expect(r.ok && r.netOverTerm < 0).toBe(true);
  });

  it('is ahead when agreed value is at or below a year of running costs (brief s5 rule of thumb)', () => {
    const inp = { ...base, salary: 250000, termYears: 5, agreedValue: 8000 };
    expect(netPerYearAt(inp, 8000)!).toBeGreaterThan(0);
  });

  it('a $15,000 car against $8,000 of running costs is close to break-even per pay (brief s5)', () => {
    const inp = { ...base, salary: 250000, termYears: 5, agreedValue: 15000 };
    expect(Math.abs(netPerYearAt(inp, 8000, 250000, 'cashFlow')!)).toBeLessThan(500);
  });

  it('the whole-term view adds the sale price received and subtracts the residual', () => {
    const r = calculate({ ...base, termYears: 5 });
    expect(r.ok && Math.abs(r.netOverTerm - (r.cashFlowOverTerm + r.agreedValue - r.residual)) < 1e-6).toBe(true);
  });

  it('a one-off bill costs less packaged than kept', () => {
    const r = calculate({ ...base, shock: 4000 });
    expect(r.ok && r.shockEffect!.packaged < r.shockEffect!.keep).toBe(true);
  });

  it('never lets the pre-tax deduction go negative', () => {
    const r = calculate({ ...base, agreedValue: 80000, running: { fuel: 0, insurance: 0, registration: 0, servicing: 0, tyres: 0, maintenance: 0 } });
    expect(r.ok && r.years.every(y => y.preTaxDeduction >= 0)).toBe(true);
  });

  it('refuses a term outside one to five years', () => {
    expect(calculate({ ...base, termYears: 7 }).ok).toBe(false);
  });

  it('finds a break-even running cost', () => {
    const be = breakEvenRunning(base);
    expect(be).not.toBeNull();
    expect(netPerYearAt(base, be! + 200, base.salary, 'cashFlow')!).toBeGreaterThan(0);
    expect(netPerYearAt(base, be! - 200, base.salary, 'cashFlow')!).toBeLessThan(0);
  });
});
