import { describe, it, expect } from 'vitest';
import { check } from '../src/lib/eligibility';

const ok = { body: 'car', year: 2014, odometer: 160000, value: 12000, runningCost: 10000, termYears: 3, condition: 'good' };

describe('eligibility checker', () => {
  it('passes a typical customer car', () => {
    expect(check(ok, 2026).outcome).toBe('eligible');
  });
  it('only two rules can say outside our criteria', () => {
    expect(check({ ...ok, body: 'ute-heavy' }, 2026).outcome).toBe('outside');
    expect(check({ ...ok, runningCost: 3000 }, 2026).outcome).toBe('outside');
    expect(check({ ...ok, year: 1990 }, 2026).outcome).toBe('conversation');
    expect(check({ ...ok, odometer: 400000 }, 2026).outcome).toBe('conversation');
    expect(check({ ...ok, condition: 'needs-work' }, 2026).outcome).toBe('conversation');
    expect(check({ ...ok, value: 60000, runningCost: 60000 }, 2026).outcome).toBe('conversation');
  });
  it('routes a borderline running-cost ratio to a conversation', () => {
    expect(check({ ...ok, runningCost: 8000 }, 2026).outcome).toBe('conversation');
  });
  it('gives the reason', () => {
    const r = check({ ...ok, odometer: 400000 }, 2026);
    expect(r.reasons[0]).toContain('250,000');
  });
});
