import assert from 'node:assert/strict';
import {
  calibrationState,
  normalizeMeterRecord,
  validatePh,
  validateEc,
  measurementSource
} from '../site/public-route-patch/assets/thc-meter-core-v1.mjs';

const now=new Date('2026-09-28T18:00:00Z');

assert.deepEqual(calibrationState('',{now}),{status:'unknown',ageDays:null});
assert.deepEqual(calibrationState('bad',{now}),{status:'unknown',ageDays:null});
assert.deepEqual(calibrationState('2026-09-20',{now}),{status:'recorded',ageDays:8});
assert.deepEqual(calibrationState('2026-10-01',{now}),{status:'future',ageDays:-3});

assert.equal(validatePh(0),0);
assert.equal(validatePh(14),14);
assert.throws(()=>validatePh(-0.01),/pH/i);
assert.throws(()=>validatePh(14.01),/pH/i);

assert.equal(validateEc(0),0);
assert.equal(validateEc(20),20);
assert.throws(()=>validateEc(-0.01),/EC/i);
assert.throws(()=>validateEc(20.01),/EC/i);

assert.deepEqual(normalizeMeterRecord({
  meter:'  BlueLab A ',
  calibration:'2026-09-20',
  calibrationRefs:' pH 4 + 7 ',
  tempC:'23.5',
  notes:'  test '
}),{
  meter:'BlueLab A',
  calibration:'2026-09-20',
  calibrationRefs:'pH 4 + 7',
  tempC:23.5,
  notes:'test'
});

const fresh=measurementSource({
  method:'probe',
  sensorModel:'A1',
  observedAt:'2026-09-28T17:55:00Z',
  calibrationDate:'2026-09-20',
  unit:'mS/cm'
},{now,staleAfterMs:10*60*1000});
assert.equal(fresh.freshness.label,'fresh');
assert.equal(fresh.calibration.status,'recorded');
assert.equal(fresh.sensorId,'A1');

const stale=measurementSource({
  method:'probe',
  observedAt:'2026-09-28T17:00:00Z'
},{now,staleAfterMs:10*60*1000});
assert.equal(stale.freshness.label,'stale');

console.log('meter core: ok');
