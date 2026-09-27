/**
 * Business details. Every null is a TODO the owner supplies (build plan, facts 6-9).
 * A production build fails while any required value is null; previews show a visible marker.
 */
export const SITE = {
  name: 'Classic Leasing',
  tradingEntity: null as string | null,
  abn: null as string | null,
  domain: null as string | null,
  email: null as string | null,
  phone: null as string | null,
  registeredAddress: null as string | null,
  responseTime: null as string | null,
  /** Licence or authorisation line and external dispute resolution membership. Leave null:
   * the block renders NOTHING until the advice is received (brief s2; REG-010, REG-020). */
  licensingBlock: null as string | null,
  employerOnePagerUrl: null as string | null,
};

/** Required before a production build. licensingBlock and the one-pager are deliberately not
 * required: the site works without them (the block renders empty, the link is hidden). */
export const REQUIRED_FOR_LAUNCH = ['tradingEntity', 'abn', 'domain', 'email', 'responseTime'] as const;
