import assert from 'node:assert/strict';
import {
  normalizeHeader,
  calibrationAgeDays,
  readingFreshness,
  interpolateCalibration,
  normalizeMeasurementSource,
  evaluateBandSeries
} from '../site/public-route-patch/assets/thc-measurement-core-v1.mjs';

assert.equal(normalizeHeader(' Leaf Temp (°C) '),'leaf_temp_c');
assert.equal(calibrationAgeDays('2026-09-20',new Date('2026-09-28T12:00:00Z')),8);
assert.equal(calibrationAgeDays('bad-date'),null);

assert.deepEqual(readingFreshness('2026-09-28T17:55:00Z',{now:new Date('2026-09-28T18:00:00Z'),staleAfterMs:10*60*1000}).label,'fresh');
assert.deepEqual(readingFreshness('2026-09-28T17:30:00Z',{now:new Date('2026-09-28T18:00:00Z'),staleAfterMs:10*60*1000}).label,'stale');

assert.equal(interpolateCalibration([{pct:0,ppfd:0},{pct:50,ppfd:500},{pct:100,ppfd:900}],75),700);
assert.equal(interpolateCalibration([{pct:20,ppfd:200},{pct:80,ppfd:800}],10),null);

assert.deepEqual(normalizeMeasurementSource({method:'Quantum',sensorModel:' MQ-500 ',unit:'µmol'}),{
  sourceType:'quantum',sensorId:'MQ-500',method:'Quantum',unit:'µmol',observedAt:'',calibrationDate:'',location:'',notes:''
});

const band=evaluateBandSeries([1.0,1.5,1.7,1.8,1.9,1.55,1.45],{low:.8,high:1.6,sustainSamples:3,clearMargin:.05});
assert.equal(band.episodes,1);
assert.equal(band.activeState,'normal');
assert.equal(Math.round(band.inBandPercent),57);

const noFlap=evaluateBandSeries([1.61,1.59,1.62,1.58,1.61],{low:.8,high:1.6,sustainSamples:2,clearMargin:.05});
assert.equal(noFlap.episodes,0);

console.log('measurement core: ok');
