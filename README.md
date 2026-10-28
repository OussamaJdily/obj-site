# OBJ — website

Branding & design studio website for **OBJ** (Casablanca), in **French and English**.
Built with **Next.js 16** (App Router), **React 19** and **TypeScript**, made for **Vercel**.

## Run it
```bash
npm install
npm run dev        # http://localhost:3000  (redirects to /fr or /en)
npm run build      # production build (also type-checks)
npm start          # serve the production build
```
Requires Node.js 20.9 or newer.

## Where things are
| Path | What it is |
|---|---|
| `lib/brand.ts` | **Company details**: name, phone, email, address, city, domain, social links |
| `content/fr.ts`, `content/en.ts` | **All text**, in French and English (same structure, checked by TypeScript) |
| `content/types.ts` | Shape of the content |
| `app/[lang]/…` | Pages (`/fr/...` and `/en/...`) |
| `components/` | Header, footer, menu, sections, globe, contact form, quiz |
| `lib/effects.ts` | Scroll animations, smooth scrolling, counters, tilt cards |
| `app/globals.css` | Design system: colors, type, layouts, animations |
| `proxy.ts` | Language redirect (`/` → `/fr` or `/en`) and per-request Content-Security-Policy |
| `app/api/contact/route.ts` | Contact form endpoint (sends e-mail) |

## Pages (each in FR and EN)
Home · Visibility · SEO · GEO · Conversion · Websites · Online shops · Conversion optimization ·
Strategy & workshops · Projects + 5 case studies · Agency · Insights + 4 articles · Contact ·
Potential check (quiz) · Legal notice · Privacy · 404. Plus `sitemap.xml`, `robots.txt`, share images and favicon.

## Deploy on Vercel
1. On [vercel.com/new](https://vercel.com/new), import this GitHub repository. Vercel detects Next.js; keep the defaults and click **Deploy**.
2. Optional: under **Settings → Environment Variables**, add:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your domain, e.g. `https://obj.ma` (used for canonical links, sitemap, share images) |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com), so the contact form e-mails you directly |
| `CONTACT_TO_EMAIL` | Where inquiries arrive, e.g. `contact@obj.ma` |
| `CONTACT_FROM_EMAIL` | Sender, e.g. `OBJ <site@obj.ma>` (domain verified in Resend) |

Without the Resend variables the form still works: it opens the visitor's e-mail app with the message filled in.

## Security
- Strict **Content-Security-Policy with a fresh nonce on every request**: only this site's own scripts can run.
- HSTS, `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, Permissions-Policy, COOP; `X-Powered-By` removed.
- Contact API: same-origin check, input validation and length limits, honeypot against bots, rate limit (5 per 10 min per IP).
- No cookies, no tracking, no third-party requests. The font (Manrope, OFL license) is self-hosted.
- `npm audit`: 0 known vulnerabilities at the time of writing (Next.js 16.4.3).

## Before launch
- Real phone, e-mail, address and domain in `lib/brand.ts`.
- Team, clients, projects, testimonials, results and awards in `content/*.ts` are **sample content**. Replace them with real ones or remove them.
- Legal notice and privacy policy: fill in RC, ICE, IF, declare to the CNDP, and have a lawyer check them.
