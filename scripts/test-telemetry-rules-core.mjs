import assert from 'node:assert/strict';
import {
  normalizeTelemetryRule,
  evaluateTelemetryRule,
  evaluateTelemetryRules,
  calibrationHealth,
  normalizeDeviceHealth
} from '../site/public-route-patch/assets/thc-telemetry-rules-core-v1.mjs';

const rule=normalizeTelemetryRule({id:'vpd-high',metric:'vpd',high:1.5,sustainSamples:3,clearMargin:0.1});
assert.deepEqual(rule,{id:'vpd-high',metric:'vpd',low:null,high:1.5,sustainSamples:3,clearMargin:0.1,enabled:true,deviceId:'',zone:''});

const packet=(at,vpd,deviceId='a',zone='Room 1')=>({observedAt:at,deviceId,zone,metrics:{vpd}});
let records=[
 packet('2026-09-28T20:00:00Z',1.6),
 packet('2026-09-28T20:01:00Z',1.7)
];
let result=evaluateTelemetryRule(records,rule);
assert.equal(result.state,'pending');
assert.equal(result.direction,'high');
assert.equal(result.count,2);

records.push(packet('2026-09-28T20:02:00Z',1.8));
result=evaluateTelemetryRule(records,rule);
assert.equal(result.state,'active');
assert.equal(result.count,3);

const held=evaluateTelemetryRule([...records,packet('2026-09-28T20:03:00Z',1.45)],rule,{previousState:result});
assert.equal(held.state,'active');
assert.equal(held.direction,'high');

const cleared=evaluateTelemetryRule([...records,packet('2026-09-28T20:03:00Z',1.39)],rule,{previousState:result});
assert.equal(cleared.state,'normal');

const alternating=evaluateTelemetryRule([
 packet('2026-09-28T20:00:00Z',1.6),
 packet('2026-09-28T20:01:00Z',1.2),
 packet('2026-09-28T20:02:00Z',1.7),
 packet('2026-09-28T20:03:00Z',1.8)
],rule);
assert.equal(alternating.state,'pending');
assert.equal(alternating.count,2);

const invalidIgnored=evaluateTelemetryRule([
 packet('2026-09-28T20:00:00Z',1.6),
 packet('bad',9.9),
 packet('2026-09-28T20:01:00Z',1.7),
 packet('2026-09-28T20:02:00Z',1.8)
],rule);
assert.equal(invalidIgnored.state,'active');

const filtered=evaluateTelemetryRule([
 packet('2026-09-28T20:00:00Z',2,'b','Room 2'),
 packet('2026-09-28T20:01:00Z',1.6,'a','Room 1')
],normalizeTelemetryRule({...rule,deviceId:'a'}));
assert.equal(filtered.count,1);

const rules=evaluateTelemetryRules(records,[rule,normalizeTelemetryRule({id:'rh-low',metric:'humidity',low:40})]);
assert.equal(rules.length,2);
assert.equal(rules.find(x=>x.ruleId==='rh-low').state,'unknown');

assert.deepEqual(calibrationHealth({lastCalibrationAt:null,now:'2026-09-28T20:00:00Z',maxAgeDays:30}),{state:'unknown',ageDays:null,maxAgeDays:30});
assert.equal(calibrationHealth({lastCalibrationAt:'2026-09-20T20:00:00Z',now:'2026-09-28T20:00:00Z',maxAgeDays:30}).state,'fresh');
assert.equal(calibrationHealth({lastCalibrationAt:'2026-08-30T20:00:00Z',now:'2026-09-28T20:00:00Z',maxAgeDays:30}).state,'due');
assert.equal(calibrationHealth({lastCalibrationAt:'2026-08-20T20:00:00Z',now:'2026-09-28T20:00:00Z',maxAgeDays:30}).state,'expired');

const health=normalizeDeviceHealth({
  id:12,name:'Pulse pH',zone:'Flower A',
  thresholds:[{metric:'ph',low:5.6,high:6.3,delayMinutes:5,enabled:true}],
  calibrations:{ph4:'2026-09-20T00:00:00Z',ph7:null,ec:null}
});
assert.equal(health.id,'12');
assert.equal(health.thresholds[0].metric,'ph');
assert.equal(health.calibrations.ph4,'2026-09-20T00:00:00.000Z');
assert.equal(health.calibrations.ph7,null);

console.log('telemetry rules core: ok');
