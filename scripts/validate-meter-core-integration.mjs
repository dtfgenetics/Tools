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

console.log('meter core integration: ok');

// Cross-save consumers must not bypass the journal's sample-temperature bounds.
// This guards against publishing invalid sensor metadata into GrowLens or the shared data bridge.
assert.match(ph,/sampleTemp!==''&&\(!Number\.isFinite\(Number\(sampleTemp\)\)\|\|Number\(sampleTemp\)<0\|\|Number\(sampleTemp\)>60\)/,
  'GrowLens pH save must reject nonfinite or out-of-range sample temperature');
assert.match(ph,/tempRaw!==''&&\(!Number\.isFinite\(temp\)\|\|temp<0\|\|temp>60\)/,
  'Shared pH measurement bridge must reject nonfinite or out-of-range sample temperature');
for(const [raw,valid] of [['',true],['0',true],['60',true],['-1',false],['61',false],['NaN',false],['Infinity',false]]){
 const rejected=raw!==''&&(!Number.isFinite(Number(raw))||Number(raw)<0||Number(raw)>60);
 assert.equal(!rejected,valid,'Sample temperature acceptance mismatch: '+raw);
}
console.log('pH cross-save sample-temperature bounds: ok');

 // JSON restore must not reintroduce out-of-range temperature metadata.
const restorePredicate=ph.match(/THC\.restoreJson\(file\.files\?\.\[0\],'thc-ph-measurements',1,(r=>[\s\S]*?),2000\)/)?.[1];
assert.ok(restorePredicate,'pH restore must retain its validated record predicate');
const isValidRestore=Function('return ('+restorePredicate+')')();
for(const [tempC,valid] of [[undefined,true],[null,true],['',true],['0',true],['60',true],[-1,false],[61,false],['Infinity',false],['NaN',false]]){
 assert.equal(Boolean(isValidRestore({ph:6.4,tempC})),valid,'pH backup restore temperature mismatch: '+String(tempC));
}
assert.equal(Boolean(isValidRestore({ph:15,tempC:25})),false,'pH backup restore must reject invalid pH');
console.log('pH backup restore temperature bounds: ok');
