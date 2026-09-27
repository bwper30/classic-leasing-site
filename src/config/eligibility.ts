/**
 * Eligibility rules — the ONLY place they live (brief s3 and definition of done).
 *
 * The values below are the PROPOSED starting points from 28 Sep 2026, not yet approved by the
 * owner. Every rule is marked provisional; a production build fails while any are.
 *
 * Only two rules can return "outside our criteria": the FBT car definition, and running costs
 * far below what the agreed value needs. Everything else routes to "needs a conversation".
 */

export type Outcome = 'eligible' | 'conversation' | 'outside';

export interface Rule<T> {
  value: T;
  /** Outcome when the rule is failed. */
  onFail: Exclude<Outcome, 'eligible'>;
  /** Shown to the customer when this rule is the reason. */
  reason: string;
  provisional: boolean;
}

export const RULES = {
  /** FBT "car": designed to carry a load under one tonne and fewer than nine passengers. */
  fbtCar: {
    value: true,
    onFail: 'outside',
    reason:
      'It isn’t a car for fringe benefits tax purposes: a vehicle carrying a load of one tonne or more, or nine or more passengers, is taxed differently.',
    provisional: true,
  } as Rule<boolean>,

  maxAgeAtLeaseEnd: {
    value: 20,
    onFail: 'conversation',
    reason: 'The car would be more than {value} years old at the end of the lease.',
    provisional: true,
  } as Rule<number>,

  maxOdometer: {
    value: 250000,
    onFail: 'conversation',
    reason: 'The odometer reading is above {value} km.',
    provisional: true,
  } as Rule<number>,

  minAgreedValue: {
    value: 5000,
    onFail: 'conversation',
    reason: 'The car’s value is below ${value}.',
    provisional: true,
  } as Rule<number>,

  maxAgreedValue: {
    value: 40000,
    onFail: 'conversation',
    reason: 'The car’s value is above ${value}.',
    provisional: true,
  } as Rule<number>,

  /** Condition answers that route to a conversation. */
  conditionNeedsConversation: {
    value: ['needs-work'],
    onFail: 'conversation',
    reason: 'The car needs work before we could agree a value.',
    provisional: true,
  } as Rule<string[]>,

  /**
   * Running costs as a share of agreed value. At or above `eligible` the car looks eligible;
   * between `outside` and `eligible` it needs a conversation; below `outside` it is outside our
   * criteria.
   *
   * Calibrated 28 Sep 2026 from the calculator engine on the per-pay (cash-flow) basis, 1-5 year
   * terms, agreed values $8,000-$25,000. Break-even ratios: 0.80-1.00 at the 30% bracket,
   * 0.64-0.78 at 37%, 0.51-0.63 at 45%. So 0.8 is positive at 37% and above for every term,
   * and below 0.5 the result is negative at every bracket. Recalibrate if pricing changes.
   */
  runningCostRatio: {
    value: { eligible: 0.8, outside: 0.5 },
    onFail: 'conversation',
    reason: 'Your running costs are low compared with what the car is worth, which is where this arrangement works least well.',
    provisional: true,
  } as Rule<{ eligible: number; outside: number }>,
};

export const CONDITION_OPTIONS = [
  { id: 'good', label: 'Good, with service history' },
  { id: 'patchy', label: 'Sound, history is patchy' },
  { id: 'needs-work', label: 'Needs work' },
];

/** Body type answers. The last two are not "cars" under FBT law. */
export const BODY_OPTIONS = [
  { id: 'car', label: 'Car, SUV or 4WD', fbtCar: true },
  { id: 'ute-light', label: 'Ute or van, payload under one tonne', fbtCar: true },
  { id: 'ute-heavy', label: 'Ute or van, payload of one tonne or more', fbtCar: false },
  { id: 'nine-seats', label: 'Nine or more seats', fbtCar: false },
];
