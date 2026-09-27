/**
 * POST /api/enquiry — the quote request form.
 *
 * Validates, checks the Cloudflare Turnstile token when TURNSTILE_SECRET is set, and stores the
 * enquiry in D1 (binding DB, schema in schema.sql). Personal details are stored once, here, and
 * nowhere else; the funnel counters in event.ts never see them.
 *
 * Notification: TODO — the build plan's preferred route (Cloudflare sending to the owner's
 * verified address) is to be confirmed at deployment. If it does not fit, the fallback is Basin
 * for the form only. Until then enquiries are read from D1.
 *
 * Secrets are environment variables only and are revoked in the Cloudflare dashboard:
 *   TURNSTILE_SECRET — spam check. DB — the D1 binding.
 */
interface Env {
  DB: D1Database;
  TURNSTILE_SECRET?: string;
}

const LIMITS: Record<string, number> = { name: 120, email: 200, phone: 40, car: 1000, odometer: 40, running: 40, employer: 200, notes: 2000 };
const REQUIRED = ['name', 'email', 'car', 'odometer', 'running', 'employer'];

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return json(400, { error: 'bad-request' }); }

  if (typeof data.website === 'string' && data.website.trim()) return json(200, { ok: true }); // honeypot

  const clean: Record<string, string> = {};
  for (const [k, max] of Object.entries(LIMITS)) {
    const v = typeof data[k] === 'string' ? (data[k] as string).trim() : '';
    if (v.length > max) return json(400, { error: 'too-long', field: k });
    clean[k] = v;
  }
  for (const k of REQUIRED) if (!clean[k]) return json(400, { error: 'required', field: k });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return json(400, { error: 'email' });

  if (env.TURNSTILE_SECRET) {
    const token = typeof data['cf-turnstile-response'] === 'string' ? data['cf-turnstile-response'] : '';
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', token as string);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const out = (await r.json()) as { success?: boolean };
    if (!out.success) return json(403, { error: 'spam-check' });
  }

  await env.DB.prepare(
    `INSERT INTO enquiries (received_at, name, email, phone, car, odometer, running, employer, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(new Date().toISOString(), clean.name, clean.email, clean.phone, clean.car, clean.odometer, clean.running, clean.employer, clean.notes).run();

  await env.DB.prepare(
    `INSERT INTO funnel (day, event, n) VALUES (date('now'), 'enquiry_sent', 1)
     ON CONFLICT(day, event) DO UPDATE SET n = n + 1`,
  ).run();

  return json(200, { ok: true });
};
