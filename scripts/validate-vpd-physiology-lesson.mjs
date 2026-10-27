import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../site/public-route-patch/vpd-chart/index.html', import.meta.url), 'utf8');
for (const text of [
  'id="vpd-physiology"',
  'Stomata and transpiration',
  'Leaf temperature is a measurement',
  'How uncertainty changes the answer',
  'VPD describes a vapor-pressure gradient',
  'vpdStomaTitle',
  'vpdStomaDescription',
  'CO₂ in',
  'H₂O out',
]) {
  assert.ok(html.includes(text), 'VPD educational content missing: ' + text);
}
assert.match(html, /<svg[^>]+role="img"[^>]*><title id="vpdStomaTitle">/);
assert.match(html, /<desc id="vpdStomaDescription">/);
assert.equal((html.match(/id="vpd-physiology"/g) || []).length, 1);
console.log('VPD physiology and uncertainty lesson contract passed.');
