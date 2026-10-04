import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const assert=(ok,msg)=>{if(!ok)errors.push(msg)};
const read=route=>fs.readFileSync(path.join(root,'site/public-route-patch',route,'index.html'),'utf8');

const rootZone=read('root-zone-temperature');
for(const signal of [
  'Root-zone temperature','Sensor / probe / plant position','Root-zone trend',
  'Multi-sensor / position comparison','Save to GrowLens','Export CSV','Backup JSON','Restore JSON',
  'Clear history','Enter valid measurements','universal root-zone target',
  'thc-timeseries-chart-v1.mjs','collectManualCultivationMeasurement'
]) assert(rootZone.includes(signal),'root-zone-temperature: missing '+signal);
assert(/aria-live=/i.test(rootZone),'root-zone-temperature: missing live feedback');
assert(/min="0"[^>]*step="\.01"/i.test(rootZone),'root-zone-temperature: optional EC inputs must remain non-negative');

const vent=read('co2-ventilation');
for(const signal of [
  'Air-change calculator','Delivered airflow factor','User target ACH',
  'This tool does not calculate CO₂ injection rates','Save to GrowLens','Export CSV',
  'Backup JSON','Restore JSON','Clear all plans','Enter valid room and airflow values',
  'ACH is a room-air exchange calculation, not a CO₂ exposure or enrichment target',
  'airChangesPerHour','deliveredCfmForAirChanges'
]) assert(vent.includes(signal),'co2-ventilation: missing '+signal);
assert((vent.match(/aria-live=/gi)||[]).length>=2,'co2-ventilation: expected live calculation feedback regions');

if(errors.length){
  console.error('Second-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Second-tier grow tool release gate passed: root-zone-temperature, co2-ventilation.');
