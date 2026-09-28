import { describe, it, expect } from 'vitest';
import { check } from '../src/lib/eligibility';

const ok = { body: 'car', year: 2014, odometer: 160000, value: 12000, termYears: 3, condition: 'good' };

describe('eligibility checker', () => {
  it('passes a typical customer car', () => {
    expect(check(ok, 2026).outcome).toBe('eligible');
  });
  it('only the FBT car rule can say outside our criteria', () => {
    expect(check({ ...ok, body: 'ute-heavy' }, 2026).outcome).toBe('outside');
    expect(check({ ...ok, year: 1990 }, 2026).outcome).toBe('conversation');
    expect(check({ ...ok, odometer: 400000 }, 2026).outcome).toBe('conversation');
    expect(check({ ...ok, condition: 'needs-work' }, 2026).outcome).toBe('conversation');
    expect(check({ ...ok, value: 60000 }, 2026).outcome).toBe('conversation');
  });
  it('never screens on savings or running costs', () => {
    expect(check({ ...ok, value: 30000 }, 2026).outcome).toBe('eligible');
  });
  it('gives the reason', () => {
    const r = check({ ...ok, odometer: 400000 }, 2026);
    expect(r.reasons[0]).toContain('250,000');
  });
});
