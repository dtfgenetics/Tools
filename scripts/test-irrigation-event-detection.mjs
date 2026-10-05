import assert from 'node:assert/strict';
import {detectIrrigationCandidates,normalizeIrrigationSample} from '../site/public-route-patch/assets/thc-irrigation-event-detection-v1.mjs';
assert.equal(normalizeIrrigationSample({observedAt:'bad',vwc:40}),null);
assert.equal(normalizeIrrigationSample({observedAt:'2026-10-05T10:00:00Z'}),null);
const found=detectIrrigationCandidates([
 {observedAt:'2026-10-05T10:00:00Z',deviceId:'A',metrics:{vwc:42}},
 {observedAt:'2026-10-05T10:05:00Z',deviceId:'A',metrics:{vwc:42.8}},
 {observedAt:'2026-10-05T10:10:00Z',deviceId:'A',metrics:{vwc:47}},
 {observedAt:'2026-10-05T10:40:00Z',deviceId:'B',metrics:{vwc:35}},
 {observedAt:'2026-10-05T10:45:00Z',deviceId:'B',metrics:{vwc:39}}
],{minRise:3,maxGapMinutes:15});
assert.equal(found.length,2);
assert.ok(Math.abs(found[0].rise-4.2)<1e-9);
assert.equal(found[1].rise,4);
const merged=detectIrrigationCandidates([
 {observedAt:'2026-10-05T10:00:00Z',deviceId:'A',metrics:{vwc:40}},
 {observedAt:'2026-10-05T10:05:00Z',deviceId:'A',metrics:{vwc:44}},
 {observedAt:'2026-10-05T10:10:00Z',deviceId:'A',metrics:{vwc:48}}
],{minRise:3,maxGapMinutes:10,mergeWindowMinutes:10});
assert.equal(merged.length,1);assert.equal(merged[0].rise,8);
assert.equal(detectIrrigationCandidates([{observedAt:'2026-10-05T10:00:00Z',deviceId:'A',metrics:{vwc:40}},{observedAt:'2026-10-05T11:00:00Z',deviceId:'A',metrics:{vwc:50}}],{minRise:3,maxGapMinutes:30}).length,0);
console.log('irrigation event detection: ok');
