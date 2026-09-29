import assert from 'node:assert/strict';
import {createTelemetryGateway} from '../server/telemetry-gateway-v1.mjs';

const provider={
  id:'pulse',
  label:'Pulse Grow',
  configured:true,
  async listDevices(){return[{id:'12',name:'Room sensor',zone:'Flower A'}]},
  async getRecent(id){return{sourceId:'pulse',deviceId:id,zone:'Flower A',observedAt:'2026-09-28T20:00:00.000Z',receivedAt:'2026-09-28T20:00:01.000Z',metrics:{temperatureC:25}}}
};
const handler=createTelemetryGateway({providers:[provider]});

let response=await handler(new Request('https://dtfseeds.com/api/telemetry/providers'));
assert.equal(response.status,200);
assert.deepEqual(await response.json(),{providers:[{id:'pulse',label:'Pulse Grow',configured:true}]});
assert.equal(response.headers.get('access-control-allow-origin'),null);

response=await handler(new Request('https://dtfseeds.com/api/telemetry/pulse/devices'));
assert.equal(response.status,200);
assert.deepEqual(await response.json(),{provider:'pulse',devices:[{id:'12',name:'Room sensor',zone:'Flower A'}]});

response=await handler(new Request('https://dtfseeds.com/api/telemetry/pulse/devices/12/recent'));
assert.equal(response.status,200);
assert.equal((await response.json()).packet.deviceId,'12');

response=await handler(new Request('https://dtfseeds.com/api/telemetry/pulse/devices/12/recent',{method:'POST'}));
assert.equal(response.status,405);

response=await handler(new Request('https://dtfseeds.com/api/telemetry/missing/devices'));
assert.equal(response.status,404);

const broken=createTelemetryGateway({providers:[{
  id:'pulse',label:'Pulse Grow',configured:true,
  async listDevices(){throw new Error('secret-key upstream stack and private details')},
  async getRecent(){throw new Error('secret-key upstream stack and private details')}
}]});
response=await broken(new Request('https://dtfseeds.com/api/telemetry/pulse/devices'));
assert.equal(response.status,502);
const body=await response.json();
assert.equal(body.error,'Provider request failed.');
assert.ok(!JSON.stringify(body).includes('secret-key'));

console.log('telemetry gateway: ok');
