#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const verifier = await read('scripts/verify-cultivation-reference-tools-live.mjs');
const manifest = JSON.parse(await read('migration/manifest.json'));
const vpd = await read('site/public-route-patch/vpd-chart/index.html');
const dataUi = await read('site/public-route-patch/assets/thc-cultivation-data-ui-v1.mjs');
const math = await read('site/public-route-patch/assets/thc-cultivation-math-v1.mjs');
const measurement = await read('site/public-route-patch/assets/thc-measurement-core-v1.mjs');

for (const fragment of [
  "from '/assets/thc-cultivation-data-ui-v1.mjs'",
  "from '/assets/thc-cultivation-math-v1.mjs'",
  "from '/assets/thc-measurement-core-v1.mjs'",
  'syncRangesFromNumbers();render();',
  "/assets/thc-cultivation-data-ui-v1.mjs",
  "/assets/thc-measurement-core-v1.mjs",
  'export function relativeHumidityForLeafVpd',
]) {
  assert.ok(verifier.includes(fragment), `missing verifier fragment: ${fragment}`);
}
assert.match(vpd,/syncRangesFromNumbers\(\);render\(\);/);
assert.match(dataUi,/export function collectManualCultivationMeasurement/);
assert.match(math,/export function relativeHumidityForLeafVpd/);
assert.match(measurement,/export function evaluateBandSeries/);
assert.match(measurement,/export function normalizeHeader/);

const routeBlock = verifier.match(/const routes = \[([\s\S]*?)\n\];/)?.[1] || '';
const verifierRoutes = [...routeBlock.matchAll(/path:\s*'([^']+)'/g)].map(match => match[1]).sort();
const canonicalRoutes = [...(manifest.publicRoutes || [])].sort();
assert.deepEqual(
  verifierRoutes,
  canonicalRoutes,
  'live cultivation verifier route inventory must exactly match migration/manifest.json publicRoutes',
);

console.log('live cultivation verifier dependency contract passed for '+canonicalRoutes.length+' canonical routes');
