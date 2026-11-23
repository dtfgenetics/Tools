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

const restoreHandler=ec.split("file.addEventListener('change',async()=>")[1];
assert.ok(restoreHandler,'EC/TDS JSON restore handler must exist');
assert.ok(!restoreHandler.includes("typeof value==='string'"),'JSON restore must reject string EC values, including numeric-looking strings');
assert.ok(restoreHandler.includes("typeof value!=='number'"),'JSON restore must reject null and nonnumeric EC types');
assert.ok(restoreHandler.includes('Number.isFinite(ec)&&ec>=0&&ec<=20'),'JSON restore must enforce finite EC range');

const sharedObservation=ec.split("button?.addEventListener('click',()=>")[1];
assert.ok(sharedObservation,'EC/TDS shared observation handler must exist');
assert.ok(sharedObservation.includes("ecText===''?NaN:Number(ecText)"),'blank EC must not become zero in shared observations');
assert.ok(sharedObservation.includes('!Number.isFinite(ec)||ec<0||ec>20'),'shared observations must enforce EC range');
assert.ok(sharedObservation.includes("tempText===''?null:Number(tempText)"),'missing temperature must remain null');
assert.ok(sharedObservation.includes('temp<0||temp>60'),'shared observations must reject invalid temperatures');
assert.ok(sharedObservation.includes("ecInput.focus()")&&sharedObservation.includes("tempInput.focus()"),'invalid observations must focus corrective input');

console.log('meter core integration: ok');
