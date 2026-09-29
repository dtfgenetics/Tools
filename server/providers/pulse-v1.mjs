import {normalizeTelemetryPacket} from '../../site/public-route-patch/assets/thc-live-data-core-v1.mjs';
import {normalizeDeviceHealth} from '../../site/public-route-patch/assets/thc-telemetry-rules-core-v1.mjs';

const API_ROOT='https://api.pulsegrow.com';

const safeDeviceId=value=>{
  const id=String(value??'').trim();
  if(!/^\d+$/.test(id))throw new Error('Pulse device ID must be numeric.');
  return id;
};

const providerError=status=>{
  if(status===401||status===403)return new Error('Pulse authentication failed.');
  if(status===429)return new Error('Pulse rate limit reached.');
  return new Error('Pulse provider request failed.');
};

const requestJson=async(fetchFn,apiKey,path)=>{
  const response=await fetchFn(API_ROOT+path,{
    method:'GET',
    headers:{'accept':'application/json','x-api-key':apiKey}
  });
  if(!response?.ok)throw providerError(Number(response?.status));
  try{return await response.json()}catch{throw new Error('Pulse provider returned invalid JSON.')}
};

const zoneOf=device=>String(
  device?.zone??device?.roomName??device?.room?.name??device?.growRoomName??''
).trim();

const finite=value=>{
  if(value===null||value===undefined||value==='')return null;
  const n=Number(value);
  return Number.isFinite(n)?n:null;
};

const delayMinutes=value=>{
  if(typeof value==='number'&&Number.isFinite(value))return Math.max(0,value);
  const text=String(value??'').trim();
  if(!text)return 0;
  const parts=text.split(':').map(Number);
  if(parts.length===3&&parts.every(Number.isFinite))return Math.max(0,parts[0]*60+parts[1]+parts[2]/60);
  const n=Number(text);
  return Number.isFinite(n)?Math.max(0,n):0;
};

const pulseHealth=payload=>{
  const detail=Array.isArray(payload)?payload[0]:payload;
  const thresholds=(Array.isArray(detail?.thresholds)?detail.thresholds:[]).map(item=>({
    metric:'pulseThreshold:'+String(item?.thresholdType??'unknown'),
    low:finite(item?.lowThresholdValue),
    high:finite(item?.highThresholdValue),
    delayMinutes:delayMinutes(item?.delay),
    enabled:item?.notificationActive!==false
  }));
  const vpdTarget=finite(detail?.vpdTarget);
  if(vpdTarget!==null)thresholds.push({
    metric:'vpdTarget',
    low:vpdTarget,
    high:vpdTarget,
    delayMinutes:0,
    enabled:true
  });
  return normalizeDeviceHealth({
    id:detail?.id,
    name:detail?.name,
    zone:zoneOf(detail),
    thresholds,
    calibrations:{
      ph4:detail?.ph10SensorCalibrationInformationDto?.lastPh4CalibrationDate??null,
      ph7:detail?.ph10SensorCalibrationInformationDto?.lastPh7CalibrationDate??null,
      ph10:detail?.ph10SensorCalibrationInformationDto?.lastPh10CalibrationDate??null,
      ec:detail?.ec1SensorCalibrationInformationDto?.lastCalibrationDate??null
    }
  });
};

export function createPulseProvider({apiKey='',fetchFn=globalThis.fetch?.bind(globalThis)}={}){
  const secret=String(apiKey||'').trim();
  const configured=Boolean(secret&&typeof fetchFn==='function');

  const requireConfigured=()=>{
    if(!configured)throw new Error('Pulse provider is not configured.');
  };

  return {
    id:'pulse',
    label:'Pulse Grow',
    configured,

    async listDevices(){
      requireConfigured();
      const payload=await requestJson(fetchFn,secret,'/all-devices');
      const rows=Array.isArray(payload?.deviceViewDtos)?payload.deviceViewDtos:
        Array.isArray(payload)?payload:[];
      return rows.map(device=>({
        id:String(device?.id??device?.sensorId??device?.guid??'').trim(),
        name:String(device?.name??device?.displayName??('Device '+(device?.id??''))).trim(),
        zone:zoneOf(device),
        kind:String(device?.deviceType??device?.sensorType??'').trim()
      })).filter(device=>device.id);
    },

    async getRecent(deviceId){
      requireConfigured();
      const id=safeDeviceId(deviceId);
      const payload=await requestJson(fetchFn,secret,'/sensors/'+encodeURIComponent(id)+'/recent-data');
      return normalizeTelemetryPacket(payload,{
        sourceId:'pulse',
        deviceId:id,
        zone:zoneOf(payload)
      });
    },

    async getDetails(deviceId){
      requireConfigured();
      const id=safeDeviceId(deviceId);
      const payload=await requestJson(fetchFn,secret,'/sensors/'+encodeURIComponent(id)+'/details');
      const health=pulseHealth(payload);
      if(!health.id)health.id=id;
      return health;
    }
  };
}
