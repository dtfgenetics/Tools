import assert from 'node:assert/strict';
import {normalizeTelemetryCollection,metricLabel} from '../site/public-route-patch/assets/thc-telemetry-dashboard-v1.mjs';

const packets=normalizeTelemetryCollection([
  {createdAt:'2026-09-28T19:00:00Z',deviceId:'a',zone:'Room 1',temperatureC:25},
  {createdAt:'2026-09-28T19:01:00Z',deviceId:'b',room:'Room 2',rh:58}
],{sourceId:'batch-json'});
assert.equal(packets.length,2);
assert.equal(packets[0].sourceId,'batch-json');
assert.equal(packets[0].deviceId,'a');
assert.equal(packets[1].zone,'Room 2');
assert.equal(packets[1].metrics.humidity,58);

const wrapped=normalizeTelemetryCollection({devices:[
  {observedAt:'2026-09-28T19:02:00Z',deviceId:'c',ppfd:700}
]},{sourceId:'provider-json'});
assert.equal(wrapped.length,1);
assert.equal(wrapped[0].deviceId,'c');
assert.equal(wrapped[0].metrics.ppfd,700);

assert.throws(()=>normalizeTelemetryCollection('bad',{}),/array|collection|object/i);
assert.equal(metricLabel('temperatureC'),'Temperature °C');
assert.equal(metricLabel('rootTemperatureC'),'Root temp °C');
assert.equal(metricLabel('mysteryMetric'),'mystery Metric');

console.log('telemetry dashboard renderer: ok');
