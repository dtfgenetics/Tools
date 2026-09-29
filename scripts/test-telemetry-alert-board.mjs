import assert from 'node:assert/strict';
import {buildAlertBoardModel} from '../site/public-route-patch/assets/thc-telemetry-alert-board-v1.mjs';

const records=[
  {deviceId:'a',zone:'Room 1',observedAt:'2026-09-28T20:00:00Z',metrics:{vpd:1.7,humidity:78}},
  {deviceId:'a',zone:'Room 1',observedAt:'2026-09-28T20:01:00Z',metrics:{vpd:1.8,humidity:79}},
  {deviceId:'b',zone:'Room 2',observedAt:'2026-09-28T20:01:00Z',metrics:{vpd:1.2,humidity:60}}
];
const rules=[
  {id:'vpd-band',metric:'vpd',low:.8,high:1.6,sustainSamples:2,clearMargin:.05},
  {id:'rh-high',metric:'humidity',high:75,sustainSamples:2,clearMargin:2}
];
const model=buildAlertBoardModel(records,rules);
assert.equal(model.summary.active,2);
assert.equal(model.summary.pending,0);
assert.equal(model.items.find(x=>x.ruleId==='vpd-band').state,'active');
assert.equal(model.items.find(x=>x.ruleId==='rh-high').direction,'high');
assert.equal(model.items.every(x=>x.deviceId==='a'),true);

const empty=buildAlertBoardModel([],rules);
assert.equal(empty.summary.unknown,2);
console.log('telemetry alert board: ok');
