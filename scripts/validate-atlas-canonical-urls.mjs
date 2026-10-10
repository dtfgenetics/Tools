#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('site/public-route-patch/atlas');
const failures = [];
let pages = 0;

function attributes(tag) {
  const result = new Map();
  const matcher = /(?:^|\s)([a-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const match of tag.matchAll(matcher)) {
    const key = match[1].toLowerCase();
    if (result.has(key)) failures.push(`duplicate HTML attribute ${key} in ${tag.slice(0, 80)}`);
    result.set(key, match[2] ?? match[3] ?? match[4]);
  }
  return result;
}

function expectedUrl(relative) {
  const normalized = relative.split(path.sep).join('/');
  const route = normalized === 'index.html'
    ? '/atlas/'
    : normalized.endsWith('/index.html')
      ? `/atlas/${normalized.slice(0, -'index.html'.length)}`
      : `/atlas/${normalized}`;
  return `https://dtfseeds.com${route}`;
}

function checkPage(file) {
  pages++;
  const relative = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const expected = expectedUrl(relative);
  const seen = new Map();
  for (const match of html.matchAll(/<(link|meta)\b[^>]*>/gi)) {
    const kind = match[1].toLowerCase();
    const attr = attributes(match[0]);
    const rel = (attr.get('rel') ?? '').toLowerCase().split(/\s+/);
    const label = kind === 'link' && rel.includes('canonical')
      ? 'canonical'
      : kind === 'meta' && (attr.get('property') ?? '').toLowerCase() === 'og:url'
        ? 'og:url' : null;
    if (!label) continue;
    seen.set(label, (seen.get(label) ?? 0) + 1);
    const value = attr.get(label === 'canonical' ? 'href' : 'content');
    if (!value) { failures.push(`${relative}: missing ${label} URL attribute`); continue; }
    let url;
    try { url = new URL(value); }
    catch { failures.push(`${relative}: unparsable ${label} URL: ${value}`); continue; }
    if (url.href !== expected || value !== expected) {
      failures.push(`${relative}: ${label} URL ${value} does not match expected ${expected}`);
    }
  }
  for (const [label, count] of seen) {
    if (count > 1) failures.push(`${relative}: duplicate ${label} tags (${count})`);
  }
  // Legacy pages may have canonical-only or no metadata; validate tags when present.
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile() && entry.name.endsWith('.html')) checkPage(file);
  }
}

if (!fs.existsSync(root)) {
  console.error(`Atlas route directory not found: ${root}`);
  process.exit(1);
}
walk(root);
if (!pages) failures.push('No Atlas HTML pages were checked');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Validated canonical and Open Graph URLs across ${pages} Atlas HTML pages.`);
