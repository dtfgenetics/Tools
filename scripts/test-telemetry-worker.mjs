import assert from 'node:assert/strict';
import {createTelemetryWorker} from '../server/telemetry-worker-v1.mjs';

let seenKey='';
const fetchFn=async(url,init={})=>{
  seenKey=init.headers?.['x-api-key']||'';
  if(String(url).endsWith('/all-devices')){
    return new Response(JSON.stringify({deviceViewDtos:[{id:12,name:'Room sensor'}]}),{status:200,headers:{'content-type':'application/json'}});
  }
  return new Response('missing',{status:404});
};

const worker=createTelemetryWorker({PULSE_API_KEY:'server-secret'},{fetchFn});
let response=await worker.fetch(new Request('https://dtfseeds.com/api/telemetry/providers'));
assert.equal(response.status,200);
assert.deepEqual(await response.json(),{providers:[{id:'pulse',label:'Pulse Grow',configured:true}]});

response=await worker.fetch(new Request('https://dtfseeds.com/api/telemetry/pulse/devices'));
assert.equal(response.status,200);
assert.equal(seenKey,'server-secret');
const body=await response.json();
assert.equal(body.devices[0].id,'12');
assert.ok(!JSON.stringify(body).includes('server-secret'));

const unconfigured=createTelemetryWorker({},{fetchFn});
response=await unconfigured.fetch(new Request('https://dtfseeds.com/api/telemetry/providers'));
assert.deepEqual(await response.json(),{providers:[{id:'pulse',label:'Pulse Grow',configured:false}]});

console.log('telemetry worker entry: ok');
