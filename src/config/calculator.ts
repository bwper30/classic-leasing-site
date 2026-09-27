/**
 * Calculator inputs: defaults, limits and pay cycles.
 *
 * Defaults marked provisional: true are placeholders until the owner supplies representative
 * figures (build plan, facts 3 and 4). A production build fails while any remain provisional.
 * They should be representative, not flattering (brief s5).
 */

export interface InputSpec {
  default: number;
  min: number;
  max: number;
  step: number;
  provisional: boolean;
}

export const INPUTS: Record<string, InputSpec> = {
  salary:       { default: 160000, min: 60000,  max: 600000, step: 1000, provisional: true },
  agreedValue:  { default: 15000,  min: 3000,   max: 80000,  step: 500,  provisional: false }, // brief: "around $15,000 — the expected average"
  termYears:    { default: 3,      min: 1,      max: 5,      step: 1,    provisional: true },
  kilometres:   { default: 15000,  min: 0,      max: 80000,  step: 1000, provisional: true },
  fuel:         { default: 2600,   min: 0,      max: 15000,  step: 50,   provisional: true },
  insurance:    { default: 1400,   min: 0,      max: 10000,  step: 50,   provisional: true },
  registration: { default: 900,    min: 0,      max: 5000,   step: 50,   provisional: true },
  servicing:    { default: 1200,   min: 0,      max: 10000,  step: 50,   provisional: true },
  tyres:        { default: 600,    min: 0,      max: 5000,   step: 50,   provisional: true },
  maintenance:  { default: 3000,   min: 0,      max: 30000,  step: 50,   provisional: true },
  shock:        { default: 4000,   min: 0,      max: 30000,  step: 250,  provisional: false }, // brief: "defaulting to around $4,000"
};

/** Sensitivity slider range for total annual running costs (brief s5). */
export const SENSITIVITY = {
  min: 4000,
  max: 20000,
  step: 250,
  /** Rows of the small sensitivity table. */
  tableRunningCosts: [4000, 6000, 8000, 12000, 16000, 20000],
  /** Columns: salaries chosen to sit in the 30%, 37% and 45% brackets. */
  tableSalaries: [120000, 160000, 220000],
};

export const PAY_CYCLES = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
} as const;

export type PayCycle = keyof typeof PAY_CYCLES;

export const DEFAULT_PAY_CYCLE: { value: PayCycle; provisional: boolean } = {
  value: 'fortnightly',
  provisional: true,
};

/** Kilometres are collected but do not change the result: FBT uses the statutory formula at a
 * flat 20%, and fuel is entered directly. Kept for the quote; see ASSUMPTIONS.md. */
export const KILOMETRES_AFFECT_RESULT = false;
