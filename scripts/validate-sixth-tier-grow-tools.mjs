import fs from 'node:fs';
import path from 'node:path';

const html=fs.readFileSync(path.join(process.cwd(),'site/public-route-patch','ipm-scout','index.html'),'utf8');
const errors=[];
const assert=(ok,msg)=>{if(!ok)errors.push(msg)};

for(const signal of [
  'THC IPM Scout',
  'Clear history',
  'Enter a valid scouting record.',
  'Correct the scouting record before saving.',
  'Correct the scouting record before saving to GrowLens.',
  'validScoutRecord',
  'Clear all saved IPM scouting records on this device?',
  'IPM scouting history cleared.',
  'Save scouting record',
  'Save to GrowLens',
  'Export CSV',
  'Backup JSON',
  'Restore JSON',
  'Print / Save report',
  'renderTimeSeriesChart',
  'collectManualCultivationMeasurement',
  'Observation ≠ diagnosis',
  'not a universal biological action threshold'
]) assert(html.includes(signal),'ipm-scout: missing '+signal);

assert(
  html.includes("Number.isFinite(Number(x.count))&&Number(x.count)>=0"),
  'ipm-scout: observed count validation missing'
);
assert(
  html.includes("Number.isFinite(Number(x.threshold))&&Number(x.threshold)>=0"),
  'ipm-scout: threshold validation missing'
);
assert(
  html.includes("x=>validScoutRecord(x)"),
  'ipm-scout: backup restore must reuse record validation'
);
assert(
  html.includes("[count,threshold,routeId,scoutDate].forEach"),
  'ipm-scout: date changes must refresh validation state'
);
for(const signal of ['normalizeScoutRecord','Backup contains no valid IPM scouting records.','date, route, area, severity, count and threshold validation','Browser storage is unavailable.'])
  assert(html.includes(signal),'ipm-scout: missing '+signal);
assert(html.includes("scoutAreas.includes(String(x.area))")&&html.includes("scoutSeverities.includes(String(x.severity))"),'ipm-scout: persisted categorical values must be constrained to supported choices');
assert(html.includes('.map(normalizeScoutRecord).filter(Boolean)'),'ipm-scout: saved history must be normalized on load/restore');
assert(html.includes('const next=normalizeScoutRecord(formRecord())'),'ipm-scout: local saves must pass through canonical record normalization');

if(errors.length){
  console.error('Sixth-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Sixth-tier grow tool release gate passed: ipm-scout.');
