// Pre-deploy checks on dist/: broken internal links and anchors, missing titles/descriptions,
// leftover placeholder data, and inline scripts that the Content-Security-Policy would block.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const pages = readdirSync(DIST).filter(f => f.endsWith('.html'));
const errors = [], warnings = [];
const PLACEHOLDERS = ['example.com', '0000000', 'Example Street', '[Managing director', 'Example figures'];

for (const f of pages) {
  const html = readFileSync(join(DIST, f), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  for (const [, href] of html.matchAll(/<a[^>]+href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const [file, hash] = href.split('#');
    const target = file.split('?')[0];
    if (target && !existsSync(join(DIST, target))) errors.push(`${f}: broken link → ${href}`);
    if (!target && hash && !ids.has(hash)) errors.push(`${f}: missing anchor → #${hash}`);
  }
  for (const [, src] of html.matchAll(/(?:src|href)="(assets\/[^"?]+)/g)) if (!existsSync(join(DIST, src))) errors.push(`${f}: missing asset → ${src}`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) errors.push(`${f}: missing <title>`);
  if (!/name="description" content="[^"]{20,}"/.test(html)) errors.push(`${f}: missing meta description`);
  if (/\son[a-z]+="/i.test(html)) errors.push(`${f}: inline event handler (blocked by CSP)`);
  if (/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/.test(html)) errors.push(`${f}: inline <script> (blocked by CSP)`);
  for (const p of PLACEHOLDERS) if (html.includes(p)) { warnings.push(`${f}: placeholder "${p}"`); }
}

const uniq = a => [...new Set(a)];
const w = uniq(warnings.map(x => x.split(': ')[1]));
console.log(`Checked ${pages.length} pages.`);
if (w.length) console.log(`\n⚠ Placeholder data still in the site (replace before launch):\n  ${w.join('\n  ')}`);
if (errors.length) { console.log(`\n✖ ${errors.length} error(s):\n  ${errors.join('\n  ')}`); process.exit(1); }
console.log('\n✔ No broken links, missing assets, missing meta tags or CSP violations.');
