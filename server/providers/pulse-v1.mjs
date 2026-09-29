import {normalizeTelemetryPacket} from '../../site/public-route-patch/assets/thc-live-data-core-v1.mjs';

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
    }
  };
}
