#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const publicRoot = path.resolve('site/public-route-patch');
const lessons = ['chlorosis', 'nutrient-symptoms', 'pest-damage'];
let inspected = 0;
for (const slug of lessons) {
  const file = path.join(publicRoot, 'atlas/leaf-module', slug, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(html, /Visual reference slot|Needed asset/i, `${slug}: unfinished image placeholder`);
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
  const accessibleDiagrams = [...html.matchAll(/<svg\b[^>]*role=["']img["'][^>]*aria-labelledby=["'][^"']+["'][^>]*>/gi)];
  assert.ok(images.length + accessibleDiagrams.length > 0, `${slug}: no accessible instructional visual`);
  for (const image of images) {
    const src = image.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const alt = image.match(/\balt=["']([^"']*)["']/i)?.[1];
    assert.ok(src?.startsWith('/assets/'), `${slug}: asset source must use absolute owned path`);
    assert.ok(alt?.trim(), `${slug}: instructional image missing alt text`);
    assert.ok(!src.includes('..') && !src.includes('?'), `${slug}: unexpected asset traversal/query`);
    assert.ok(fs.statSync(path.join(publicRoot, src.slice(1))).isFile(), `${slug}: asset not found ${src}`);
  }
  inspected++;
}
console.log(`Validated ${inspected} high-priority Atlas lessons: educational visuals, alt text and local asset presence.`);
