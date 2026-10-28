// Contact form endpoint. Sends the inquiry by e-mail through Resend (https://resend.com)
// when RESEND_API_KEY and CONTACT_TO_EMAIL are set in the Vercel project settings.
// Without them it answers 503 and the form falls back to the visitor's e-mail app.

const MAX = { name: 120, email: 200, company: 160, phone: 40, site: 200, message: 5000, topic: 300 };
const hits = new Map<string, number[]>(); // simple per-instance rate limit: 5 requests / 10 min / IP

type Body = Partial<Record<keyof typeof MAX | 'website_hp' | 'locale', string>>;

export async function POST(request: Request) {
  // only accept posts coming from this site
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host || new URL(origin).host !== host) return Response.json({ error: 'forbidden' }, { status: 403 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60_000);
  if (recent.length >= 5) return Response.json({ error: 'rate_limited' }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: Body;
  try { body = await request.json(); } catch { return Response.json({ error: 'bad_request' }, { status: 400 }); }

  if (body.website_hp) return Response.json({ ok: true }); // honeypot filled: silently drop bots

  const clean: Record<string, string> = {};
  for (const [key, max] of Object.entries(MAX)) clean[key] = String(body[key as keyof Body] ?? '').trim().slice(0, max);
  if (!clean.name || !clean.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
    return Response.json({ error: 'invalid' }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return Response.json({ error: 'not_configured' }, { status: 503 });

  const details = [
    `Name: ${clean.name}`, `Email: ${clean.email}`, clean.company && `Company: ${clean.company}`,
    clean.phone && `Phone: ${clean.phone}`, clean.site && `Website: ${clean.site}`, clean.topic && `Topic: ${clean.topic}`,
  ].filter(Boolean);
  const text = `${details.join('\n')}\n\n${clean.message}`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'OBJ website <onboarding@resend.dev>',
      to: [to],
      reply_to: clean.email,
      subject: `New inquiry — ${clean.name}${clean.company ? ` (${clean.company})` : ''}`,
      text,
    }),
  });
  if (!res.ok) return Response.json({ error: 'send_failed' }, { status: 502 });
  return Response.json({ ok: true });
}
