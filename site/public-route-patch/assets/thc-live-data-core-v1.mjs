const hasValue=value=>value!==null&&value!==undefined&&!(typeof value==='string'&&!value.trim());

const numberOrNull=value=>{
  if(!hasValue(value)) return null;
  const n=Number(value);
  return Number.isFinite(n)?n:null;
};

const readPath=(input,path)=>{
  if(typeof path==='function') return path(input);
  if(!path) return undefined;
  return String(path).split('.').reduce((value,key)=>value?.[key],input);
};

const normalizeTime=value=>{
  if(!hasValue(value)) return null;
  const d=new Date(value);
  return Number.isFinite(d.getTime())?d.toISOString():null;
};

const defaultMetricAliases={
  temperatureC:['temperatureC','temperature','temp','airTemperatureC','airTempC'],
  humidity:['humidity','rh','relativeHumidity'],
  vpd:['vpd','vpdKpa','vpd_kpa'],
  co2:['co2','co2Ppm','co2_ppm'],
  ppfd:['ppfd','par','ppfdUmol'],
  ec:['ec','ecMsCm','ec_ms_cm'],
  ph:['ph','pH'],
  vwc:['vwc','vwcPercent','substrateMoisturePercent'],
  rootTemperatureC:['rootTemperatureC','rootTempC','substrateTemperatureC','substrateTempC'],
  leafTemperatureC:['leafTemperatureC','leafTempC','leafTemperature','leafTemp'],
  solutionTemperatureC:['solutionTemperatureC','solutionTempC'],
  dewPointC:['dewPointC','dewPoint']
};

const firstValue=(input,paths)=>{
  for(const path of paths){
    const value=readPath(input,path);
    if(hasValue(value)) return value;
  }
  return undefined;
};

export function normalizeTelemetryPacket(input={},options={}){
  const source=input&&typeof input==='object'?input:{};
  const mapping=options.mapping&&typeof options.mapping==='object'?options.mapping:{};
  const observedRaw=options.observedAt
    ?? firstValue(source,[mapping.observedAt,'observedAt','createdAt','timestamp','time','at']);
  const observedAt=normalizeTime(observedRaw);
  const metrics={};
  const keys=new Set([...Object.keys(defaultMetricAliases),...Object.keys(mapping).filter(key=>key!=='observedAt')]);
  for(const key of keys){
    const mapped=mapping[key];
    const aliases=mapped?[mapped]:defaultMetricAliases[key]||[key];
    const raw=firstValue(source,aliases);
    const n=numberOrNull(raw);
    if(n!==null) metrics[key]=n;
  }
  return {
    sourceId:String(options.sourceId??source.sourceId??'manual').trim()||'manual',
    deviceId:String(options.deviceId??source.deviceId??source.sensorId??'unspecified').trim()||'unspecified',
    zone:String(options.zone??source.zone??source.room??'').trim(),
    observedAt,
    receivedAt:normalizeTime(options.receivedAt) || new Date().toISOString(),
    metrics
  };
}

export function telemetryPacketKey(packet){
  const metricSignature=Object.entries(packet?.metrics||{}).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('|');
  return [packet?.sourceId||'',packet?.deviceId||'',packet?.observedAt||'',metricSignature].join('::');
}

export function appendTelemetryPacket(records,packet,{limit=500}={}){
  const list=Array.isArray(records)?records.slice():[];
  if(!packet||!packet.observedAt||!Object.keys(packet.metrics||{}).length) return list.slice(-Math.max(0,Number(limit)||0));
  const key=telemetryPacketKey(packet);
  const next=list.filter(row=>telemetryPacketKey(row)!==key);
  next.push(packet);
  next.sort((a,b)=>(Date.parse(a.observedAt)||0)-(Date.parse(b.observedAt)||0));
  return next.slice(-Math.max(0,Number(limit)||0));
}

export function telemetryFreshness(packet,{now=new Date(),staleAfterMs=5*60*1000}={}){
  const observed=Date.parse(packet?.observedAt);
  const nowMs=new Date(now).getTime();
  if(!Number.isFinite(observed)||!Number.isFinite(nowMs)) return {state:'unknown',ageMs:null,stale:null};
  const ageMs=Math.max(0,nowMs-observed);
  const stale=ageMs>Math.max(0,Number(staleAfterMs)||0);
  return {state:stale?'stale':'fresh',ageMs,stale};
}

export function connectionState({connected=false,lastSeenAt=null,now=new Date(),staleAfterMs=5*60*1000}={}){
  if(!connected&&!lastSeenAt) return {state:'offline',freshness:null};
  const freshness=telemetryFreshness({observedAt:lastSeenAt},{now,staleAfterMs});
  if(freshness.state==='unknown') return {state:connected?'connected':'offline',freshness};
  if(freshness.stale) return {state:'stale',freshness};
  return {state:connected?'live':'offline',freshness};
}

export function reconnectDelay(attempt,{baseMs=1000,maxMs=30000}={}){
  const a=Math.max(0,Math.floor(Number(attempt)||0));
  const base=Math.max(1,Number(baseMs)||1000);
  const max=Math.max(base,Number(maxMs)||30000);
  return Math.min(max,base*(2**a));
}

export function buildMetricSeries(records,metricKeys=[]){
  const keys=[...new Set(metricKeys.map(String))];
  const rows=(Array.isArray(records)?records:[])
    .filter(row=>Number.isFinite(Date.parse(row?.observedAt)))
    .slice()
    .sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt));
  const timestamps=rows.map(row=>Date.parse(row.observedAt)/1000);
  const values=Object.fromEntries(keys.map(key=>[key,rows.map(row=>{
    const value=numberOrNull(row?.metrics?.[key]);
    return value===null?null:value;
  })]));
  return {metricKeys:keys,timestamps,values};
}

const TOOL_FIELD_MAPS={
  environment:{temperatureC:'et',humidity:'erh',leafTemperatureC:'leaf',rootTemperatureC:'root',ppfd:'ppfd'},
  vpd:{temperatureC:'airTemp',humidity:'rh',leafTemperatureC:'leafTemp'},
  'root-zone':{rootTemperatureC:'rzt',temperatureC:'rat',solutionTemperatureC:'solutionT',ec:'measuredRootEc'},
  dryback:{ec:'rootEc',vwc:'current'},
  ph:{ph:'phReading'},
  tds:{ec:'ecReading'},
  ppfd:{ppfd:'ppfd'}
};

export function packetToToolFields(packet,tool){
  const map=TOOL_FIELD_MAPS[tool]||{};
  const out={};
  for(const [metric,field] of Object.entries(map)){
    const value=numberOrNull(packet?.metrics?.[metric]);
    if(value!==null) out[field]=value;
  }
  return out;
}
