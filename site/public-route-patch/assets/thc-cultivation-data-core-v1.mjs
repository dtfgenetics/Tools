const RECORD_VERSION=1;

export const CULTIVATION_EVENT_TYPES=Object.freeze([
  'environment',
  'light',
  'solution',
  'irrigation',
  'root-zone',
  'plant-growth',
  'plant-observation',
  'ipm',
  'training',
  'harvest',
  'dry-cure',
  'genetics',
  'tool-result'
]);

export const CULTIVATION_SOURCE_TYPES=Object.freeze([
  'manual',
  'sensor',
  'meter',
  'tool',
  'growlens',
  'import'
]);

const METRIC_UNITS=Object.freeze({
  temperatureC:'C',
  leafTemperatureC:'C',
  rootTemperatureC:'C',
  solutionTemperatureC:'C',
  humidityPercent:'%',
  vpdKpa:'kPa',
  dewPointC:'C',
  co2Ppm:'ppm',
  ppfdUmolM2S:'umol/m2/s',
  dliMolM2Day:'mol/m2/day',
  ph:'pH',
  ecMsCm:'mS/cm',
  ppm:'ppm',
  ppmScale:'scale',
  vwcPercent:'%',
  drybackPercent:'%',
  volumeMl:'mL',
  runoffMl:'mL',
  runoffPercent:'%',
  heightCm:'cm',
  widthCm:'cm',
  stemDiameterMm:'mm',
  wetWeightG:'g',
  dryWeightG:'g',
  trimmedWeightG:'g',
  waterActivity:'aw'
});

const finiteOrNull=value=>{
  if(value===null||value===undefined||value==='')return null;
  const n=Number(value);
  return Number.isFinite(n)?n:null;
};

const cleanText=(value,max=120)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
const cleanId=(value,label)=>{
  const id=cleanText(value,120);
  if(!id)throw new Error(label+' is required.');
  if(!/^[A-Za-z0-9._:-]+$/.test(id))throw new Error(label+' contains unsupported characters.');
  return id;
};
const iso=value=>{
  const d=new Date(value??Date.now());
  if(!Number.isFinite(d.getTime()))throw new Error('observedAt must be a valid date/time.');
  return d.toISOString();
};

export function canonicalMetricUnit(metric){
  return METRIC_UNITS[metric]??null;
}

export function normalizeCultivationMetrics(input={}){
  const source=input&&typeof input==='object'?input:{};
  const out={};
  for(const [key,value] of Object.entries(source)){
    if(!(key in METRIC_UNITS))continue;
    const n=finiteOrNull(value);
    if(n!==null)out[key]=n;
  }
  return out;
}

export function createCultivationRecord(input={}){
  const type=cleanText(input.type,40).toLowerCase();
  const sourceType=cleanText(input.sourceType??'manual',40).toLowerCase();
  if(!CULTIVATION_EVENT_TYPES.includes(type))throw new Error('Unsupported cultivation record type: '+type);
  if(!CULTIVATION_SOURCE_TYPES.includes(sourceType))throw new Error('Unsupported cultivation source type: '+sourceType);

  const metrics=normalizeCultivationMetrics(input.metrics);
  const tags=[...new Set((Array.isArray(input.tags)?input.tags:[])
    .map(value=>cleanText(value,60).toLowerCase())
    .filter(Boolean))].slice(0,24);

  return {
    schema:'thc-cultivation-record',
    version:RECORD_VERSION,
    id:cleanId(input.id??('record-'+cryptoRandom()),'Record ID'),
    type,
    sourceType,
    toolId:cleanText(input.toolId,80)||null,
    sourceId:cleanText(input.sourceId,120)||null,
    plantId:cleanText(input.plantId,120)||null,
    cycleId:cleanText(input.cycleId,120)||null,
    spaceId:cleanText(input.spaceId,120)||null,
    zone:cleanText(input.zone,120)||null,
    stage:cleanText(input.stage,40).toLowerCase()||null,
    observedAt:iso(input.observedAt),
    metrics,
    units:Object.fromEntries(Object.keys(metrics).map(key=>[key,METRIC_UNITS[key]])),
    values:normalizeStructuredValues(input.values),
    tags,
    provenance:{
      method:cleanText(input?.provenance?.method??sourceType,120),
      deviceModel:cleanText(input?.provenance?.deviceModel,120)||null,
      calibrationId:cleanText(input?.provenance?.calibrationId,120)||null,
      estimated:Boolean(input?.provenance?.estimated),
      derived:Boolean(input?.provenance?.derived)
    }
  };
}

