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

// Exercise the EC JSON restore predicate against malformed and boundary records.
const restoreLine=ec.split("file.addEventListener('change',async()=>{")[1]?.split('THC.restoreJson(')[1];
assert.ok(restoreLine,'EC backup restore handler must be present');
const predicateSource=restoreLine.slice(restoreLine.indexOf('r=>{'),restoreLine.indexOf('},2000')+1);
assert.ok(predicateSource.startsWith('r=>{'),'EC backup validator must be an arrow function');
const validateBackup=Function('return ('+predicateSource+')')();
for(const record of [{ec:0},{ec:20,tempC:0},{ec:'1.413',tempC:'60'},{ec:1,tempC:' '}])assert.equal(validateBackup(record),true);
for(const record of [{ec:21},{ec:[]},{ec:false},{ec:''},{ec:1,tempC:[]},{ec:1,tempC:false},{ec:1,tempC:61},{ec:1,tempC:{}}])assert.equal(validateBackup(record),false);

// All EC saving surfaces must reject invalid EC/temperature, not just JSON restore.
const growlens=ec.split("document.getElementById('saveEcGrowLens').onclick=()=>{")[1]?.split("const result=THC.growlens.addDiaryEntry")[0];
assert.ok(growlens?.includes('ec>20')&&growlens.includes('Number(temp)>60'),'GrowLens must reject out-of-range EC and temperature');
const observation=ec.split("button?.addEventListener('click',()=>{")[1]?.split('collectManualCultivationMeasurement(')[0];
assert.ok(observation?.includes('ec>20')&&observation.includes('tempRaw')&&observation.includes('Number(tempRaw)>60'),'Observation save must validate EC and optional temperature');
assert.ok(ec.includes("const temp=tempRaw===''?null:Number(tempRaw)"),'Missing temperature must remain unknown rather than zero');

// Empty conductivity must never be coerced to a real 0 mS/cm measurement.
const growlensEcParser=ec.split('const ecMs=()=>{')[1]?.split('};')[0];
assert.ok(growlensEcParser?.includes("if(input==='')return NaN"),'GrowLens must reject empty EC');
const observationEcParser=ec.split("button?.addEventListener('click',()=>{")[1]?.split('collectManualCultivationMeasurement(')[0];
assert.ok(observationEcParser?.includes("if(input===''){reportInvalid('ec'"),'Observation save must reject empty EC with user feedback');
assert.ok(observationEcParser?.includes("status.setAttribute('role','alert')"),'Invalid observation must be announced accessibly');
assert.ok(observationEcParser?.includes("document.getElementById(field)?.focus()"),'Invalid observation must focus the offending field');
assert.ok(observationEcParser?.includes("reportInvalid('ecSampleTemp'"),'Invalid temperature must explain how to correct it');

const journal=ec.split('normalizeRecord:r=>{try{')[1]?.split('catch{return null}')[0];
assert.ok(journal,'EC journal normalization contract must be present');
for(const scale of [500,640,650,700]){
 assert.ok(journal.includes('ppm'+scale+':Math.round(ecToDisplayedPpm(v,'+scale+'))'),'Imported ppm '+scale+' must derive from validated EC');
 assert.ok(!journal.includes('r?.ppm'+scale),'Imported ppm '+scale+' must not override validated EC');
}

assert.ok(ec.includes("temp=document.getElementById('ecSampleTemp').value.trim()"),'GrowLens optional temperature must trim blank input');
assert.ok(ec.includes("const tempRaw=(document.getElementById('ecSampleTemp')?.value??'').trim()"),'Observation optional temperature must trim blank input');
assert.ok(ec.includes("(typeof t==='string'&&t.trim()==='')"),'JSON restore must treat whitespace-only optional temperature as missing');

const backupHandler=ec.split("document.getElementById('backupEcJson').onclick=()=>{")[1]?.split("document.getElementById('restoreEcJson')")[0];
assert.ok(backupHandler?.includes('Array.isArray(records)'),'EC backup must reject malformed non-array journal payload');
assert.ok(backupHandler?.includes("status.setAttribute('role','alert')"),'Malformed backup journal must announce an accessible error');
assert.ok(backupHandler?.includes('THC.backupJson('),'Valid EC journal must remain exportable');

console.log('meter core integration: ok');
