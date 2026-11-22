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
for(const record of [{ec:0},{ec:20,tempC:0},{ec:'1.413',tempC:'60'}])assert.equal(validateBackup(record),true);
for(const record of [{ec:21},{ec:[]},{ec:false},{ec:''},{ec:1,tempC:[]},{ec:1,tempC:false},{ec:1,tempC:61},{ec:1,tempC:' '},{ec:1,tempC:{}}])assert.equal(validateBackup(record),false);

// All EC saving surfaces must reject invalid EC/temperature, not just JSON restore.
const growlens=ec.split("document.getElementById('saveEcGrowLens').onclick=()=>{")[1]?.split("const result=THC.growlens.addDiaryEntry")[0];
assert.ok(growlens?.includes('ec>20')&&growlens.includes('Number(temp)>60'),'GrowLens must reject out-of-range EC and temperature');
const observation=ec.split("button?.addEventListener('click',()=>{")[1]?.split('collectManualCultivationMeasurement(')[0];
assert.ok(observation?.includes('ec>20')&&observation.includes('tempRaw')&&observation.includes('Number(tempRaw)>60'),'Observation save must validate EC and optional temperature');
assert.ok(ec.includes("const temp=tempRaw===''?null:Number(tempRaw)"),'Missing temperature must remain unknown rather than zero');

console.log('meter core integration: ok');
