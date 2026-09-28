/**
 * Classic Leasing pricing — settled in the build brief, section 5.
 *
 * The lease rate is used to derive the lease rental and the lease charge. It is NEVER rendered
 * on the site (brief, "Changed since v2", item 1). A build check fails if a percentage lease
 * rate appears in the output.
 */

export interface Setting<T> {
  value: T;
  /** Where the value comes from. */
  basis: string;
  /** true = settled by the owner; false = an assumption the owner still has to confirm. */
  settled: boolean;
}

export const LEASE_RATE: Setting<number> = {
  value: 0.12,
  basis: 'Build brief s5, "Settled pricing". Annual rate on the agreed value, rentals monthly in arrears.',
  settled: true,
};

export const BASE_FEE_PER_YEAR: Setting<number> = {
  value: 1200,
  basis: 'Build brief s5, "Settled pricing".',
  settled: true,
};

export const VARIABLE_FEE_RATE: Setting<number> = {
  value: 0.10,
  basis: 'Build brief s5: 10% of expense claims above the threshold, all reimbursements including fuel.',
  settled: true,
};

export const VARIABLE_FEE_THRESHOLD: Setting<number> = {
  value: 6000,
  basis: 'Build brief s5: applied to gross, GST-inclusive claim amounts.',
  settled: true,
};

export const FEE_INCLUDES_GST: Setting<boolean> = {
  value: true,
  basis:
    'ASSUMPTION. The brief says the fee "carries its own GST credit", so the modelled fee is ' +
    'GST-inclusive and one-eleventh is credited back. Confirm whether $1,200 is inclusive or ' +
    'exclusive of GST.',
  settled: false,
};

export const RESIDUAL_PAYABLE_BASIS: Setting<'plus-gst' | 'as-quoted'> = {
  value: 'plus-gst',
  basis:
    'Owner, 28 Sep 2026. The residual is the ATO minimum percentage of the agreed value, ex GST. ' +
    'The sale back to the customer is a taxable supply by Classic Leasing, so GST is added to ' +
    'what the customer pays. The rentals still amortise to the ex-GST residual.',
  settled: true,
};

/**
 * Which running costs carry a GST credit. Fuel, servicing, tyres and maintenance are taxable
 * supplies. Registration is mostly government charges. Insurance premiums include stamp duty,
 * which carries no GST. Both are excluded — the conservative choice, which understates the
 * benefit rather than overstating it.
 */
export const GST_ON_RUNNING_COSTS: Setting<Record<string, boolean>> = {
  value: {
    fuel: true,
    servicing: true,
    tyres: true,
    maintenance: true,
    insurance: false,
    registration: false,
  },
  basis:
    'Conservative. Insurance and registration excluded from GST credits because of stamp duty ' +
    'and government charges. Revisit with the adviser; including insurance would raise the benefit.',
  settled: false,
};

export const ALL_PRICING = [
  LEASE_RATE, BASE_FEE_PER_YEAR, VARIABLE_FEE_RATE, VARIABLE_FEE_THRESHOLD,
  FEE_INCLUDES_GST, RESIDUAL_PAYABLE_BASIS, GST_ON_RUNNING_COSTS,
];
