#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('site/public-route-patch/atlas');
const failures = [];
let pages = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    pages++;
    const html = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file);
    for (const [label, pattern] of [
      ['canonical', /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/gi],
      ['og:url', /<meta\b[^>]*\bproperty\s*=\s*["']og:url["'][^>]*>/gi],
    ]) {
      const tags = [...html.matchAll(pattern)];
      if (tags.length > 1) failures.push(`${relative}: duplicate ${label} tags (${tags.length})`);
      for (const tag of tags) {
        const attr = tag[0].match(/\b(?:href|content)\s*=\s*["']([^"']+)["']/i);
        const value = attr?.[1];
        if (!value || !/^https:\/\/dtfseeds\.com\//.test(value)) failures.push(`${relative}: invalid ${label} URL: ${value ?? '<missing>'}`);
        else {
          try { new URL(value); } catch { failures.push(`${relative}: unparsable ${label} URL`); }
        }
      }
    }
  }
}

if (!fs.existsSync(root)) { console.error(`Atlas route directory not found: ${root}`); process.exit(1); }
walk(root);
if (!pages) failures.push('No Atlas HTML pages were checked');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Validated canonical and Open Graph URLs across ${pages} Atlas HTML pages.`);
