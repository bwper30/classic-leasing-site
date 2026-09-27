/**
 * POST /api/event — anonymous funnel counters (brief s6: "instrument the funnel so a null
 * result is readable").
 *
 * Records only an event name from a fixed list, as a count per day. No cookie, no IP address,
 * no user agent, no identifier of any kind is read or stored.
 */
interface Env { DB: D1Database }

const EVENTS = new Set([
  'calc_start', 'calc_positive', 'calc_negative',
  'check_start', 'check_eligible', 'check_conversation', 'check_outside',
]);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let e = '';
  try { e = ((await request.json()) as { e?: string }).e ?? ''; } catch { /* ignore */ }
  if (!EVENTS.has(e)) return new Response(null, { status: 204 });
  await env.DB.prepare(
    `INSERT INTO funnel (day, event, n) VALUES (date('now'), ?, 1)
     ON CONFLICT(day, event) DO UPDATE SET n = n + 1`,
  ).bind(e).run();
  return new Response(null, { status: 204 });
};
