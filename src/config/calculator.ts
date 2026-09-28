/**
 * Calculator inputs: defaults, limits, the per-km rules and the what-if sliders.
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
  // Owner, 28 Sep 2026: defaults should total about $8,000 a year. 12,000 km gives $8,100.
  kilometres:   { default: 12000,  min: 0,      max: 80000,  step: 1000, provisional: false },
  fuel:         { default: 2400,   min: 0,      max: 15000,  step: 50,   provisional: false }, // follows kilometres, see PER_KM
  insurance:    { default: 1100,   min: 0,      max: 10000,  step: 50,   provisional: false },
  registration: { default: 900,    min: 0,      max: 5000,   step: 50,   provisional: false }, // insurance + registration = $2,000
  servicing:    { default: 1200,   min: 0,      max: 10000,  step: 50,   provisional: false }, // follows kilometres, see PER_KM
  tyres:        { default: 500,    min: 0,      max: 5000,   step: 50,   provisional: false },
  maintenance:  { default: 2000,   min: 0,      max: 30000,  step: 50,   provisional: false },
  shock:        { default: 4000,   min: 0,      max: 30000,  step: 250,  provisional: false }, // brief: "defaulting to around $4,000"
};

/** Owner, 28 Sep 2026. Fuel and routine servicing follow the kilometres input until the
 * customer types over them. */
export const PER_KM = {
  fuel: 0.20,                 // dollars per km
  servicingBase: 1000,        // a year, up to servicingBaseKm
  servicingBaseKm: 10000,
  servicingAbove: 0.10,       // dollars per km above servicingBaseKm
};

export const fuelFor = (km: number) => Math.round(PER_KM.fuel * km);
export const servicingFor = (km: number) =>
  Math.round(PER_KM.servicingBase + PER_KM.servicingAbove * Math.max(0, km - PER_KM.servicingBaseKm));

/** The two what-if sliders. Between them they reproduce any cell of the table (brief s5). */
export const SENSITIVITY = {
  min: 4000,
  max: 12000,
  step: 250,
  default: 8000,
  /** Rows of the table. */
  tableRunningCosts: [4000, 6000, 8000, 10000, 12000],
  /** Columns: salaries chosen to sit in the 30%, 37% and 45% brackets. */
  tableSalaries: [120000, 160000, 220000],
  salary: { min: 60000, max: 300000, step: 5000 },
};
