/** Eligibility checker logic. Pure; every rule reads from src/config/eligibility.ts. */
import { RULES, BODY_OPTIONS, type Outcome } from '../config/eligibility';

export interface Answers {
  body: string;            // BODY_OPTIONS id
  year: number;            // year of manufacture
  odometer: number;
  value: number;           // private-sale estimate
  runningCost: number;     // a year
  termYears: number;
  condition: string;       // CONDITION_OPTIONS id
}

export interface Check { outcome: Outcome; reasons: string[] }

const fill = (s: string, v: number) =>
  s.replace('${value}', '$' + v.toLocaleString('en-AU')).replace('{value}', v.toLocaleString('en-AU'));

export function check(a: Answers, thisYear = new Date().getFullYear()): Check {
  const outside: string[] = [], talk: string[] = [];
  const fail = (onFail: Outcome, reason: string) => (onFail === 'outside' ? outside : talk).push(reason);

  const body = BODY_OPTIONS.find(b => b.id === a.body);
  if (body && !body.fbtCar) fail(RULES.fbtCar.onFail, RULES.fbtCar.reason);

  const ageAtEnd = thisYear - a.year + a.termYears;
  if (ageAtEnd > RULES.maxAgeAtLeaseEnd.value) fail(RULES.maxAgeAtLeaseEnd.onFail, fill(RULES.maxAgeAtLeaseEnd.reason, RULES.maxAgeAtLeaseEnd.value));
  if (a.odometer > RULES.maxOdometer.value) fail(RULES.maxOdometer.onFail, fill(RULES.maxOdometer.reason, RULES.maxOdometer.value));
  if (a.value < RULES.minAgreedValue.value) fail(RULES.minAgreedValue.onFail, fill(RULES.minAgreedValue.reason, RULES.minAgreedValue.value));
  if (a.value > RULES.maxAgreedValue.value) fail(RULES.maxAgreedValue.onFail, fill(RULES.maxAgreedValue.reason, RULES.maxAgreedValue.value));
  if (RULES.conditionNeedsConversation.value.includes(a.condition)) fail('conversation', RULES.conditionNeedsConversation.reason);

  const ratio = a.value > 0 ? a.runningCost / a.value : Infinity;
  const band = RULES.runningCostRatio.value;
  if (ratio < band.outside) fail('outside', RULES.runningCostRatio.reason);
  else if (ratio < band.eligible) fail('conversation', RULES.runningCostRatio.reason);

  if (outside.length) return { outcome: 'outside', reasons: outside };
  if (talk.length) return { outcome: 'conversation', reasons: talk };
  return { outcome: 'eligible', reasons: [] };
}
