import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const ph=await readFile(new URL('../site/public-route-patch/ph-meter/index.html',import.meta.url),'utf8');
const ec=await readFile(new URL('../site/public-route-patch/tds-meter/index.html',import.meta.url),'utf8');

for(const [name,html,key] of [
  ['pH',ph,'thc-ph-measurements-v1'],
  ['EC/TDS',ec,'thc-ec-measurements-v1']
]){
  assert.ok(html.includes("/assets/thc-meter-core-v1.mjs"),name+' must import the shared meter core');
  assert.ok(html.includes(key),name+' must preserve its existing storage key');
  assert.ok(!html.includes('function calibrationAgeDays('),name+' must not keep a duplicate calibration-age helper');
}

assert.ok(ph.includes('calibrationState('),'pH must use shared calibration state');
assert.ok(ph.includes('normalizeMeterRecord('),'pH must use shared meter record normalization');
assert.ok(ph.includes('validatePh('),'pH must use shared pH validation');

assert.ok(ec.includes('calibrationState('),'EC/TDS must use shared calibration state');
assert.ok(ec.includes('normalizeMeterRecord('),'EC/TDS must use shared meter record normalization');
assert.ok(ec.includes('validateEc('),'EC/TDS must use shared EC validation');

// Imported journal ppm fields are derived display estimates, not independent
// measurements. Never trust stale or tampered ppm values from an imported row.
const journal=ec.match(/normalizeRecord:r=>\\{try\\{([\\s\\S]*?)\\}catch\\{return null\\}\\}/)?.[1];
assert.ok(journal,'EC journal normalization contract must be present');
for(const scale of [500,640,650,700]){
 assert.ok(journal.includes('ppm'+scale+':Math.round(ecToDisplayedPpm(v,'+scale+'))'),
  'Imported EC journal must recalculate ppm '+scale+' from validated EC');
 assert.ok(!journal.includes('r?.ppm'+scale),'Imported ppm '+scale+' must not override validated EC');
}

console.log('meter core integration: ok');
