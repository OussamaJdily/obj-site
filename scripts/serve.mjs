// Local preview of dist/ with the same headers the live host sends (from dist/_headers).
// Usage: npm start  ->  http://localhost:4173
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = +(process.env.PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

// parse _headers: "/path/*" blocks followed by indented "Key: value" lines
const rules = [];
for (const line of readFileSync(join(DIST, '_headers'), 'utf8').split('\n')) {
  if (!line.trim()) continue;
  if (!line.startsWith(' ')) rules.push({ prefix: line.trim().replace(/\*$/, ''), headers: {} });
  else { const i = line.indexOf(':'); rules.at(-1).headers[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
}

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  let file = normalize(join(DIST, path));
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  let status = 200;
  if (!existsSync(file) || statSync(file).isDirectory()) { file = join(DIST, '404.html'); status = 404; }
  for (const r of rules) if (path.startsWith(r.prefix)) for (const [k, v] of Object.entries(r.headers)) res.setHeader(k, v);
  res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
  res.writeHead(status).end(readFileSync(file));
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
