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

const backupHandler=ec.split("document.getElementById('backupEcJson').onclick=()=>")[1]?.split("document.getElementById('restoreEcJson')")[0];
assert.ok(backupHandler,'EC/TDS backup handler must exist');
assert.ok(backupHandler.includes('Array.isArray(records)'),'EC/TDS backup must reject non-array journals');
assert.ok(backupHandler.includes('records.some(r=>'),'EC/TDS backup must validate each journal record');
assert.ok(backupHandler.includes('Number.isFinite(r.ec)'),'EC/TDS backup must reject non-finite EC');
assert.ok(backupHandler.includes('r.ec<0||r.ec>20'),'EC/TDS backup must reject out-of-range EC');
assert.ok(backupHandler.includes("THC.backupJson("),'valid EC/TDS journals must remain exportable');

console.log('meter core integration: ok');
