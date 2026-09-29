import assert from 'node:assert/strict';
import {parseLiveJsonPacket,applyPacketFields} from '../site/public-route-patch/assets/thc-live-tool-adapter-v1.mjs';

const packet=parseLiveJsonPacket(
  '{"createdAt":"2026-09-28T19:00:00Z","temperatureC":25.5,"humidity":61,"leafTemperatureC":24.5}',
  {sourceId:'manual-json',deviceId:'sensor-1',zone:'Room A'}
);
assert.equal(packet.sourceId,'manual-json');
assert.equal(packet.deviceId,'sensor-1');
assert.equal(packet.zone,'Room A');
assert.equal(packet.metrics.temperatureC,25.5);

const fields=new Map([
  ['temp',{value:'20',events:[]}],
  ['rh',{value:'40',events:[]}],
  ['offset',{value:'0',events:[]}]
]);
const resolve=id=>fields.get(id)||null;
const applied=applyPacketFields(packet,'vpd',resolve);
assert.deepEqual(applied,{temp:25.5,rh:61,offset:-1});
assert.equal(fields.get('temp').value,'25.5');
assert.equal(fields.get('rh').value,'61');
assert.equal(fields.get('offset').value,'-1');
assert.equal(fields.get('temp').events.length,1);

const missing=parseLiveJsonPacket('{"createdAt":"2026-09-28T19:01:00Z","humidity":55}',{});
fields.get('temp').value='33';
const appliedMissing=applyPacketFields(missing,'vpd',resolve);
assert.deepEqual(appliedMissing,{rh:55});
assert.equal(fields.get('temp').value,'33');

assert.throws(()=>parseLiveJsonPacket('{bad json',{}),/JSON/i);
assert.throws(()=>parseLiveJsonPacket('"hello"',{}),/object/i);

console.log('live tool adapter: ok');
