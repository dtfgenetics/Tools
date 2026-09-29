import assert from 'node:assert/strict';
import {createPulseProvider} from '../server/providers/pulse-v1.mjs';

const calls=[];
const fetchFn=async(url,init={})=>{
  calls.push({url:String(url),init});
  if(String(url).endsWith('/all-devices')){
    return new Response(JSON.stringify({deviceViewDtos:[
      {id:12,name:'Room sensor',guid:'abc',roomName:'Flower A'},
      {id:13,name:'Root sensor',guid:'def'}
    ]}),{status:200,headers:{'content-type':'application/json'}});
  }
  if(String(url).endsWith('/sensors/12/recent-data')){
    return new Response(JSON.stringify({
      name:'Room sensor',
      dataPointDto:{
        sensorId:12,
        createdAt:'2026-09-28T20:00:00Z',
        dataPointValues:[
          {paramName:'Temperature',measuringUnit:'C',paramValue:25.2},
          {paramName:'Relative Humidity',measuringUnit:'%',paramValue:59},
          {paramName:'VPD',measuringUnit:'kPa',paramValue:1.25}
        ]
      }
    }),{status:200,headers:{'content-type':'application/json'}});
  }
  if(String(url).endsWith('/sensors/12/details')){
    return new Response(JSON.stringify([{
      id:12,
      name:'Room sensor',
      vpdTarget:1.2,
      thresholds:[{id:7,notificationActive:true,lowThresholdValue:0.8,highThresholdValue:1.5,delay:'00:05:00',thresholdType:3}],
      ph10SensorCalibrationInformationDto:{
        lastPh4CalibrationDate:'2026-09-20T00:00:00Z',
        lastPh7CalibrationDate:'2026-09-21T00:00:00Z',
        lastPh10CalibrationDate:null
      },
      ec1SensorCalibrationInformationDto:{
        lastCalibrationDate:'2026-09-22T00:00:00Z',
        isCalibrationUiShown:true
      }
    }]),{status:200,headers:{'content-type':'application/json'}});
  }
  return new Response('missing',{status:404});
};

const pulse=createPulseProvider({apiKey:'secret-key',fetchFn});
assert.equal(pulse.id,'pulse');
const devices=await pulse.listDevices();
assert.deepEqual(devices.map(x=>({id:x.id,name:x.name,zone:x.zone})),[
  {id:'12',name:'Room sensor',zone:'Flower A'},
  {id:'13',name:'Root sensor',zone:''}
]);
assert.equal(calls[0].init.method,'GET');
assert.equal(calls[0].init.headers['x-api-key'],'secret-key');

const packet=await pulse.getRecent('12');
assert.equal(packet.sourceId,'pulse');
assert.equal(packet.deviceId,'12');
assert.equal(packet.observedAt,'2026-09-28T20:00:00.000Z');
assert.deepEqual(packet.metrics,{temperatureC:25.2,humidity:59,vpd:1.25});

const details=await pulse.getDetails('12');
assert.equal(details.id,'12');
assert.equal(details.name,'Room sensor');
assert.equal(details.thresholds[0].metric,'pulseThreshold:3');
assert.equal(details.thresholds[0].low,0.8);
assert.equal(details.thresholds[0].high,1.5);
assert.equal(details.thresholds[0].delayMinutes,5);
assert.deepEqual(details.calibrations,{
  ph4:'2026-09-20T00:00:00.000Z',
  ph7:'2026-09-21T00:00:00.000Z',
  ph10:null,
  ec:'2026-09-22T00:00:00.000Z'
});
await assert.rejects(()=>pulse.getRecent('../bad'),/device/i);

const unavailable=createPulseProvider({apiKey:'',fetchFn});
assert.equal(unavailable.configured,false);
await assert.rejects(()=>unavailable.listDevices(),/not configured/i);

const authFail=createPulseProvider({
  apiKey:'secret-key',
  fetchFn:async()=>new Response(JSON.stringify({message:'internal provider detail'}),{status:401,headers:{'content-type':'application/json'}})
});
await assert.rejects(()=>authFail.listDevices(),/authentication failed/i);

console.log('pulse provider: ok');
