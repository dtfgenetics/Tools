import assert from 'node:assert/strict';
import {
  latestDevicePackets,
  telemetryHealthSummary,
  zoneTelemetrySummary,
  telemetryMetricCoverage,
  telemetryTableModel
} from '../site/public-route-patch/assets/thc-telemetry-dashboard-core-v1.mjs';

const records=[
  {sourceId:'rest',deviceId:'a',zone:'Room 1',observedAt:'2026-09-28T19:00:00Z',metrics:{temperatureC:25,humidity:60}},
  {sourceId:'rest',deviceId:'a',zone:'Room 1',observedAt:'2026-09-28T19:05:00Z',metrics:{temperatureC:26,humidity:null,vpd:1.2}},
  {sourceId:'ws',deviceId:'b',zone:'Room 2',observedAt:'2026-09-28T18:00:00Z',metrics:{temperatureC:24,ec:2.1}},
  {sourceId:'ws',deviceId:'c',zone:'',observedAt:'bad',metrics:{temperatureC:99}},
  {sourceId:'ws',deviceId:'c',zone:'',observedAt:'2026-09-28T19:09:00Z',metrics:{temperatureC:23}}
];

const latest=latestDevicePackets(records,{now:'2026-09-28T19:10:00Z',staleAfterMs:10*60*1000});
assert.equal(latest.length,3);
assert.equal(latest.find(x=>x.deviceId==='a').packet.metrics.temperatureC,26);
assert.equal(latest.find(x=>x.deviceId==='c').packet.metrics.temperatureC,23);
assert.equal(latest.find(x=>x.deviceId==='b').state,'stale');

const health=telemetryHealthSummary(records,{now:'2026-09-28T19:10:00Z',staleAfterMs:10*60*1000});
assert.deepEqual(health,{devices:3,fresh:2,stale:1,unknown:0,zones:3});

const zones=zoneTelemetrySummary(records,{now:'2026-09-28T19:10:00Z',staleAfterMs:10*60*1000});
assert.deepEqual(zones.map(x=>[x.zone,x.devices,x.fresh,x.stale]),[
  ['Room 1',1,1,0],
  ['Room 2',1,0,1],
  ['Unspecified',1,1,0]
]);

assert.deepEqual(telemetryMetricCoverage(records),[
  {metric:'ec',devices:1},
  {metric:'humidity',devices:1},
  {metric:'temperatureC',devices:3},
  {metric:'vpd',devices:1}
]);

const table=telemetryTableModel(records,{now:'2026-09-28T19:10:00Z',staleAfterMs:10*60*1000,metricKeys:['temperatureC','humidity','vpd','ec']});
assert.deepEqual(table.columns,['deviceId','sourceId','zone','state','observedAt','temperatureC','humidity','vpd','ec']);
assert.equal(table.rows.length,3);
assert.equal(table.rows.find(x=>x.deviceId==='a').humidity,null);
assert.equal(table.rows.find(x=>x.deviceId==='b').ec,2.1);

console.log('telemetry dashboard core: ok');
