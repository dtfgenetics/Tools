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

const richPacket=normalizeTelemetryPacket({
  observedAt:'2026-09-28T19:10:00Z',
  temperatureC:25,
  humidity:60,
  leafTemperatureC:24,
  rootTemperatureC:22,
  solutionTemperatureC:21,
  ppfd:720,
  ec:2.1,
  ph:5.8,
  vwc:42
},{deviceId:'bridge-1'});
assert.deepEqual(packetToToolFields(richPacket,'environment'),{et:25,erh:60,leaf:24,root:22,ppfd:720});
assert.deepEqual(packetToToolFields(richPacket,'vpd'),{temp:25,rh:60,offset:-1});
assert.deepEqual(packetToToolFields(richPacket,'root-zone'),{rzt:22,rat:25,solutionT:21,measuredRootEc:2.1});
assert.deepEqual(packetToToolFields(richPacket,'dryback'),{rootEc:2.1,current:42});
assert.deepEqual(packetToToolFields(richPacket,'ph'),{ph:5.8});
assert.deepEqual(packetToToolFields(richPacket,'tds'),{ec:2.1});
assert.deepEqual(packetToToolFields(richPacket,'ppfd'),{ppfd:720});

const nestedPacket=normalizeTelemetryPacket({
  createdAt:'2026-09-28T19:15:00Z',
  temperature:{current:26},
  humidity:{current:63},
  vpd:{current:1.18},
  co2:{current:950}
},{sourceId:'nested-api',deviceId:'room-1'});
assert.deepEqual(nestedPacket.metrics,{temperatureC:26,humidity:63,vpd:1.18,co2:950});

const pulsePacket=normalizeTelemetryPacket({
  name:'Pulse Pro',
  dataPointDto:{
    sensorId:123,
    createdAt:'2026-09-28T19:20:00Z',
    dataPointValues:[
      {paramName:'Temperature',measuringUnit:'C',paramValue:25.5},
      {paramName:'Relative Humidity',measuringUnit:'%',paramValue:59},
      {paramName:'VPD',measuringUnit:'kPa',paramValue:1.3},
      {paramName:'CO2',measuringUnit:'ppm',paramValue:null}
    ]
  }
},{sourceId:'pulse-api'});
assert.equal(pulsePacket.deviceId,'123');
assert.equal(pulsePacket.observedAt,'2026-09-28T19:20:00.000Z');
assert.deepEqual(pulsePacket.metrics,{temperatureC:25.5,humidity:59,vpd:1.3});
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

let forcedMethod='';
const readOnlyRest=createRestPollingAdapter({
  url:'https://example.invalid/read-only',
  requestInit:{method:'POST'},
  fetchFn:async(_url,init)=>{forcedMethod=init.method;return{ok:true,json:async()=>({createdAt:'2026-09-28T19:00:00Z',temperatureC:27})}}
});
await readOnlyRest.pollOnce();
assert.equal(forcedMethod,'GET');


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
