import assert from 'node:assert/strict';
import {createProviderTelemetryClient} from '../site/public-route-patch/assets/thc-provider-client-v1.mjs';

const calls=[];
const fetchFn=async(url,init={})=>{
  calls.push({url:String(url),init});
  if(String(url).endsWith('/api/telemetry/providers')){
    return new Response(JSON.stringify({providers:[
      {id:'pulse',label:'Pulse Grow',configured:true},
      {id:'other',label:'Other',configured:false}
    ]}),{status:200,headers:{'content-type':'application/json'}});
  }
  if(String(url).endsWith('/api/telemetry/pulse/devices')){
    return new Response(JSON.stringify({provider:'pulse',devices:[{id:'12',name:'Room sensor',zone:'Flower A'}]}),{status:200,headers:{'content-type':'application/json'}});
  }
  if(String(url).endsWith('/api/telemetry/pulse/devices/12/recent')){
    return new Response(JSON.stringify({provider:'pulse',packet:{sourceId:'pulse',deviceId:'12',zone:'Flower A',observedAt:'2026-09-28T20:00:00.000Z',receivedAt:'2026-09-28T20:00:01.000Z',metrics:{temperatureC:25}}}),{status:200,headers:{'content-type':'application/json'}});
  }
  if(String(url).endsWith('/api/telemetry/pulse/devices/12/details')){
    return new Response(JSON.stringify({provider:'pulse',details:{id:'12',name:'Room sensor',zone:'Flower A',thresholds:[],calibrations:{ec:null}}}),{status:200,headers:{'content-type':'application/json'}});
  }
  return new Response(JSON.stringify({error:'missing'}),{status:404,headers:{'content-type':'application/json'}});
};

const client=createProviderTelemetryClient({baseUrl:'/api/telemetry',fetchFn,origin:'https://dtfseeds.com'});
assert.deepEqual(await client.listProviders(),[
  {id:'pulse',label:'Pulse Grow',configured:true},
  {id:'other',label:'Other',configured:false}
]);
assert.deepEqual(await client.listDevices('pulse'),[{id:'12',name:'Room sensor',zone:'Flower A'}]);
assert.equal((await client.getRecent('pulse','12')).deviceId,'12');
assert.equal((await client.getDetails('pulse','12')).id,'12');
assert.equal(calls.length,4);
assert.ok(calls.every(call=>call.init.method==='GET'));
assert.ok(calls.every(call=>!('headers' in call.init)||!JSON.stringify(call.init.headers).toLowerCase().includes('api-key')));

assert.throws(()=>client.listDevices('../bad'),/provider/i);
await assert.rejects(()=>client.getRecent('pulse','../bad'),/device/i);

const failing=createProviderTelemetryClient({
  fetchFn:async()=>new Response(JSON.stringify({error:'Provider request failed.'}),{status:502,headers:{'content-type':'application/json'}}),
  origin:'https://dtfseeds.com'
});
await assert.rejects(()=>failing.listProviders(),/Provider request failed/i);

console.log('provider telemetry client: ok');