function normalizeStructuredValues(input){
  if(!input||typeof input!=='object'||Array.isArray(input))return {};
  const out={};
  for(const [key,value] of Object.entries(input)){
    const name=cleanText(key,60);
    if(!name)continue;
    if(typeof value==='number'&&Number.isFinite(value))out[name]=value;
    else if(typeof value==='boolean')out[name]=value;
    else if(typeof value==='string'){
      const text=cleanText(value,120);
      if(text)out[name]=text;
    }
  }
  return out;
}

function cryptoRandom(){
  if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID();
  return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
}

export function validateCultivationRecord(record){
  const errors=[];
  if(!record||typeof record!=='object'||Array.isArray(record))return ['record must be an object'];
  if(record.schema!=='thc-cultivation-record')errors.push('schema must be thc-cultivation-record');
  if(record.version!==RECORD_VERSION)errors.push('version must be '+RECORD_VERSION);
  if(!CULTIVATION_EVENT_TYPES.includes(record.type))errors.push('invalid type');
  if(!CULTIVATION_SOURCE_TYPES.includes(record.sourceType))errors.push('invalid sourceType');
  if(!record.id)errors.push('id is required');
  if(!Number.isFinite(Date.parse(record.observedAt)))errors.push('observedAt must be valid');
  if(!record.metrics||typeof record.metrics!=='object'||Array.isArray(record.metrics))errors.push('metrics must be an object');
  else{
    for(const [key,value] of Object.entries(record.metrics)){
      if(!(key in METRIC_UNITS))errors.push('unknown metric: '+key);
      if(!Number.isFinite(Number(value)))errors.push('metric must be finite: '+key);
      if(record.units?.[key]!==METRIC_UNITS[key])errors.push('unit mismatch for '+key);
    }
  }
  return errors;
}

export function cultivationRecordKey(record){
  const metrics=Object.entries(record?.metrics||{}).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('|');
  return [record?.type||'',record?.sourceType||'',record?.sourceId||'',record?.plantId||'',record?.observedAt||'',metrics].join('::');
}

export function appendCultivationRecord(records,record,{limit=5000}={}){
  const errors=validateCultivationRecord(record);
  if(errors.length)throw new Error('Invalid cultivation record: '+errors.join('; '));
  const list=Array.isArray(records)?records.slice():[];
  const key=cultivationRecordKey(record);
  const next=list.filter(item=>cultivationRecordKey(item)!==key);
  next.push(record);
  next.sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt));
  return next.slice(-Math.max(1,Number(limit)||5000));
}

export function filterCultivationRecords(records,filters={}){
  return (Array.isArray(records)?records:[]).filter(record=>{
    for(const [key,value] of Object.entries(filters)){
      if(value===null||value===undefined||value==='')continue;
      if(key==='metric'){
        if(!(value in (record.metrics||{})))return false;
        continue;
      }
      if(record?.[key]!==value)return false;
    }
    return true;
  });
}

export function latestCultivationMetrics(records,{plantId=null,spaceId=null,zone=null}={}){
  const rows=filterCultivationRecords(records,{plantId,spaceId,zone}).slice().sort((a,b)=>Date.parse(b.observedAt)-Date.parse(a.observedAt));
  const result={};
  for(const row of rows){
    for(const [metric,value] of Object.entries(row.metrics||{})){
      if(metric in result)continue;
      result[metric]={value,unit:row.units?.[metric]??canonicalMetricUnit(metric),observedAt:row.observedAt,recordId:row.id};
    }
  }
  return result;
}
