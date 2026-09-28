/**
 * Which figure decides the headline result and the "this doesn't work for you" state.
 *
 * 'cashFlow' — take-home pay each year, packaged against kept. Leaves out the agreed value we pay
 *              the customer at the start and the residual they pay at the end. The cautious view,
 *              and the one the brief's rule of thumb (s5) describes.
 * 'overTerm' — the whole term: take-home differences plus the agreed value received, less the
 *              residual. Every car that is "slightly behind" per pay can look well ahead here.
 *
 * Both are always shown as lines. This setting only chooses which one leads.
 *
 * DECIDED 28 Sep 2026 (owner): the whole term. It is the true economic comparison: the rentals
 * repay the agreed value the customer received at the start, so counting them without that
 * receipt treats the return of the customer's own money as a cost.
 */
export const HEADLINE_BASIS: { value: 'cashFlow' | 'overTerm'; provisional: boolean } = {
  value: 'overTerm',
  provisional: false,
};
