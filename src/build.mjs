// Static site generator for the OBJ website.
// Edit BRAND and the content objects below, then run:  node src/build.mjs
// Every page is written as a flat .html file in the project root.
import { writeFileSync, mkdirSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');            // deploy this folder
// content hash in asset URLs, so browsers can cache them for a year and still get every update
const hash = f => createHash('sha256').update(readFileSync(join(ROOT, 'assets', f))).digest('hex').slice(0, 10);
const VERSION = { css: hash('site.css'), js: hash('site.js') };

/* ============================== BRAND ============================== */
const BRAND = {
  name: 'OBJ',
  word: 'OBJ',                        // wordmark; the last letter gets the green dot
  mark: 'O',                          // letter in the floating pill
  tagline: 'branding & design studio.',
  city: 'Casablanca',
  country: 'MA',
  timezone: 'Africa/Casablanca',
  phone: '+212 5 22 00 00 00',
  phoneHref: '+212522000000',
  email: 'contact@obj.ma',
  address: ['OBJ Studio', 'Boulevard d’Anfa', '20000 Casablanca, Morocco'],
  year: 2027,
  formEndpoint: '',                   // e.g. a Formspree URL; empty = opens the visitor's e-mail app
  socials: [['in', 'https://www.linkedin.com/'], ['ig', 'https://www.instagram.com/']],
  url: 'https://obj.ma',
};

/* ============================== HELPERS ============================== */
const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>';
const DIAG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 4l8 8M12 5v7H5"/></svg>';
const CHEV = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 3.5l3 3 3-3"/></svg>';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// heading split into masked lines: lines(['Line one', 'Line two'])
const lines = (arr, cls = 't-h2', attrs = '') =>
  `<h2 class="${cls} lines" data-lines ${attrs}>${arr.map((l, i) => `<span class="ln" style="--i:${i}"><span>${l}</span></span>`).join('')}</h2>`;
const h1 = (arr, cls = 't-display t-display--md') =>
  `<h1 class="${cls} lines" data-lines>${arr.map((l, i) => `<span class="ln" style="--i:${i}"><span>${l}</span></span>`).join('')}</h1>`;
const btn = (href, text, kind = 'primary', extra = '') =>
  `<a href="${href}" class="btn btn--${kind} ${extra}">${text} ${kind === 'secondary' && extra.includes('diag') ? DIAG : ARROW}</a>`;
const wordmarkLetters = () => [...BRAND.word].map((c, i, a) => `<span${i === a.length - 1 ? ' class="wm-i"' : ''}>${c}</span>`).join('');

/* ============================== NAVIGATION ============================== */
const NAV = [
  ['projects.html', 'Projects', 'projects'],
  ['agency.html', 'Agency', 'agency'],
  ['insights.html', 'Insights', 'insights'],
  ['contact.html', 'Contact', 'contact'],
];

const header = page => `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <a href="index.html" class="logo" aria-label="${BRAND.name} home"><span>${BRAND.word.slice(0, -1)}<i>${BRAND.word.slice(-1)}</i></span><small>${BRAND.tagline}</small></a>
  <nav class="nav" aria-label="Main">
    <div class="nav__drop">
      <button aria-expanded="false" aria-haspopup="true">Solutions ${CHEV}</button>
      <div class="flyout">
        <div class="flyout__col"><span class="t-label t-muted">Before the click</span><a class="flyout__title" href="visibility.html">Visibility</a><a href="seo.html">SEO <span>→</span></a><a href="geo.html">GEO <span>→</span></a></div>
        <div class="flyout__col"><span class="t-label t-muted">After the click</span><a class="flyout__title" href="conversion.html">Conversion</a><a href="websites.html">Websites <span>→</span></a><a href="online-shops.html">Online shops <span>→</span></a><a href="conversion-optimization.html">Conversion optimization <span>→</span></a></div>
        <a class="flyout__wide" href="strategy-workshops.html"><span><span class="t-label t-muted">Before we build &nbsp;</span> Strategy &amp; workshops</span><span>→</span></a>
      </div>
    </div>
    ${NAV.map(([h, t, k]) => `<a href="${h}"${page === k ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
  </nav>
  <div class="head-right">${btn('potential-check.html', 'Check your potential', 'primary', 'btn--sm magnetic')}</div>
</header>
<div class="pill">
  <a href="index.html" class="pill__mark" aria-label="Home">${BRAND.mark}</a>
  ${btn('potential-check.html', 'Check your potential', 'primary', 'btn--sm')}
  <button class="burger" aria-label="Open menu" aria-expanded="false" data-menu-open><span></span></button>
</div>
<div class="menu" aria-hidden="true" role="dialog" aria-label="Menu">
  <button class="burger menu__close" aria-label="Close menu" data-menu-close>✕</button>
  <div>
    <p class="t-label t-muted" style="margin-bottom:24px">Menu</p>
    ${[['index.html', 'Home', 'home'], ['visibility.html', 'Visibility', 'visibility'], ['conversion.html', 'Conversion', 'conversion'], ...NAV]
      .map(([h, t, k], i) => `<a class="menu__link" style="--i:${i}" href="${h}"${page === k ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
  </div>
  <div class="menu__side">
    <p class="t-label t-muted">Solutions</p>
    <a href="seo.html">SEO</a><a href="geo.html">GEO</a><a href="websites.html">Websites</a><a href="online-shops.html">Online shops</a><a href="conversion-optimization.html">Conversion optimization</a><a href="strategy-workshops.html">Strategy &amp; workshops</a>
    <p class="t-label t-muted" style="margin-top:20px">Contact</p>
    <a href="tel:${BRAND.phoneHref}">${BRAND.phone}</a><a href="mailto:${BRAND.email}">${BRAND.email}</a>
    <div style="margin-top:16px">${btn('potential-check.html', 'Check your potential')}</div>
  </div>
</div>`;

const footer = () => `
<footer class="site-footer" id="footer">
  <div class="contact reveal">
    <div><p class="t-label t-muted" style="margin-bottom:18px">Contact</p><h2 class="t-h2">Let’s talk about your project.</h2></div>
    <div>
      <a class="contact__row" href="tel:${BRAND.phoneHref}"><span class="t-label t-muted">Phone</span><strong>${BRAND.phone} <span>→</span></strong></a>
      <a class="contact__row" href="mailto:${BRAND.email}"><span class="t-label t-muted">Email</span><strong>${BRAND.email} <span>→</span></strong></a>
    </div>
    <div class="foot-cols">
      <div><div class="awards" style="margin:0"><b>W</b><span>Web<br>Awards<br>2027</span><hr><span>Studio of<br>the year<br>nominee</span></div></div>
      <div><p class="t-label t-muted">Solutions</p><a href="visibility.html">Visibility</a><a href="conversion.html">Conversion</a><a href="strategy-workshops.html">Strategy &amp; workshops</a></div>
      <div><p class="t-label t-muted">${BRAND.name}</p><a href="projects.html">Projects</a><a href="agency.html">Agency</a><a href="insights.html">Insights</a><a href="contact.html">Contact</a></div>
      <div><p class="t-label t-muted">Studio</p><p style="margin:8px 0 0">${BRAND.address.join('<br>')}</p>
        <div class="socials">${BRAND.socials.map(([l, h]) => `<a href="${h}" target="_blank" rel="noopener" aria-label="${l}">${l}</a>`).join('')}</div></div>
    </div>
  </div>
  <div class="legal"><span>© <span data-year>${BRAND.year}</span> ${BRAND.name}</span><span><a href="legal-notice.html">Legal notice</a> &nbsp;·&nbsp; <a href="privacy.html">Privacy</a></span></div>
  <div class="wordmark" data-wordmark aria-hidden="true">${wordmarkLetters()}</div>
</footer>`;

const layout = ({ file, title, description, page = '', body, intro = false, extraChrome = '' }) => `<!doctype html>
<html lang="en" class="js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#080808">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(BRAND.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="canonical" href="${BRAND.url}/${file === 'index.html' ? '' : file}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23080808'/%3E%3Ctext x='6' y='24' font-family='Arial' font-weight='800' font-size='22' fill='%23f5f5f2'%3E${BRAND.mark}%3C/text%3E%3Ccircle cx='25' cy='9' r='3.5' fill='%23cdfb50'/%3E%3C/svg%3E">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfessionalService', name: BRAND.name, url: BRAND.url, email: BRAND.email, telephone: BRAND.phone,
  address: { '@type': 'PostalAddress', streetAddress: BRAND.address[1], addressLocality: BRAND.city, addressCountry: BRAND.country } })}</script>
<link rel="preload" href="assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/site.css?v=${VERSION.css}">
</head>
<body data-page="${page}">
${intro ? `<div class="intro" aria-hidden="true"><svg viewBox="0 0 520 160"><text x="260" y="120" text-anchor="middle">${BRAND.word}</text><circle cx="400" cy="112" r="14"/></svg></div>` : ''}
<div class="pt" aria-hidden="true"></div>
<div class="bg-dots" aria-hidden="true"></div>
<div class="bg-morph" aria-hidden="true"></div>
${header(page)}
${extraChrome}
<main id="main">
${body}
</main>
${footer()}
<nav class="pgp" aria-hidden="true"><i></i></nav>
<button class="sound" data-sound aria-pressed="false"><span data-sound-label>Sound off</span><span class="sound__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>
<div class="cursor" aria-hidden="true"><span class="cursor__dot"></span></div>
<script src="assets/site.js?v=${VERSION.js}" defer></script>
</body>
</html>
`;

/* ============================== SHARED SECTIONS ============================== */
const PROCESS_STEPS = [
  ['Analyze', 'We look at data, search demand, user behaviour and your competitors — before anyone opens a design tool.'],
  ['Prioritize', 'Not everything matters equally. We rank the levers by impact and effort, so the budget goes where it pays.'],
  ['Build', 'Design, copy, development and SEO from one team — built to be found and built to convert.'],
  ['Optimize', 'After launch we measure, test and refine. A website is never finished; it gets better.'],
];
const processSection = () => `
<section class="process on-space" data-process data-space aria-label="How we work">
  <div class="process__sticky">
    <div><p class="t-label t-muted" style="margin-bottom:18px">How we work</p>${lines(['From', 'problem', 'to progress.'])}</div>
    <div class="process__rail"><i></i></div>
    <div><ol>${PROCESS_STEPS.map(([t, d]) => `<li data-desc="${esc(d)}">${t}</li>`).join('')}</ol><p class="process__desc" aria-live="polite"></p></div>
  </div>
</section>`;

const losingCta = (h = ['Where are your customers', 'slipping away?'], label = 'The first step') => `
<section class="section on-space" data-space>
  <p class="t-label t-muted" style="margin-bottom:18px">${label}</p>
  ${lines(h, 't-h2', 'style="margin-bottom:50px"')}
  <div class="losing">
    <a href="visibility.html">Before the click ${ARROW}</a>
    <a href="conversion.html">After the click ${ARROW}</a>
    <a href="potential-check.html">Not sure yet ${ARROW}</a>
  </div>
  <div class="btn-row" style="margin-top:40px">${btn('potential-check.html', 'Start the potential check', 'primary', 'magnetic')}${btn('contact.html', 'Talk to us directly', 'secondary', 'magnetic')}</div>
</section>`;

const statement = (h, note = '', strong = '') => `
<section class="section statement">
  ${lines(h)}
  ${note ? `<p class="statement__note reveal">${note}${strong ? `<strong>${strong}</strong>` : ''}</p>` : ''}
  <div class="statement__dot"></div>
</section>`;

const crosslink = (h, text, href, label) => `
<section class="section section--tight">
  <div class="crosslink reveal">
    <h2 class="t-h3" style="font-size:clamp(28px,3vw,44px)">${h}</h2>
    <div><p>${text}</p>${btn(href, label, 'ghost', 'btn--sm')}</div>
  </div>
</section>`;

const railSection = (h, text, steps, clickAt = 2, link) => `
<section class="section rail-section">
  <div class="split">
    ${lines(h)}
    <div><p class="reveal">${text}</p>${link ? `<div class="reveal">${btn(link[0], link[1], 'ghost', 'btn--sm')}</div>` : ''}</div>
  </div>
  <div class="rail" data-rail style="--n:${steps.length}">
    <div class="rail__line"><div class="rail__fill"></div><span class="rail__click" style="left:${(clickAt - .5) / (steps.length - 1) * 100}%">CLICK</span></div>
    ${steps.map(s => `<div class="step">${s}</div>`).join('')}
  </div>
</section>`;

const caseRow = (p, i) => `
<li class="case reveal">
  <span class="case__n">${String(i + 1).padStart(2, '0')}</span>
  <div><h3 class="t-h3">${p.title}</h3><p class="case__meta"><strong>${p.name}</strong> · ${p.city} · ${p.industry}</p></div>
  <span class="case__tags t-label t-muted">${p.tags}</span>
  <span class="arrow-btn" aria-hidden="true">${ARROW}</span>
  <a class="case__cover" href="project-${p.slug}.html" aria-label="${esc(p.name)} case study"></a>
</li>`;

const projectsBlock = (slugs, label = 'Selected cases', h = ['Projects.']) => `
<section class="section">
  <p class="t-label t-muted" style="margin-bottom:18px">${label}</p>
  ${lines(h, 't-h2', 'style="margin-bottom:50px"')}
  <ol class="cases">${slugs.map(s => PROJECTS.find(p => p.slug === s)).map(caseRow).join('')}</ol>
  <div style="margin-top:40px">${btn('projects.html', 'All projects', 'ghost', 'btn--sm')}</div>
</section>`;

const pageHero = ({ crumb, h, lead, ctas = [], visual = '', facts = [] }) => `
<section class="page-hero" data-instant>
  <p class="t-label t-muted page-hero__crumb reveal">${crumb}</p>
  ${h1(h)}
  ${lead || ctas.length ? `<div class="page-hero__foot">
    ${lead ? `<p class="lead lead--wide reveal" style="--d:300">${lead}</p>` : '<span></span>'}
    ${ctas.length ? `<div class="btn-row reveal" style="--d:450">${ctas.join('')}</div>` : ''}
  </div>` : ''}
  ${facts.length ? `<div class="page-hero__facts t-label t-muted reveal" style="--d:550">${facts.map((f, i) => `<span>${i === 0 ? '<span class="dot"></span>' : '·'} ${f}</span>`).join('')}</div>` : ''}
  ${visual ? `<div class="page-hero__visual reveal" style="--d:500">${visual}</div>` : ''}
</section>`;

const searchMock = () => `
<div class="mock">
  <div class="mock__bar"><i></i><b></b></div>
  <div class="mock__row"><i></i><b></b><em></em></div>
  <div class="mock__row"><i></i><b style="flex:.8"></b><em></em></div>
  <div class="mock__row"><i></i><b style="flex:.9"></b><em></em></div>
  <div class="mock__row is-you"><i></i><b style="flex:.7"></b><em></em></div>
</div>`;
const browserMock = (word, tint = '189 108 247') => `<div class="media" data-tilt style="--tint:${tint}"><div class="media__word">${word}</div><div class="media__browser"></div></div>`;

/* ============================== CONTENT: PROJECTS ============================== */
const PROJECTS = [
  { slug: 'orbit', name: 'ORBIT', title: 'A new product nobody knew yet.', city: 'Casablanca', industry: 'Consumer electronics', tags: 'Visibility · Conversion', tint: '189 108 247', year: '2027', featured: true,
    services: ['Brand', 'Launch website', 'Online shop', 'SEO'],
    intro: ['ORBIT had built a magnetic power bank that clips onto any phone. The product was great. The problem: nobody was searching for it, because nobody knew it existed.', 'We built a launch site that explains the product in seconds, a shop that turns curiosity into orders, and content that ranks for the problems people actually search for.'],
    timeline: [['Discovery', 'Interviews with early buyers showed people never searched for “power bank” — they searched for “phone dies at festival”.'], ['Positioning', 'We moved the story from specs to situations: concerts, travel, long shifts.'], ['Launch site & shop', 'A single scroll that sells, then a checkout with three steps instead of seven.'], ['Search content', 'Guides around real situations, linked straight to the product.']],
    statement: ['Unknown on launch day.', 'Sold out in week six.'],
    built: [['Launch page', 'Scroll story with product animation.'], ['Shop', 'Three-step checkout, Apple Pay & PayPal.'], ['Bundles', 'Upsell at the moment of decision.'], ['SEO guides', 'Situational content that ranks.'], ['Reviews', 'Social proof next to every button.'], ['Analytics', 'Funnel tracking from first visit to order.']],
    quote: ['They didn’t ask what our website should look like. They asked why people weren’t buying. That question changed everything.', 'Salma Benali, Founder, ORBIT'],
    metrics: [[3.4, 'x', '', 'more orders in the first quarter'], [62, '%', '', 'of shop visits from organic search'], [41, '%', '−', 'checkout abandonment']],
    credits: [['Strategy', BRAND.name], ['Design', BRAND.name], ['Development', BRAND.name], ['Photography', 'Client']] },
  { slug: 'atlas-bois', name: 'Atlas Bois', title: 'A great product nobody could find.', city: 'Casablanca', industry: 'Furniture', tags: 'Visibility · Conversion', tint: '205 251 80', year: '2027',
    services: ['SEO', 'Website relaunch', 'Product configurator'],
    intro: ['Atlas Bois makes solid-wood furniture to order in Aïn Sebaâ. Their customers loved them — but online, the big chains took every search result.', 'We restructured the site around how people actually look for furniture and made every product page a landing page.'],
    timeline: [['Search analysis', '1,800 relevant search terms, grouped by intent.'], ['Information architecture', 'Categories rebuilt around rooms and needs instead of internal product codes.'], ['Product pages', 'Each page answers the five questions buyers ask before a call.'], ['Local SEO', 'Showroom visibility for “near me” searches.']],
    statement: ['Hidden behind the big chains.', 'Now on page one.'],
    built: [['Category hubs', 'Rooms, materials, styles.'], ['Product pages', 'Built to rank and to convert.'], ['Configurator', 'Wood, size, finish — with live price.'], ['Showroom', 'Booking in two clicks.'], ['Local SEO', 'Google Business Profile & reviews.'], ['Tracking', 'Every inquiry traced to its source.']],
    quote: ['For the first time, people come into the showroom already knowing what they want.', 'Youssef El Amrani, Managing Director'],
    metrics: [[212, '%', '+', 'organic traffic in 9 months'], [2.6, 'x', '', 'more configurator inquiries'], [38, '', '', 'keywords on page one']],
    credits: [['Strategy', BRAND.name], ['SEO', BRAND.name], ['Development', BRAND.name], ['Photography', 'Studio Anfa']] },
  { slug: 'lingua-lab', name: 'Lingua Lab', title: 'In price comparisons, the big players always won.', city: 'Rabat', industry: 'Education', tags: 'Visibility · Conversion', tint: '120 140 255', year: '2026',
    services: ['Positioning', 'Website', 'SEO'],
    intro: ['Lingua Lab teaches business English in small groups. When people compared prices, the big schools always looked cheaper.', 'We stopped competing on price and started competing on outcome: a website that sells results, not hours.'],
    timeline: [['Positioning', 'From “language courses” to “confident in meetings in 12 weeks”.'], ['Course finder', 'Three questions lead to the right course.'], ['Proof', 'Before/after stories from real participants.'], ['SEO', 'Content for specific business situations.']],
    statement: ['Too expensive in comparison.', 'Worth it in context.'],
    built: [['Course finder', 'The right course in three questions.'], ['Course pages', 'Outcome first, price second.'], ['Booking', 'Trial lesson in under a minute.'], ['Stories', 'Participant results.'], ['Company offers', 'Packages for HR teams.'], ['SEO content', 'Business-English topics.']],
    quote: ['We used to lose on price. Now people ask for us by name.', 'Nadia Berrada, Head of School'],
    metrics: [[74, '%', '+', 'trial lesson bookings'], [31, '%', '+', 'average order value'], [19, '', '', 'company contracts in year one']],
    credits: [['Strategy', BRAND.name], ['Copy', BRAND.name], ['Design', BRAND.name], ['Development', BRAND.name]] },
  { slug: 'lumen-photo', name: 'Lumen Photo', title: 'Anyone who wanted to book had to call first.', city: 'Marrakech', industry: 'Photography', tags: 'Conversion', tint: '255 170 120', year: '2026',
    services: ['Website', 'Online booking', 'Pricing pages'],
    intro: ['Lumen Photo is a portrait studio. Every booking started with a phone call — and half of the calls came while the photographer was shooting.', 'We put prices, packages and available slots online, so people can book at 11 pm on a Sunday.'],
    timeline: [['Call analysis', 'Eight questions came up in almost every call. We answered all of them on the site.'], ['Packages', 'Three clear packages instead of an hourly rate.'], ['Booking', 'Calendar with deposit payment.'], ['Follow-up', 'Automatic reminders and gallery delivery.']],
    statement: ['Every booking was a phone call.', 'Now most happen overnight.'],
    built: [['Packages', 'Three clear offers.'], ['Booking', 'Live availability with deposit.'], ['Portfolio', 'Fast, filterable galleries.'], ['FAQ', 'The eight questions, answered.'], ['Vouchers', 'Gift cards sold online.'], ['Reminders', 'Fewer no-shows.']],
    quote: ['I finally have my evenings back — and more bookings than before.', 'Imane Tazi, Photographer'],
    metrics: [[68, '%', '', 'of bookings now fully online'], [45, '%', '−', 'phone calls'], [22, '%', '+', 'revenue per month']],
    credits: [['Design', BRAND.name], ['Development', BRAND.name], ['Copy', BRAND.name], ['Photography', 'Lumen Photo']] },
  { slug: 'dar-events', name: 'Dar Events', title: 'Nobody could find their way around the website.', city: 'Tangier', industry: 'Events & venue', tags: 'Visibility · Conversion', tint: '255 120 170', year: '2026',
    services: ['UX', 'Website relaunch', 'Event inquiry flow'],
    intro: ['Dar Events is a venue for concerts, weddings and company events. The old website tried to serve everyone on one page — and served no one.', 'We split the site by audience and built a guided inquiry that gives the events team everything they need up front.'],
    timeline: [['User research', 'Three audiences, three completely different questions.'], ['Structure', 'Separate paths for guests, couples and companies.'], ['Inquiry flow', 'Date, guests, budget, wishes — in one guided form.'], ['Event calendar', 'Public events with ticket links.']],
    statement: ['One page for everyone.', 'A clear path for each.'],
    built: [['Audience paths', 'Guests, couples, companies.'], ['Inquiry flow', 'Guided, five steps.'], ['Room finder', 'Capacity and layouts.'], ['Calendar', 'Events and tickets.'], ['Gallery', 'Real events, real rooms.'], ['SEO', 'Venue searches in the region.']],
    quote: ['Inquiries now arrive complete. We can send an offer the same day.', 'Karim Bennani, Events Manager'],
    metrics: [[2.1, 'x', '', 'event inquiries'], [57, '%', '−', 'back-and-forth e-mails'], [34, '%', '+', 'bookings for company events']],
    credits: [['UX', BRAND.name], ['Design', BRAND.name], ['Development', BRAND.name], ['Photography', 'Client']] },
];

/* ============================== CONTENT: INSIGHTS ============================== */
const INSIGHTS = [
  { slug: 'seo-or-geo', topic: 'Visibility', title: 'SEO or GEO: what does your business need first?', word: 'GEO', tint: '189 108 247', date: '12 Jan 2027', read: '7 min',
    excerpt: 'AI assistants answer questions that used to send people to Google. Does that make SEO obsolete? Not quite.',
    sections: [
      ['What is changing in search', '<p>More and more people ask ChatGPT, Perplexity or Google’s AI Overviews instead of scrolling through ten blue links. The answer appears directly — sometimes with a source, sometimes without.</p><p>For businesses, this raises a new question: not only “are we ranking?” but also “are we being mentioned?”</p>'],
      ['SEO: being found', '<p>Search engine optimization makes sure your pages appear when people search for what you offer. It rests on four pillars:</p><ul><li><strong>Technology</strong> — the site can be crawled, loads fast and is structured clearly.</li><li><strong>Relevance</strong> — you target the searches that actually lead to customers.</li><li><strong>Content</strong> — pages answer questions completely and honestly.</li><li><strong>Authority</strong> — other sites, reviews and mentions confirm you are trustworthy.</li></ul>'],
      ['GEO: being understood and mentioned', '<p>Generative engine optimization makes your business understandable for AI systems. They need clear, consistent facts: what you do, for whom, where, and why you are a good choice.</p><div class="callout"><strong>In short</strong>SEO gets you into the list. GEO gets you into the answer.</div>'],
      ['Why GEO does not replace SEO', '<p>AI systems draw heavily on content that already ranks well. A site that is invisible to Google is rarely quoted by an AI assistant. GEO builds on SEO; it does not replace it.</p>'],
      ['The sensible order', '<ol><li>Fix the technical foundation.</li><li>Cover the searches with real buying intent.</li><li>Make your facts consistent everywhere — website, profiles, directories.</li><li>Then optimize for being cited in AI answers.</li></ol><p>Not sure where you stand? The <a href="potential-check.html">potential check</a> gives you a first assessment in two minutes.</p>'],
    ] },
  { slug: 'visitors-no-inquiries', topic: 'Conversion', title: 'Plenty of visitors, but no inquiries? Here’s where they drop off.', word: 'CTA', tint: '205 251 80', date: '9 Jan 2027', read: '6 min',
    excerpt: 'Traffic is up, inquiries are flat. Before you redesign everything, check these five places.',
    sections: [
      ['Traffic is not the goal', '<p>A rising visitor graph feels good. But if the number of inquiries stays flat, the website has a conversion problem — not a visibility problem.</p>'],
      ['1. The first five seconds', '<p>Can a new visitor tell what you offer, for whom, and what to do next — without scrolling? If not, most will leave before they read anything.</p>'],
      ['2. The wrong visitors', '<p>Sometimes the traffic itself is the issue: rankings for terms that sound right but attract people who will never buy. Check which pages bring visitors and which bring inquiries.</p>'],
      ['3. Missing answers', '<p>Price range, process, timeline, location. Every unanswered question is a reason to postpone the decision — or to ask a competitor.</p>'],
      ['4. Forms that feel like paperwork', '<p>Twelve required fields for a first contact? Ask only for what you need to reply. The rest can wait for the conversation.</p><blockquote>Every field you remove is a small invitation to say yes.</blockquote>'],
      ['5. No proof', '<p>Reviews, logos, case studies and real photos turn “sounds good” into “I trust them”. Place them next to the decision, not on a separate page.</p>'],
    ] },
  { slug: 'relaunch-or-optimize', topic: 'Strategy', title: 'Relaunch or optimize? How to decide without guessing.', word: 'NEW?', tint: '120 140 255', date: '14 Dec 2026', read: '5 min',
    excerpt: 'A new website feels like a fresh start. Sometimes it is. Often, targeted fixes deliver more — faster.',
    sections: [
      ['The relaunch reflex', '<p>When results disappoint, a new website is the obvious answer. But a new design on the same weak structure produces the same weak results — just prettier.</p>'],
      ['When optimizing is enough', '<ul><li>The technology is solid and maintainable.</li><li>The problems are concentrated on a few pages or steps.</li><li>Your positioning has not fundamentally changed.</li></ul>'],
      ['When a relaunch makes sense', '<ul><li>The system blocks every change.</li><li>Your offer or audience has changed significantly.</li><li>Structure, content and design all need to change at once.</li></ul>'],
      ['How we decide', '<p>We start with an analysis: data, search demand, user behaviour. Then we compare effort and impact. The answer is rarely all or nothing.</p><div class="callout"><strong>Rule of thumb</strong>Fix the leaks first. Rebuild only when the foundation itself is the leak.</div>'],
    ] },
  { slug: 'forms-that-block', topic: 'Conversion', title: 'Forms that prevent inquiries — and how to fix them.', word: 'FORM', tint: '255 170 120', date: '2 Dec 2026', read: '4 min',
    excerpt: 'The contact form is the last step before a lead. It is also where many of them quietly disappear.',
    sections: [
      ['The most expensive page element', '<p>Everything before the form costs money: ads, SEO, content, design. If people give up at the form, all of that investment is lost.</p>'],
      ['Common mistakes', '<ul><li>Too many required fields.</li><li>Unclear what happens after sending.</li><li>Error messages that only appear after submitting.</li><li>No alternative for people who prefer to call.</li></ul>'],
      ['What works better', '<ol><li>Ask what it is about with one click (chips instead of a dropdown).</li><li>Keep the required fields to name, e-mail and message.</li><li>Say how fast you reply.</li><li>Show phone and e-mail right next to the form.</li></ol><p>Our own <a href="contact.html">contact page</a> follows exactly these rules.</p>'],
    ] },
];

/* ============================== CONTENT: SERVICE PAGES ============================== */
const SERVICES = {
  seo: { file: 'seo.html', page: 'visibility', title: 'SEO', parent: ['visibility.html', 'Visibility'],
    h: ['When people search', 'for what you do,', 'be there.'],
    lead: 'People search for solutions, services and providers near them. SEO makes sure your business shows up in the searches that actually lead to customers.',
    visual: searchMock(),
    statement: [['It’s not about ranking', 'for every term.'], 'Rankings for random terms bring visitors who never buy.', 'What counts are the searches backed by a real need.'],
    factors: { label: 'Search intent', h: ['Every relevant search', 'needs the right answer.'], items: [['Problem', 'People describe a problem but don’t know the solution yet.'], ['Service', 'People search for a specific service, like yours.'], ['Product', 'People look for a specific product or product type.'], ['Region', 'People look for a provider near them.'], ['Decision', 'People compare providers and are close to deciding.'], ['Brand', 'People already know you and look for your name.']] },
    pillars: { label: 'The SEO system', h: ['Technology. Relevance.', 'Content. Authority.'], items: [['The foundation', 'Technology', 'Crawlable, fast, clear.', 'Load time, indexing, structured data — so search engines can read your site properly.'], ['The topics', 'Relevance', 'The right searches.', 'Which searches matter for your business and which page answers them.'], ['The answers', 'Content', 'Genuinely helpful.', 'Content that answers questions completely and is written for people.'], ['Trust', 'Authority', 'Confirmed from outside.', 'Mentions, links, reviews and listings that speak for your company.']] },
    work: ['What we actually do.', 'What makes sense is decided by the analysis — not by a package.', ['Market & search analysis', 'Keyword & intent analysis', 'Competitor analysis', 'Technical SEO', 'Information architecture', 'On-page optimization', 'Content', 'Local SEO', 'Monitoring']],
    rail: [['A ranking is', 'not a result yet.'], 'Position one is worthless if nobody clicks — or if the site doesn’t convince them afterwards. That’s why we think SEO all the way to the customer.', ['Search', 'Ranking', 'Click', 'Website', 'Conversion', 'Customer'], 3, ['conversion.html', 'Conversion']],
    split: [['Local SEO: be found', 'where your customers are.'], 'For businesses serving a region, local search matters most — in Google Search, Google Maps and your Business Profile.', 'We make sure your information is complete, consistent and convincing.'],
    cross: ['And when search stops showing a list?', 'SEO lays the foundation. GEO extends your visibility into the answers of AI systems.', 'geo.html', 'GEO'],
    projects: ['atlas-bois', 'lingua-lab'], cta: ['How much demand are you', 'leaving on the table?'] },
  geo: { file: 'geo.html', page: 'visibility', title: 'GEO', parent: ['visibility.html', 'Visibility'],
    h: ['When AI answers,', 'your business', 'should be in it.'],
    lead: 'ChatGPT, Perplexity and Google’s AI Overviews answer questions directly. GEO makes sure your business is understood — and recommended.',
    visual: `<div class="mock"><div class="mock__bar"><i></i><b style="width:60%"></b></div><div class="mock__row"><b></b></div><div class="mock__row"><b style="flex:.9"></b></div><div class="mock__row is-you"><i></i><b style="flex:.6"></b><em></em></div><div class="mock__row"><b style="flex:.75"></b></div></div>`,
    statement: [['Search is becoming', 'a conversation.'], 'People ask full questions and expect a single answer.', 'The question is whether that answer mentions you.'],
    factors: { label: 'What AI systems need', h: ['Clear facts.', 'Consistent everywhere.'], items: [['Who you are', 'A clear, consistent description of your business.'], ['What you offer', 'Services and products, named the way customers name them.'], ['For whom', 'Your audience, region and specialisation.'], ['Proof', 'Reviews, cases and mentions on other sites.'], ['Structure', 'Structured data that machines can read.'], ['Freshness', 'Up-to-date information across all profiles.']] },
    pillars: { label: 'The GEO system', h: ['Understood. Trusted.', 'Mentioned.'], items: [['Base', 'Entity', 'Who you are, clearly.', 'One consistent description of your business, everywhere.'], ['Answers', 'Content', 'Quotable.', 'Content structured so AI can quote it accurately.'], ['Signals', 'Mentions', 'Confirmed by others.', 'Reviews, press, directories and partner sites.'], ['Tracking', 'Monitoring', 'Measured.', 'We check what AI systems say about you — regularly.']] },
    work: ['What we actually do.', 'Built on a solid SEO foundation — never instead of it.', ['AI visibility audit', 'Entity & brand facts', 'Structured data', 'FAQ & answer content', 'Profile consistency', 'Review strategy', 'Prompt monitoring']],
    rail: [['A mention is', 'not a customer yet.'], 'Being recommended by AI only pays off if your website then convinces. That’s why GEO and conversion belong together.', ['Question', 'AI answer', 'Mention', 'Website', 'Inquiry', 'Customer'], 3, ['conversion.html', 'Conversion']],
    split: [['GEO builds', 'on SEO.'], 'AI systems rely heavily on content that already ranks well.', 'A business that is invisible on Google is rarely mentioned by AI. We take care of both.'],
    cross: ['Start with the foundation.', 'Without technical SEO and relevant content, GEO has nothing to build on.', 'seo.html', 'SEO'],
    projects: ['orbit', 'atlas-bois'], cta: ['What does AI say', 'about your business?'] },
  websites: { file: 'websites.html', page: 'conversion', title: 'Websites', parent: ['conversion.html', 'Conversion'],
    h: ['A website that', 'turns visitors', 'into customers.'],
    lead: 'Not just a nice-looking site. A website that explains what you offer in seconds, answers the real questions and makes the next step easy.',
    visual: browserMock('WEB'),
    statement: [['Beautiful is not', 'the same as effective.'], 'Many websites look good and still don’t bring inquiries.', 'We design for the decision, not for the portfolio.'],
    factors: { label: 'What a good website does', h: ['Five seconds', 'to make it clear.'], items: [['Clarity', 'What you offer, for whom, and why you — instantly.'], ['Guidance', 'A clear path to the next step on every page.'], ['Answers', 'Prices, process, timelines — no guessing.'], ['Proof', 'Cases, reviews and real people.'], ['Speed', 'Fast on every device, especially mobile.'], ['Findability', 'SEO built in from the first line of code.']] },
    pillars: { label: 'How we build', h: ['Strategy. Copy.', 'Design. Code.'], items: [['First', 'Strategy', 'Why people buy.', 'Positioning and structure based on real customer questions.'], ['Words', 'Copy', 'Clear, not clever.', 'Text that answers questions and sells without shouting.'], ['Look', 'Design', 'Distinctive and usable.', 'A look that fits your brand and guides attention.'], ['Engine', 'Code', 'Fast and maintainable.', 'Modern, accessible, easy for your team to update.']] },
    work: ['What we deliver.', 'From the first workshop to launch and beyond.', ['Workshops', 'Sitemap & wireframes', 'Copywriting', 'UI design', 'Animation', 'Development', 'CMS', 'SEO setup', 'Tracking', 'Training', 'Hosting & care']],
    rail: [['Launch is the', 'start, not the end.'], 'After launch we watch how people use the site and keep improving what matters.', ['Analysis', 'Concept', 'Design', 'Build', 'Launch', 'Optimize'], 5, ['conversion-optimization.html', 'Conversion optimization']],
    split: [['Relaunch or', 'optimize?'], 'Not every problem needs a new website.', 'We tell you honestly whether targeted improvements will do the job.'],
    cross: ['Selling products online?', 'For online shops the path to purchase has its own rules.', 'online-shops.html', 'Online shops'],
    projects: ['lumen-photo', 'dar-events'], cta: ['Is your website', 'working for you?'] },
  'online-shops': { file: 'online-shops.html', page: 'conversion', title: 'Online shops', parent: ['conversion.html', 'Conversion'],
    h: ['A shop that', 'sells, not just', 'shows.'],
    lead: 'From product page to checkout: we build online shops that remove doubt, reduce abandonment and make buying feel easy.',
    visual: browserMock('SHOP', '205 251 80'),
    statement: [['Every extra click', 'costs a sale.'], 'Most shops lose buyers in the last three steps.', 'We find those moments and remove them.'],
    factors: { label: 'Where buyers drop off', h: ['Small doubts.', 'Lost orders.'], items: [['Product page', 'Missing details, sizes or delivery times.'], ['Trust', 'No reviews, unknown brand, unclear returns.'], ['Cart', 'Surprise shipping costs.'], ['Checkout', 'Forced account creation, too many fields.'], ['Payment', 'The preferred payment method is missing.'], ['Mobile', 'Small buttons, slow pages.']] },
    pillars: { label: 'The shop system', h: ['Find. Trust.', 'Decide. Buy.'], items: [['Discovery', 'Find', 'Filters that work.', 'Search, categories and filters that lead to the right product.'], ['Confidence', 'Trust', 'No doubts left.', 'Reviews, guarantees and clear policies.'], ['Choice', 'Decide', 'Easy comparisons.', 'Variants, bundles and recommendations.'], ['Checkout', 'Buy', 'Fast and safe.', 'Few steps, guest checkout, all common payment methods.']] },
    work: ['What we deliver.', 'Shopify, Shopware or custom — whatever fits your business.', ['Shop strategy', 'Platform choice', 'Product pages', 'Checkout optimization', 'Payment & shipping', 'ERP & inventory', 'Product SEO', 'Tracking', 'A/B testing']],
    rail: [['A visit is', 'not an order yet.'], 'We look at the whole path, from the first search to the confirmation e-mail.', ['Search', 'Product', 'Cart', 'Checkout', 'Order', 'Repeat'], 2, ['conversion-optimization.html', 'Conversion optimization']],
    split: [['Products people', 'search for.'], 'Product and category pages are your best SEO assets.', 'We build them to rank and to sell.'],
    cross: ['Selling services instead?', 'For services, the website has to answer different questions.', 'websites.html', 'Websites'],
    projects: ['orbit', 'atlas-bois'], cta: ['Where does your shop', 'lose buyers?'] },
  'conversion-optimization': { file: 'conversion-optimization.html', page: 'conversion', title: 'Conversion optimization', parent: ['conversion.html', 'Conversion'],
    h: ['More customers', 'from the visitors', 'you already have.'],
    lead: 'Before you buy more traffic, use the traffic you have. We find out why visitors leave — and fix it with data, not opinions.',
    visual: browserMock('CRO', '120 140 255'),
    statement: [['A new button colour', 'is not a strategy.'], 'Real improvements come from understanding why people hesitate.', 'That’s where we start.'],
    factors: { label: 'What we look at', h: ['Data first.', 'Then decisions.'], items: [['Analytics', 'Where visitors come from and where they leave.'], ['Heatmaps', 'What people click, read and ignore.'], ['Recordings', 'Real sessions, real friction.'], ['Surveys', 'What stopped people from buying.'], ['Forms', 'Which fields cause drop-off.'], ['Speed', 'How load time affects conversion.']] },
    pillars: { label: 'The method', h: ['Measure. Understand.', 'Test. Improve.'], items: [['Data', 'Measure', 'Clean tracking.', 'Reliable numbers before anything else.'], ['Why', 'Understand', 'Find the friction.', 'Research into what holds people back.'], ['Proof', 'Test', 'A/B tests.', 'Changes are tested, not guessed.'], ['Result', 'Improve', 'Roll out what works.', 'Winning variants go live; we start the next round.']] },
    work: ['What we deliver.', 'Monthly sprints or a one-off audit.', ['Conversion audit', 'Tracking setup', 'Funnel analysis', 'Heatmaps & recordings', 'User surveys', 'Hypotheses', 'A/B testing', 'Landing pages', 'Reporting']],
    rail: [['Small changes,', 'measured.'], 'Each sprint ends with a clear result: what we tested, what worked, what’s next.', ['Measure', 'Analyze', 'Hypothesis', 'Test', 'Result', 'Rollout'], 3, ['strategy-workshops.html', 'Strategy & workshops']],
    split: [['Ads running but', 'no results?'], 'Paid traffic deserves a landing page built for it.', 'We build ad landing pages that match the promise of the ad.'],
    cross: ['Not enough visitors in the first place?', 'Then the bottleneck is before the click.', 'visibility.html', 'Visibility'],
    projects: ['lingua-lab', 'lumen-photo'], cta: ['How many visitors', 'are you losing?'] },
};

const HUBS = {
  visibility: { file: 'visibility.html', title: 'Visibility', crumb: 'Before the click',
    h: ['Not seen', 'enough?'], lead: 'If people can’t find you, the best website doesn’t help. We make sure the right people find your business — in search engines and in AI answers.',
    statement: [['Being found is good.', 'Being found by the', 'right people is better.']],
    subs: [['seo.html', 'SEO', 'Search engine optimization', 'Show up when people search for what you offer — on Google, Bing and Maps.', ['Technical SEO', 'Content', 'Local SEO']], ['geo.html', 'GEO', 'Generative engine optimization', 'Be understood and recommended by ChatGPT, Perplexity and AI Overviews.', ['AI audit', 'Entity facts', 'Monitoring']]],
    rail: [['Visibility is the', 'first half.'], 'Getting found brings people to your website. What happens there is the second half — conversion.', ['Search', 'Ranking', 'Click', 'Website', 'Conversion', 'Customer'], 3, ['conversion.html', 'Conversion']],
    projects: ['atlas-bois', 'orbit'] },
  conversion: { file: 'conversion.html', title: 'Conversion', crumb: 'After the click',
    h: ['Not chosen', 'enough?'], lead: 'Visitors arrive, but few become customers. We find out where they hesitate and build websites and shops that make the decision easy.',
    statement: [['Traffic is not', 'the goal. Customers are.']],
    subs: [['websites.html', 'Websites', 'For services', 'Websites that explain, convince and make the next step easy.', ['Strategy', 'Design', 'Development']], ['online-shops.html', 'Online shops', 'For products', 'Shops that remove doubt and reduce abandonment.', ['Product pages', 'Checkout', 'Payment']], ['conversion-optimization.html', 'Conversion optimization', 'For existing sites', 'More customers from the visitors you already have.', ['Analysis', 'A/B tests', 'Landing pages']]],
    rail: [['The click is', 'only the beginning.'], 'Every step after the click is a chance to win — or lose — a customer.', ['Click', 'First impression', 'Orientation', 'Trust', 'Inquiry', 'Customer'], 1, ['visibility.html', 'Visibility']],
    projects: ['lumen-photo', 'dar-events'] },
};

/* ============================== PAGE BUILDERS ============================== */
const pages = [];
const add = (file, opts) => pages.push({ file, ...opts });

// ---------- HOME ----------
add('index.html', {
  title: `${BRAND.name} — Branding & design studio`,
  description: 'Branding & design studio. We make sure the right people find you — and that visitors become customers.',
  page: 'home', intro: true,
  extraChrome: `<div class="status" aria-hidden="true"><span><strong>${BRAND.city}</strong> <strong data-clock="${BRAND.timezone}">--:--</strong></span><span>·&nbsp; Potential customer</span><span><span class="dot"></span>&nbsp; Customer</span></div>`,
  body: `
<section class="hero" data-hero>
  <div class="hero__sticky">
    <canvas class="hero__canvas" data-globe aria-hidden="true"></canvas>
    <div class="hero__glow"></div>
    <p class="hero__hint t-label t-muted">Drag to rotate</p>
    <div class="hero__content" data-instant>
      <p class="t-label t-muted reveal">Visibility · Conversion · Growth</p>
      <h1 class="t-display hero__title lines" data-lines>
        <span class="ln" style="--i:0"><span>Not seen</span></span>
        <span class="ln" style="--i:1"><span>enough?</span></span>
        <span class="ln indent" style="--i:2"><span>Not chosen</span></span>
        <span class="ln indent" style="--i:3"><span>enough?</span></span>
      </h1>
      <div class="hero__foot">
        <p class="lead reveal" style="--d:400">We make sure the right people find your business — and that visitors turn into customers.</p>
        <div class="btn-row reveal" style="--d:550">${btn('potential-check.html', 'Check your potential', 'primary', 'magnetic')}${btn('projects.html', 'View projects', 'secondary', 'btn--diag magnetic')}</div>
      </div>
    </div>
    <div class="hero__drift" data-drift aria-hidden="true">Where are your customers <span>slipping away?</span> — Where are your customers <span>slipping away?</span></div>
  </div>
</section>

<section class="section on-space" data-space>
  <div class="fork">
    <div class="fork__col">
      <p class="t-label t-muted">Before the click</p>
      ${lines(['Nobody', 'finds you.'])}
      <div class="fork__chips"><span class="chip">SEO</span><span class="chip">GEO</span></div>
      ${btn('visibility.html', 'Visibility', 'ghost', 'btn--sm')}
    </div>
    <div class="fork__col">
      <p class="t-label t-muted">After the click</p>
      ${lines(['People come.', 'Too few', 'stay and buy.'])}
      <div class="fork__chips"><span class="chip">Websites</span><span class="chip">Online shops</span><span class="chip">Conversion optimization</span></div>
      ${btn('conversion.html', 'Conversion', 'ghost', 'btn--sm')}
    </div>
  </div>
</section>

<section class="journey" data-journey>
  <div class="journey__sticky">
    <div class="journey__rays"></div>
    <div class="journey__top">
      ${lines(['Getting found is', 'just the start.'])}
      <p class="lead reveal">Visibility brings people to your website. Conversion decides whether they become customers.</p>
    </div>
    <div class="journey__labels t-label t-muted"><span>Visibility · before the click</span><span>Conversion · after the click</span></div>
    <div class="rail" style="--n:5">
      <div class="rail__line"><div class="rail__fill"></div><span class="rail__click">CLICK</span></div>
      <div class="step">Visibility</div><div class="step">Relevant visitor</div><div class="step">Conversion</div><div class="step">Inquiry / purchase</div><div class="step">Customer</div>
    </div>
  </div>
</section>

<section class="section on-space" data-space>
  <div class="section__head"><div><p class="t-label t-muted">Solutions</p>${lines(['We fix the leaks', 'in your funnel.'])}</div></div>
  <div class="cards">
    <article class="card" data-card>
      <p class="t-label t-muted">Before the click</p>
      <h3 class="t-h2" style="margin-top:14px"><a href="visibility.html">Visibility</a></h3>
      <ul><li><a href="seo.html">SEO <span>→</span></a></li><li><a href="geo.html">GEO <span>→</span></a></li></ul>
      <div class="card__foot">${btn('visibility.html', 'Improve visibility', 'ghost', 'btn--sm')}<span class="card__mirror">Visibility</span></div>
    </article>
    <article class="card" data-card>
      <p class="t-label t-muted">After the click</p>
      <h3 class="t-h2" style="margin-top:14px"><a href="conversion.html">Conversion</a></h3>
      <ul><li><a href="websites.html">Websites <span>→</span></a></li><li><a href="online-shops.html">Online shops <span>→</span></a></li><li><a href="conversion-optimization.html">Conversion optimization <span>→</span></a></li></ul>
      <div class="card__foot">${btn('conversion.html', 'Improve conversion', 'ghost', 'btn--sm')}<span class="card__mirror">Conversion</span></div>
    </article>
  </div>
</section>

<section class="section">
  <p class="t-label t-muted" style="margin-bottom:30px">Selected cases</p>
  ${featuredCase(PROJECTS[0])}
  <ol class="cases">${PROJECTS.slice(1).map(caseRow).join('')}</ol>
</section>

${clientsMarquee()}

<section class="stance" data-stance aria-label="Our stance">
  <div class="stance__sticky">
    <p class="stance__item" data-mute="3">A redesign isn’t always the answer.</p>
    <p class="stance__item" data-mute="2">More blog posts won’t fix a visibility problem.</p>
    <p class="stance__item" data-mute="3">A brighter button won’t fix a conversion problem.</p>
    <div class="stance__dots"><i></i><i></i><i></i></div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="panel reveal">
    ${lines(['Diagnose first.', 'Then design.'], 't-display', 'style="font-size:clamp(40px,5.4vw,78px)"')}
    <div class="panel__foot">
      <div class="flow"><span><span class="dot"></span>&nbsp; Analysis</span>→<span>Strategy</span>→<span>Prioritization</span>→<span>Implementation</span></div>
      ${btn('strategy-workshops.html', 'Strategy & workshops', 'ghost', 'btn--sm')}
    </div>
  </div>
</section>

${processSection()}

<section class="section">
  <div class="agency">
    <div class="portrait" data-portrait><canvas data-group="1"></canvas></div>
    <div>
      <div class="logo reveal" style="font-size:clamp(60px,7vw,100px)"><span>${BRAND.word.slice(0, -1)}<i>${BRAND.word.slice(-1)}</i></span><small style="font-size:clamp(14px,1.4vw,20px)">${BRAND.tagline}</small></div>
      <p class="lead reveal" style="margin-top:30px;max-width:34ch">A branding &amp; design studio from ${BRAND.city}. We start where businesses lose potential customers — before the click or after it.</p>
      <div class="awards reveal"><b>W</b><span>Web<br>Awards<br>2027</span><hr><span>Studio of<br>the year<br>nominee</span></div>
      <div class="reveal">${btn('agency.html', 'Meet the agency', 'ghost', 'btn--sm')}</div>
    </div>
  </div>
</section>

${losingCta()}`,
});

function featuredCase(p, boxed = false) {
  return `<div class="fcase${boxed ? ' fcase--boxed' : ''}">
    <div>
      <p class="new t-label t-muted"><b>NEW</b> Latest case</p>
      ${lines([p.title], 't-h2', 'style="margin:20px 0"')}
      <p class="case__meta"><strong>${p.name}</strong> &nbsp; ${p.industry} · Product launch</p>
      <div style="margin-top:30px">${btn(`project-${p.slug}.html`, 'View case', 'primary', 'btn--sm')}</div>
    </div>
    <a href="project-${p.slug}.html" class="media" data-tilt style="--tint:${p.tint}" aria-label="${esc(p.name)} case study"><div class="media__word">${p.name}</div><div class="media__device"></div></a>
  </div>`;
}

function clientsMarquee() {
  const a = ['Atlas Bois', 'Lingua Lab', 'ORBIT', 'Lumen', 'Sahara Tech', 'Anfa Café', 'Medina Craft'];
  const b = ['Dar Events', 'Marina Yachts', 'Oasis Clinic', 'Argan & Co', 'Kasbah Hotels', 'Rif Coffee', 'Corniche Fit'];
  const row = (arr, rev) => `<div class="marquee${rev ? ' marquee--rev' : ''}"><ul class="marquee__track">${[...arr, ...arr].map((n, i) => `<li class="logo-tile"${i >= arr.length ? ' aria-hidden="true"' : ''}>${n}</li>`).join('')}</ul></div>`;
  return `<section class="clients on-space" data-space>
    <div class="section__head"><div><p class="t-label t-muted">Clients</p>${lines(['Trusted by teams', 'near and far.'])}</div></div>
    ${row(a)}${row(b, true)}
  </section>`;
}

// ---------- SERVICE PAGES ----------
for (const [key, s] of Object.entries(SERVICES)) {
  add(s.file, {
    title: `${s.title} — ${BRAND.name}`, description: s.lead, page: s.page,
    body: `
${pageHero({ crumb: `<a href="index.html">${BRAND.name}</a> / <a href="${s.parent[0]}">${s.parent[1]}</a> / ${s.title}`, h: s.h, lead: s.lead,
  ctas: [btn('potential-check.html', 'Check your potential', 'primary', 'magnetic'), btn('#system', `The ${s.title.split(' ')[0]} system`, 'secondary', 'btn--diag')], visual: s.visual })}
${statement(...s.statement)}
<section class="section">
  <p class="t-label t-muted" style="margin-bottom:18px">${s.factors.label}</p>
  ${lines(s.factors.h, 't-h2', 'style="margin-bottom:50px"')}
  <div class="factors reveal">${s.factors.items.map(([t, p]) => `<div class="factor"><h3><span class="dot"></span>${t}</h3><p>${p}</p></div>`).join('')}</div>
</section>
<section class="section on-space" id="system" data-space>
  <p class="t-label t-muted" style="margin-bottom:18px">${s.pillars.label}</p>
  ${lines(s.pillars.h, 't-h2', 'style="margin-bottom:50px"')}
  <div class="pillars">${s.pillars.items.map(([tag, name, strong, p], i) => `<div class="pillar reveal" style="--d:${i * 100}"><span class="t-label t-muted" style="font-size:10px">${tag}</span><h3>${name}</h3><strong>${strong}</strong><p>${p}</p><span class="card__mirror">${name}</span></div>`).join('')}</div>
</section>
<section class="section">
  <div class="section__head"><div><p class="t-label t-muted">Possible work</p>${lines([s.work[0]])}</div><p class="lead reveal">${s.work[1]}</p></div>
  <div class="chip-panel reveal"><div class="chips">${s.work[2].map(c => `<span class="chip">${c}</span>`).join('')}</div></div>
</section>
${railSection(...s.rail)}
<section class="section">
  <div class="split">${lines(s.split[0])}<div><p class="reveal">${s.split[1]}</p><p class="reveal"><strong>${s.split[2]}</strong></p></div></div>
</section>
${crosslink(...s.cross)}
${processSection()}
${projectsBlock(s.projects)}
${losingCta(s.cta)}`,
  });
}

// ---------- HUB PAGES (Visibility / Conversion) ----------
for (const [key, hb] of Object.entries(HUBS)) {
  add(hb.file, {
    title: `${hb.title} — ${BRAND.name}`, description: hb.lead, page: key,
    body: `
${pageHero({ crumb: `<a href="index.html">${BRAND.name}</a> / ${hb.crumb}`, h: hb.h, lead: hb.lead,
  ctas: [btn('potential-check.html', 'Check your potential', 'primary', 'magnetic'), btn('#solutions', 'Solutions', 'secondary', 'btn--diag')],
  facts: ['Analysis first', 'Clear priorities', 'Measurable results'] })}
${statement(...hb.statement)}
<section class="section on-space" id="solutions" data-space>
  <div class="section__head"><div><p class="t-label t-muted">${hb.crumb}</p>${lines([`${hb.title} solutions.`])}</div></div>
  <div class="cards" style="--cols:${hb.subs.length}">
    ${hb.subs.map(([href, name, sub, text, chips]) => `<article class="card" data-card>
      <p class="t-label t-muted">${sub}</p>
      <h3 class="t-h2" style="margin-top:14px;font-size:clamp(30px,3.2vw,48px)"><a href="${href}">${name}</a></h3>
      <p style="color:rgb(245 245 242 / .75);margin:18px 0 0">${text}</p>
      <div class="chips" style="margin-top:24px">${chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>
      <div class="card__foot">${btn(href, 'Learn more', 'ghost', 'btn--sm')}<span class="card__mirror">${name}</span></div>
    </article>`).join('')}
  </div>
</section>
${railSection(...hb.rail)}
${processSection()}
${projectsBlock(hb.projects)}
${losingCta()}`,
  });
}

// ---------- STRATEGY & WORKSHOPS ----------
add('strategy-workshops.html', {
  title: `Strategy & workshops — ${BRAND.name}`, description: 'Understand the problem before building the solution: analysis, strategy and workshops.', page: 'strategy',
  body: `
${pageHero({ crumb: `<a href="index.html">${BRAND.name}</a> / Strategy &amp; workshops`, h: ['Diagnose first.', 'Then design.'],
  lead: 'Before anything gets built, we make sure everyone agrees on the real problem — and on the order in which to solve it.',
  ctas: [btn('contact.html?topic=Strategy', 'Book a workshop', 'primary', 'magnetic'), btn('#formats', 'Formats', 'secondary', 'btn--diag')],
  facts: ['Half-day to two days', 'On site or remote', 'Clear results document'] })}
${statement(['The most expensive', 'mistake is solving', 'the wrong problem.'], 'Many projects fail before the first design.', 'Because nobody defined what success means.')}
<section class="section on-space" id="formats" data-space>
  <p class="t-label t-muted" style="margin-bottom:18px">Formats</p>
  ${lines(['Three ways', 'to get clarity.'], 't-h2', 'style="margin-bottom:50px"')}
  <div class="built">
    ${[['01', 'Potential analysis', 'We analyse your website, search demand and competitors and show you where the biggest levers are. Result: a prioritized list.', '1–2 weeks'], ['02', 'Strategy workshop', 'Together with your team we define audience, positioning, goals and priorities. Result: a roadmap everyone agrees on.', '1 day'], ['03', 'Website workshop', 'Structure, content and user journeys for your new website — before design starts. Result: sitemap and wireframes.', '1–2 days']]
      .map(([n, t, p, d], i) => `<div class="built__item reveal" style="--d:${i * 100}"><span>${n} · ${d}</span><h3>${t}</h3><p>${p}</p></div>`).join('')}
  </div>
</section>
${railSection(['From question', 'to roadmap.'], 'Every workshop ends with a clear document: what we learned, what we recommend, and in which order.', ['Questions', 'Data', 'Workshop', 'Priorities', 'Roadmap'], 3)}
<section class="section">
  <div class="split">${lines(['Who should', 'be in the room?'])}<div><p class="reveal">Decision makers, the people who talk to customers every day, and whoever will maintain the website later.</p><p class="reveal"><strong>Small groups work best: three to six people.</strong></p></div></div>
</section>
${crosslink('Not sure what you need?', 'The potential check gives you a first assessment in about two minutes.', 'potential-check.html', 'Start the check')}
${processSection()}
${losingCta()}`,
});

// ---------- PROJECTS INDEX ----------
add('projects.html', {
  title: `Projects — ${BRAND.name}`, description: 'Every project starts with a bottleneck. Here is where it was — and what we changed.', page: 'projects',
  body: `
${pageHero({ crumb: 'Selected work', h: ['Every project starts', 'with a bottleneck.'], lead: 'Here you can see where it was — and what we changed.' })}
<section class="section" style="padding-top:0">
  ${featuredCase(PROJECTS[0], true)}
  <ol class="cases">${PROJECTS.slice(1).map(caseRow).join('')}</ol>
</section>
<section class="section">
  <div class="section__head">${lines(['Different company.', 'Different bottleneck.'], 't-display', 'style="font-size:clamp(40px,5.4vw,78px)"')}</div>
  <div class="page-hero__foot" style="margin-top:0"><p class="lead">Where’s yours?</p><div class="btn-row">${btn('potential-check.html', 'Check your potential', 'primary', 'magnetic')}${btn('contact.html', 'Talk to us directly', 'secondary', 'magnetic')}</div></div>
</section>`,
});

// ---------- PROJECT DETAIL PAGES ----------
PROJECTS.forEach((p, idx) => {
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  add(`project-${p.slug}.html`, {
    title: `${p.name} — Case study — ${BRAND.name}`, description: `${p.title} How we helped ${p.name} (${p.industry}, ${p.city}).`, page: 'projects',
    body: `
<section class="page-hero" data-instant>
  <p class="t-label t-muted page-hero__crumb reveal"><a href="projects.html">Projects</a> / ${p.name}</p>
  <h1 class="t-display lines" data-lines><span class="ln"><span>${p.name}</span></span></h1>
  <p class="lead lead--wide reveal" style="--d:300;margin-top:30px">${p.title}</p>
  <dl class="case-hero__meta reveal" style="--d:450">
    <div><dt>Client</dt><dd>${p.name}</dd></div><div><dt>Industry</dt><dd>${p.industry}</dd></div><div><dt>Location</dt><dd>${p.city}</dd></div><div><dt>Services</dt><dd>${p.services.join(', ')}</dd></div>
  </dl>
  <div class="page-hero__visual reveal" style="--d:550">${browserMock(p.name, p.tint)}</div>
</section>
<section class="section">
  <div class="case-intro"><p class="t-label t-muted">The bottleneck</p><div>${p.intro.map(t => `<p class="reveal">${t}</p>`).join('')}</div></div>
</section>
<section class="section" style="padding-top:0">
  <div class="grid-2">
    <div>${lines(['What happened.'])}</div>
    <ol class="timeline">${p.timeline.map(([t, d]) => `<li><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </div>
</section>
${statement(p.statement)}
<section class="section section--tight">
  <div class="devices reveal">
    <div class="media" data-tilt style="--tint:${p.tint}"><div class="media__word">${p.name}</div><div class="media__browser"></div></div>
    <div class="media" data-tilt style="--tint:${p.tint}"><div class="media__device" style="width:52%"></div></div>
  </div>
</section>
<section class="section on-space" data-space>
  <p class="t-label t-muted" style="margin-bottom:18px">Deliverables</p>
  ${lines(['What we built.'], 't-h2', 'style="margin-bottom:50px"')}
  <div class="built">${p.built.map(([t, d], i) => `<div class="built__item reveal" style="--d:${(i % 3) * 100}"><span>${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</section>
<section class="section on-space" data-space>
  <figure class="quote reveal" style="margin:0 auto"><blockquote>${p.quote[0]}</blockquote><figcaption>${p.quote[1]}</figcaption></figure>
</section>
<section class="section">
  <p class="t-label t-muted" style="margin-bottom:18px">Outcome</p>
  ${lines(['What changed.'], 't-h2', 'style="margin-bottom:50px"')}
  <div class="metrics">${p.metrics.map(([n, suf, pre, t]) => `<div class="metric reveal"><b>${Number.isInteger(n) ? `<span data-count="${n}" data-prefix="${pre}" data-suffix="${suf}">${pre}0${suf}</span>` : `${pre}${n}${suf}`}</b><p>${t}</p></div>`).join('')}</div>
  <p class="t-small t-muted" style="margin-top:18px">Example figures — replace with your real results.</p>
</section>
<section class="section section--tight">
  <dl class="credits reveal">${p.credits.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
</section>
<section class="section section--tight">
  <a class="next-project" href="project-${next.slug}.html"><p class="t-label t-muted">Next project</p><span class="t-display" style="display:block;margin-top:16px">${next.name} →</span></a>
</section>
${losingCta(['Different company.', 'Different bottleneck.'], 'Your project')}`,
  });
});

// ---------- AGENCY ----------
const TEAM = [['Oussama Jdily', 'Founder · Strategy'], ['Yasmine Alaoui', 'Design lead'], ['Mehdi Chraibi', 'Development'], ['Sara Idrissi', 'SEO & content']];
add('agency.html', {
  title: `Agency — ${BRAND.name}`, description: `We are ${BRAND.name}: a branding & design studio from ${BRAND.city}.`, page: 'agency',
  body: `
${pageHero({ crumb: `${BRAND.name} / Agency`, h: [`We are ${BRAND.word}.`], lead: `A branding & design studio from ${BRAND.city}. Small team, clear focus: helping businesses get found and chosen.`,
  ctas: [btn('contact.html', 'Get to know us', 'primary', 'magnetic'), btn('projects.html', 'View projects', 'secondary', 'btn--diag')] })}
${statement(['Not an agency', 'that does everything.'], 'No social media management, no print flyers, no trade-fair booths.', 'Just visibility and conversion — done properly.')}
<section class="clients" style="padding-top:0">
  <div class="section__head"><div><p class="t-label t-muted">Clients</p>${lines(['Who we work with.'])}</div></div>
  <div class="logo-grid">${['Atlas Bois', 'Lingua Lab', 'ORBIT', 'Lumen', 'Dar Events', 'Sahara Tech', 'Anfa Café', 'Medina Craft', 'Oasis Clinic', 'Kasbah Hotels'].map(n => `<div class="logo-tile reveal">${n}</div>`).join('')}</div>
</section>
<section class="crawl" aria-label="A new kind of visibility">
  ${[[-12, 0], [8, 2.3], [-4, 4.6], [16, 1.2], [-20, 5.5]].map(([a, d]) => `<span class="crawl__star" style="--angle:${a}deg;--dl:${d}s"></span>`).join('')}
  <div>${lines(['A new kind', 'of visibility.'], 't-display', 'style="font-size:clamp(40px,6vw,90px)"')}</div>
</section>
<section class="section">
  <div class="section__head"><div><p class="t-label t-muted">Team</p>${lines(['The people behind it.'])}</div></div>
  <div class="team">${TEAM.map(([n, r], i) => `<div class="member reveal" style="--d:${i * 100}"><div class="portrait" data-portrait><canvas data-seed="${i * 7 + 3}"></canvas></div><h3>${n}</h3><p>${r}</p></div>`).join('')}</div>
</section>
<section class="section on-space" data-space>
  <p class="t-label t-muted" style="margin-bottom:18px">Our DNA</p>
  ${lines(['Function and form', 'are not opposites.'], 't-h2', 'style="margin-bottom:50px"')}
  <div class="dna">
    <div class="dna__card reveal"><h3 class="t-h3">Typography</h3><p>Big, clear, confident. Type does the heavy lifting.</p><div class="dna__art dna__art--type">Aa</div></div>
    <div class="dna__card reveal" style="--d:100"><h3 class="t-h3">Animation</h3><p>Motion with a purpose: it guides, it never distracts.</p><div class="dna__art dna__art--anim"><span></span></div></div>
    <div class="dna__card reveal" style="--d:200"><h3 class="t-h3">Green dot</h3><p>The moment a visitor becomes a customer. Everything we do leads there.</p><div class="dna__art dna__art--dot"><span></span></div></div>
  </div>
</section>
${processSection()}
<section class="section">
  <div class="studio">
    <div><p class="t-label t-muted" style="margin-bottom:18px">Studio</p><div class="studio__city reveal">${BRAND.city}.</div></div>
    <dl class="reveal"><dt>Local time</dt><dd data-clock="${BRAND.timezone}">--:--</dd><dt>Address</dt><dd>${BRAND.address.slice(1).join(', ')}</dd><dt>Phone</dt><dd><a href="tel:${BRAND.phoneHref}">${BRAND.phone}</a></dd><dt>Email</dt><dd><a href="mailto:${BRAND.email}">${BRAND.email}</a></dd></dl>
  </div>
</section>
${crosslink('Enough about us.', 'Let’s talk about your business — and where it’s losing potential customers.', 'potential-check.html', 'Start the potential check')}
${losingCta(['Let’s get to', 'know each other.'], 'Next step')}`,
});

// ---------- INSIGHTS ----------
const postCard = a => `<a class="post reveal" href="insight-${a.slug}.html" data-topic="${a.topic}">
  <div class="post__art" style="--tint:${a.tint}"><span>${a.word}</span></div>
  <div class="post__body"><span class="t-label t-muted" style="font-size:11px">${a.topic}</span><h3>${a.title}</h3><p>${a.excerpt}</p><div class="post__meta"><span>${a.date}</span><span>${a.read} read</span></div></div>
</a>`;
add('insights.html', {
  title: `Insights — ${BRAND.name}`, description: 'Knowledge that helps with decisions: SEO, GEO, websites, shops and conversion.', page: 'insights',
  body: `
${pageHero({ crumb: `${BRAND.name} / Insights`, h: ['Knowledge that', 'helps you decide.'], lead: 'Short, honest articles about visibility, conversion and the decisions in between.' })}
<section class="section" style="padding-top:0">
  <div class="filters" data-filters>${['all', 'Visibility', 'Conversion', 'Strategy'].map((f, i) => `<button class="chip${i === 0 ? ' is-on' : ''}" data-filter="${f}">${f === 'all' ? 'All topics' : f}</button>`).join('')}</div>
  <div class="posts">${INSIGHTS.map(postCard).join('')}</div>
</section>
${losingCta()}`,
});
INSIGHTS.forEach(a => {
  const related = INSIGHTS.filter(x => x !== a).slice(0, 3);
  const ids = a.sections.map(([h]) => 's-' + h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  add(`insight-${a.slug}.html`, {
    title: `${a.title} — ${BRAND.name}`, description: a.excerpt, page: 'insights',
    extraChrome: '<div class="read-progress" aria-hidden="true"></div>',
    body: `
<section class="page-hero" data-instant style="padding-bottom:50px">
  <div class="article">
    <p class="t-label t-muted page-hero__crumb reveal"><a href="insights.html">Insights</a> / ${a.topic}</p>
    <h1 class="t-h2 lines" data-lines style="text-transform:none;letter-spacing:-.04em"><span class="ln"><span>${a.title}</span></span></h1>
    <p class="lead lead--wide reveal" style="--d:300;margin-top:26px">${a.excerpt}</p>
    <div class="page-hero__facts t-label t-muted reveal" style="--d:450"><span><span class="dot"></span> ${a.topic}</span><span>· ${a.date}</span><span>· ${a.read} read</span></div>
  </div>
</section>
<section class="section" style="padding-top:0">
  <article class="article">
    <details class="toc"><summary>Contents</summary><ol>${a.sections.map(([h], i) => `<li><a href="#${ids[i]}">${h}</a></li>`).join('')}</ol></details>
    <div class="prose">${a.sections.map(([h, html], i) => `<h2 id="${ids[i]}">${h}</h2>${html}`).join('')}</div>
  </article>
</section>
<section class="section section--tight">
  <div class="author reveal"><div class="author__pic"></div><div><strong>${TEAM[0][0]}</strong><p>${TEAM[0][1]} at ${BRAND.name}. Writes about what makes websites work — and what doesn’t.</p></div></div>
</section>
<section class="section">
  <p class="t-label t-muted" style="margin-bottom:18px">Keep reading</p>
  ${lines(['More articles.'], 't-h2', 'style="margin-bottom:40px"')}
  <div class="posts">${related.map(postCard).join('')}</div>
</section>
${losingCta(['Where does your', 'business stand?'])}`,
  });
});

// ---------- CONTACT ----------
const TOPICS = ['Visibility', 'Website', 'Online shop', 'Conversion', 'Strategy', 'Not sure yet'];
add('contact.html', {
  title: `Contact — ${BRAND.name}`, description: 'Let’s talk about your project. Phone, e-mail or project inquiry.', page: 'contact',
  body: `
${pageHero({ crumb: `${BRAND.name} / Contact`, h: ['Let’s talk about', 'your project.'] })}
<section class="section section--tight" style="padding-top:0">
  <div class="form-wrap">
    <div class="form reveal">
      <form class="form__body" data-contact data-mail="${BRAND.email}" data-endpoint="${BRAND.formEndpoint}" novalidate>
        <p class="t-label t-muted" style="margin-bottom:26px">Project inquiry</p>
        <fieldset><legend>What is it about?</legend><div class="opts">${TOPICS.map(t => `<label class="opt"><input type="checkbox" name="topic" value="${t}"><span>${t}</span></label>`).join('')}</div></fieldset>
        <div class="field"><label for="f-site">Website <small>(optional)</small></label><input class="input" id="f-site" name="site" type="url" placeholder="yourwebsite.ma" autocomplete="url"></div>
        <div class="field"><label for="f-msg">What would you like to change?</label><textarea class="input" id="f-msg" name="message" required></textarea><p class="field__error">Please tell us briefly what it is about.</p></div>
        <div class="field-row">
          <div class="field"><label for="f-name">Name</label><input class="input" id="f-name" name="name" required autocomplete="name"><p class="field__error">Please enter your name.</p></div>
          <div class="field"><label for="f-company">Company <small>(optional)</small></label><input class="input" id="f-company" name="company" autocomplete="organization"></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="f-mail">Email</label><input class="input" id="f-mail" name="email" type="email" required autocomplete="email"><p class="field__error">Please enter a valid e-mail address.</p></div>
          <div class="field"><label for="f-phone">Phone <small>(optional)</small></label><input class="input" id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
        </div>
        <label class="hp" aria-hidden="true">Leave this field empty<input name="website_hp" tabindex="-1" autocomplete="off"></label>
        <label class="check"><input type="checkbox" name="privacy" required> <span>I have read the <a href="privacy.html">privacy notice</a> and agree that my details are processed to handle my inquiry.</span></label>
        <button class="btn btn--primary magnetic" type="submit">Send inquiry ${ARROW}</button>
        <p class="t-small t-muted" style="margin:16px 0 0">We usually reply within one working day.</p>
      </form>
      <div class="form__success" role="status"><span class="dot"></span><h2 class="t-h3">Thank you!</h2><p class="lead" style="margin:16px auto 0">We’ve received your inquiry and will get back to you within one working day.</p></div>
    </div>
    <div class="side-list reveal" style="--d:150">
      <p class="t-label t-muted" style="margin-bottom:26px">Talk to us</p>
      <a class="contact__row" href="tel:${BRAND.phoneHref}"><span class="t-label t-muted">Phone</span><strong>${BRAND.phone} <span>→</span></strong></a>
      <a class="contact__row" href="mailto:${BRAND.email}"><span class="t-label t-muted">Email</span><strong>${BRAND.email} <span>→</span></strong></a>
      <p class="t-label t-muted" style="margin:40px 0 12px">Studio</p>
      <p style="margin:0">${BRAND.address.join('<br>')}</p>
      <p class="t-small t-muted" style="margin-top:16px">Local time: <span data-clock="${BRAND.timezone}">--:--</span></p>
    </div>
  </div>
</section>
${crosslink('Not sure yet what you need?', 'The potential check helps you gauge whether your biggest lever is before or after the click.', 'potential-check.html', 'Start the potential check')}
${statement(['See you soon.'])}`,
});

// ---------- POTENTIAL CHECK ----------
const CHECK = [
  ['problem', 'What describes your situation best?', [['found', 'We’re not found online often enough.'], ['convert', 'We get visitors, but too few inquiries or purchases.'], ['both', 'Both.'], ['unknown', 'We don’t know exactly.']]],
  ['searchable', 'Do people actively search for what you offer?', [['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No, it’s new or niche']]],
  ['offer', 'What do you sell?', [['services', 'Services'], ['products', 'Products'], ['regional', 'Regional offer'], ['specialist', 'Specialist topics'], ['unsure', 'Not sure yet']]],
  ['source', 'Where do most of your visitors come from?', [['organic', 'Google (organic)'], ['ads', 'Google Ads'], ['social', 'Social media'], ['referral', 'Referrals'], ['direct', 'Direct'], ['unclear', 'Unclear']]],
  ['goal', 'What should visitors do on your website?', [['inquiry', 'Send an inquiry'], ['appointment', 'Book an appointment'], ['call', 'Call'], ['buy', 'Buy a product'], ['configure', 'Configure an offer'], ['other', 'Something else']]],
  ['clear', 'Is it clear within seconds what you offer?', [['yes', 'Yes'], ['rather', 'Rather yes'], ['few', 'Rather not'], ['unknown', 'I don’t know']]],
  ['ads', 'Are you currently running ads?', [['yes', 'Google Ads'], ['yes', 'Social ads'], ['no', 'No'], ['unknown', 'I don’t know']]],
];
add('potential-check.html', {
  title: `Potential check — ${BRAND.name}`, description: 'Seven short questions to find out whether your biggest lever is before or after the click.', page: 'check',
  body: `
${pageHero({ crumb: `${BRAND.name} / Potential check`, h: ['Where are your', 'customers slipping away?'],
  lead: 'Seven short questions to gauge whether your biggest lever is before or after the click.',
  ctas: [`<button class="btn btn--primary magnetic" data-check-start>Start the check ${ARROW}</button>`],
  facts: ['7 short questions', 'Instant first assessment', 'No sign-up needed'] })}
<section class="section section--tight" style="padding-top:0">
  <div class="pc form" data-check>
    <div class="pc__progress"><i></i></div>
    <form class="pc__steps">
      ${CHECK.map(([name, q, opts], i) => `<fieldset class="pc__step"><legend class="sr-only">${q}</legend><p class="t-label t-muted">Question ${i + 1}</p><p class="pc__q">${q}</p>
        <div class="pc__opts">${opts.map(([v, l]) => `<label class="opt"><input type="radio" name="${name}" value="${v}"><span>${l}</span></label>`).join('')}</div></fieldset>`).join('')}
      <div class="pc__nav"><button type="button" class="btn btn--ghost btn--sm" data-back>← Back</button><span class="t-label t-muted" data-step-count></span><button type="button" class="btn btn--primary" data-next>Next ${ARROW}</button></div>
    </form>
    <div class="pc__result" aria-live="polite">
      <p class="t-label t-muted">Your first assessment</p>
      <div data-result="before" hidden><p class="pc__q">Your biggest lever is <span style="color:var(--c-green-400)">before the click.</span></p><p class="lead lead--wide">Not enough of the right people find you. Visibility — SEO and GEO — will likely bring the fastest results.</p><div class="btn-row" style="margin-top:30px">${btn('visibility.html', 'Visibility', 'ghost', 'btn--sm')}</div></div>
      <div data-result="after" hidden><p class="pc__q">Your biggest lever is <span style="color:var(--c-green-400)">after the click.</span></p><p class="lead lead--wide">People find you, but too few become customers. Improving your website, shop or conversion path will likely pay off fastest.</p><div class="btn-row" style="margin-top:30px">${btn('conversion.html', 'Conversion', 'ghost', 'btn--sm')}</div></div>
      <div data-result="both" hidden><p class="pc__q">There is potential <span style="color:var(--c-green-400)">on both sides.</span></p><p class="lead lead--wide">Visibility and conversion both hold you back. A short analysis will show which to tackle first.</p><div class="btn-row" style="margin-top:30px">${btn('strategy-workshops.html', 'Strategy & workshops', 'ghost', 'btn--sm')}</div></div>
      <div class="btn-row" style="margin-top:40px"><a class="btn btn--primary" data-result-cta href="contact.html">Discuss my result ${ARROW}</a><button type="button" class="btn btn--secondary" data-restart>Start again</button></div>
    </div>
  </div>
</section>`,
});

// ---------- LEGAL ----------
const legalPage = (file, title, html) => add(file, {
  title: `${title} — ${BRAND.name}`, description: `${title} of ${BRAND.name}, branding & design studio in ${BRAND.city}.`, page: 'legal',
  body: `${pageHero({ crumb: `${BRAND.name} / ${title}`, h: [title + '.'] })}
<section class="section legal-page" style="padding-top:0"><div class="prose">${html}</div></section>`,
});
legalPage('legal-notice.html', 'Legal notice', `
<div class="callout"><strong>Placeholder</strong>Replace the bracketed fields with your official company information (Moroccan identifiers below). Have it checked by a lawyer or accountant.</div>
<h2>Company</h2><p>${BRAND.address.join('<br>')}</p>
<h2>Contact</h2><p>Phone: ${BRAND.phone}<br>Email: ${BRAND.email}</p>
<h2>Legal form &amp; manager</h2><p>[SARL / SARL AU / auto-entrepreneur] — represented by [Manager’s name]</p>
<h2>Registre du Commerce (RC)</h2><p>[RC number], Tribunal de Commerce de Casablanca</p>
<h2>Identifiers</h2><p>ICE: [ICE number]<br>Identifiant Fiscal (IF): [IF number]<br>Taxe professionnelle (Patente): [number]</p>
<h2>Hosting</h2><p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
<h2>Responsible for content</h2><p>[Name, address]</p>`);
legalPage('privacy.html', 'Privacy', `
<div class="callout"><strong>Placeholder</strong>This policy follows Moroccan law n° 09-08 on the protection of personal data. Declare your processing to the CNDP (www.cndp.ma) and have this text checked by a lawyer.</div>
<h2>Controller</h2><p>${BRAND.address.join('<br>')}<br>${BRAND.email}</p>
<h2>Hosting</h2><p>This website is hosted by Vercel Inc. (USA). When you visit it, the server automatically records technical data (IP address, browser, time of access) to deliver the site and keep it secure.</p>
<h2>Contact form &amp; e-mail</h2><p>When you contact us, we process your details to handle your inquiry, in line with law n° 09-08. We delete them once they are no longer needed.</p>
<h2>Fonts</h2><p>All fonts are hosted on our own server. No connection to Google or other font providers is made.</p>
<h2>Local storage</h2><p>We store small preferences (sound on/off, whether the intro was shown) in your browser’s session storage. Nothing is sent to us.</p>
<h2>Your rights</h2><p>You have the right to access, rectification, erasure, restriction of processing, data portability and objection, and the right to lodge a complaint with the CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel).</p>`);

// ---------- 404 ----------
add('404.html', {
  title: `Page not found — ${BRAND.name}`, description: 'This page doesn’t exist (anymore).', page: '404',
  body: `<section class="notfound" data-instant><div>
  <div class="notfound__num reveal">4<i></i>4</div>
  <h1 class="t-h2 lines" data-lines style="margin-top:40px"><span class="ln"><span>Lost in space.</span></span></h1>
  <p class="lead reveal" style="margin:20px auto 34px;--d:300">This page doesn’t exist (anymore). Let’s get you back on track.</p>
  <div class="btn-row reveal" style="justify-content:center;--d:450">${btn('index.html', 'Back to home')}${btn('projects.html', 'View projects', 'secondary', 'btn--diag')}</div>
</div></section>`,
});

/* ============================== SECURITY HEADERS ============================== */
const formOrigin = BRAND.formEndpoint ? new URL(BRAND.formEndpoint).origin : '';
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",          // inline style="" attributes carry animation delays
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self'${formOrigin ? ' ' + formOrigin : ''}`,
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');
const HEADERS = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};
const ASSET_CACHE = 'public, max-age=31536000, immutable';
const HTML_CACHE = 'public, max-age=0, must-revalidate';

/* ============================== WRITE ============================== */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true });
for (const p of pages) {
  const path = join(OUT, p.file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, layout(p));
}
// sitemap
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(p => p.file !== '404.html').map(p => `  <url><loc>${BRAND.url}/${p.file === 'index.html' ? '' : p.file}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${BRAND.url}/sitemap.xml\n`);

// Netlify & Cloudflare Pages
writeFileSync(join(OUT, '_headers'), `/*\n${Object.entries(HEADERS).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n  Cache-Control: ${HTML_CACHE}\n\n/assets/*\n  Cache-Control: ${ASSET_CACHE}\n`);
// Apache / cPanel / most shared hosting
writeFileSync(join(OUT, '.htaccess'), `# Generated by src/build.mjs
Options -Indexes
ErrorDocument 404 /404.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
<IfModule mod_headers.c>
${Object.entries(HEADERS).map(([k, v]) => `  Header always set ${k} "${v}"`).join('\n')}
  <FilesMatch "\\.(css|js|woff2)$">
    Header set Cache-Control "${ASSET_CACHE}"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "${HTML_CACHE}"
  </FilesMatch>
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/xml
</IfModule>
`);
// Vercel
writeFileSync(join(ROOT, 'vercel.json'), JSON.stringify({
  buildCommand: 'npm run build', outputDirectory: 'dist', cleanUrls: false, trailingSlash: false,
  headers: [
    { source: '/(.*)', headers: [...Object.entries(HEADERS).map(([key, value]) => ({ key, value })), { key: 'Cache-Control', value: HTML_CACHE }] },
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: ASSET_CACHE }] },
  ],
}, null, 2) + '\n');
// Netlify build settings (headers come from dist/_headers)
writeFileSync(join(ROOT, 'netlify.toml'), `[build]\n  command = "npm run build"\n  publish = "dist"\n\n[[redirects]]\n  from = "/*"\n  to = "/404.html"\n  status = 404\n`);
console.log(`Built ${pages.length} pages:\n` + pages.map(p => '  ' + p.file).join('\n'));
