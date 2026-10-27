# OBJ website

A static, 26-page agency website. It has **zero npm dependencies** and needs only Node.js 18+ to build. The finished site is plain HTML, CSS and JS in `dist/`, so it runs on any host.

## Commands
| Command | What it does |
|---|---|
| `npm run build` | Generates the site into `dist/` |
| `npm run dev` | Builds, then serves it at http://localhost:4173 with the production security headers |
| `npm run check` | Builds, then checks links, assets, meta tags, CSP compliance and leftover placeholder data |

## Change your details
Everything lives in `src/build.mjs`:
- `BRAND` at the top: name, wordmark, phone, email, address, city, time zone, socials, domain and form endpoint
- `PROJECTS`: the case studies
- `INSIGHTS`: the blog articles
- `SERVICES` / `HUBS`: the service pages
- `TEAM`: the team members

Run `npm run check` afterwards. It lists any placeholder text that's still left.

## Deploy
| Host | How |
|---|---|
| **Netlify** | Connect the repo. `netlify.toml` already sets the build command and the `dist` folder. Headers come from `dist/_headers`. |
| **Vercel** | Import the repo. `vercel.json` already sets the build, output folder and headers. |
| **Cloudflare Pages** | Build command `npm run build`, output folder `dist`. Headers come from `dist/_headers`. |
| **cPanel / Apache / shared hosting** | Run `npm run build` and upload the *contents* of `dist/` to `public_html`. `dist/.htaccess` sets HTTPS, headers, caching and the 404 page. |

## Security and privacy built in
- Strict **Content-Security-Policy**: only the site's own scripts, fonts and images can load. No inline JavaScript, no third parties.
- HSTS, `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy, Permissions-Policy and COOP.
- **No external requests at all.** The font (Manrope, OFL license) is self-hosted, which keeps the site GDPR-friendly with no Google Fonts.
- No cookies and no tracking, so no cookie banner is needed. If you add analytics later, you'll need a banner and a privacy-policy update.
- The contact form has client-side validation and a honeypot field against spam bots.
- Asset URLs carry a content hash, so files are cached for a year and still update on every deploy.

## Contact form
Leave `BRAND.formEndpoint` empty and the form opens the visitor's e-mail app with the message filled in. To receive submissions directly, create a free form at a provider such as Formspree and paste its URL into `formEndpoint`. The security policy allows that domain automatically.

## Before launch (`npm run check` lists what's left)
- Your real name, contact details and domain in `BRAND`
- Legal notice and privacy policy texts, checked by a lawyer
- Real photos and screenshots instead of the placeholder visuals
- Real project results instead of the example figures
