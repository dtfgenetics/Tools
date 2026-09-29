import assert from 'node:assert/strict';
import {
  normalizeTelemetryPacket,
  telemetryPacketKey,
  appendTelemetryPacket,
  telemetryFreshness,
  connectionState,
  reconnectDelay,
  buildMetricSeries,
  packetToToolFields,
  createRestPollingAdapter,
  createWebSocketAdapter
} from '../site/public-route-patch/assets/thc-live-data-core-v1.mjs';

const packet=normalizeTelemetryPacket(
  {createdAt:'2026-09-28T18:00:00Z',temp:'24.5',rh:'58',vpd:1.2,co2:null},
  {sourceId:'lab-json',deviceId:'sensor-1',zone:'Room A',mapping:{temperatureC:'temp',humidity:'rh',vpd:'vpd',co2:'co2'}}
);
assert.equal(packet.sourceId,'lab-json');
assert.equal(packet.deviceId,'sensor-1');
assert.equal(packet.zone,'Room A');
assert.equal(packet.observedAt,'2026-09-28T18:00:00.000Z');
assert.deepEqual(packet.metrics,{temperatureC:24.5,humidity:58,vpd:1.2});
assert.ok(telemetryPacketKey(packet).includes('sensor-1'));

let records=[];
records=appendTelemetryPacket(records,packet,{limit:2});
records=appendTelemetryPacket(records,packet,{limit:2});
assert.equal(records.length,1);
records=appendTelemetryPacket(records,normalizeTelemetryPacket({observedAt:'2026-09-28T18:01:00Z',temperatureC:25},{sourceId:'lab-json',deviceId:'sensor-1'}),{limit:2});
records=appendTelemetryPacket(records,normalizeTelemetryPacket({observedAt:'2026-09-28T18:02:00Z',temperatureC:26},{sourceId:'lab-json',deviceId:'sensor-1'}),{limit:2});
assert.equal(records.length,2);

assert.equal(telemetryFreshness(packet,{now:'2026-09-28T18:05:00Z',staleAfterMs:10*60*1000}).state,'fresh');
assert.equal(telemetryFreshness(packet,{now:'2026-09-28T19:00:00Z',staleAfterMs:10*60*1000}).state,'stale');
assert.equal(connectionState({connected:true,lastSeenAt:'2026-09-28T18:59:30Z',now:'2026-09-28T19:00:00Z',staleAfterMs:60_000}).state,'live');
assert.equal(connectionState({connected:true,lastSeenAt:'2026-09-28T18:00:00Z',now:'2026-09-28T19:00:00Z',staleAfterMs:60_000}).state,'stale');
assert.equal(connectionState({connected:false,lastSeenAt:null,now:'2026-09-28T19:00:00Z'}).state,'offline');

assert.equal(reconnectDelay(0,{baseMs:1000,maxMs:30_000}),1000);
assert.equal(reconnectDelay(3,{baseMs:1000,maxMs:30_000}),8000);
assert.equal(reconnectDelay(10,{baseMs:1000,maxMs:30_000}),30_000);

const series=buildMetricSeries([
 normalizeTelemetryPacket({observedAt:'2026-09-28T18:02:00Z,',temperatureC:26},{deviceId:'s'}),
 normalizeTelemetryPacket({observedAt:'2026-09-28T18:00:00Z',temperatureC:24,humidity:55},{deviceId:'s'}),
 normalizeTelemetryPacket({observedAt:'2026-09-28T18:01:00Z',temperatureC:25,humidity:null},{deviceId:'s'})
],['temperatureC','humidity']);
assert.deepEqual(series.metricKeys,['temperatureC','humidity']);
assert.equal(series.timestamps.length,2);
assert.deepEqual(series.values.temperatureC,[24,25]);
assert.deepEqual(series.values.humidity,[55,null]);

assert.deepEqual(packetToToolFields(packet,'environment'),{et:24.5,erh:58});
assert.deepEqual(packetToToolFields(packet,'vpd'),{airTemp:24.5,rh:58});
assert.deepEqual(packetToToolFields(packet,'root-zone'),{rat:24.5});
const restPackets=[];
const rest=createRestPollingAdapter({
  url:'https://example.invalid/telemetry',
  fetchFn:async()=>({ok:true,json:async()=>({createdAt:'2026-09-28T19:00:00Z',temperatureC:27,rh:61})}),
  normalizeOptions:{sourceId:'rest',deviceId:'rest-1'},
  onPacket:packet=>restPackets.push(packet)
});
const restPacket=await rest.pollOnce();
assert.equal(restPacket.metrics.temperatureC,27);
assert.equal(restPackets.length,1);
assert.equal(rest.getState().state,'live');

class FakeWebSocket{
  static OPEN=1;
  constructor(url){this.url=url;this.readyState=1;FakeWebSocket.instance=this}
  close(){this.readyState=3;this.onclose?.({code:1000})}
  emit(value){this.onmessage?.({data:JSON.stringify(value)})}
}
const wsPackets=[];
const socket=createWebSocketAdapter({
  url:'wss://example.invalid/telemetry',
  WebSocketImpl:FakeWebSocket,
  normalizeOptions:{sourceId:'ws',deviceId:'ws-1'},
  onPacket:packet=>wsPackets.push(packet),
  reconnect:false
});
socket.connect();
FakeWebSocket.instance.onopen?.({});
FakeWebSocket.instance.emit({createdAt:'2026-09-28T19:01:00Z',temperatureC:28,humidity:62});
assert.equal(wsPackets.length,1);
assert.equal(wsPackets[0].metrics.humidity,62);
assert.equal(socket.getState().state,'live');
socket.close();

assert.throws(()=>createRestPollingAdapter({url:'ftp://example.com'}),/http/i);
assert.throws(()=>createWebSocketAdapter({url:'https://example.com'}),/WebSocket/i);

console.log('live data core: ok');
