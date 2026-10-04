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
for(const signal of ['normalizeRootRecord','Backup contains no valid root-zone readings.','recalculated from canonical measurements','Browser storage is unavailable. Export or print the reading instead.'])
  assert(rootZone.includes(signal),'root-zone-temperature: missing '+signal);
assert(rootZone.includes('root<-273.15||air<-273.15||solution<-273.15'),'root-zone-temperature: persisted temperatures must reject values below absolute zero');
assert(rootZone.includes('root>=-273.15')&&rootZone.includes('air>=-273.15')&&rootZone.includes('solution>=-273.15'),'root-zone-temperature: live inputs must reject temperatures below absolute zero');
assert(rootZone.includes("timings=['Lights on','Lights off','Before irrigation','After irrigation']"),'root-zone-temperature: persisted timing values must be constrained to supported choices');
assert(rootZone.includes('const record=normalizeRootRecord({...x'),'root-zone-temperature: local saves must pass through canonical record normalization');

const growth=read('plant-growth-tracker');
for(const signal of [
  'Plant Growth Tracker','Growth interval','Filtered growth summary','Growth trend',
  'Save to GrowLens','Export CSV','Backup JSON','Restore JSON','Print / Save report',
  'Clear history','Enter a valid growth interval','non-negative whole numbers',
  'renderTimeSeriesChart','collectManualCultivationMeasurement'
]) assert(growth.includes(signal),'plant-growth-tracker: missing '+signal);
assert(/aria-live=/i.test(growth),'plant-growth-tracker: missing live feedback');
for(const signal of ['normalizeGrowthRecord','Backup contains no valid plant-growth intervals.','growth rates recalculated from canonical measurements','Browser storage is unavailable. Export or print the interval instead.','safePhotoLink(x.photoRef)'])
  assert(growth.includes(signal),'plant-growth-tracker: missing '+signal);
assert(growth.includes("heightRate:(b-a)/d")&&growth.includes("nodeRate:(n2-n1)/d"),'plant-growth-tracker: restored derived rates must be recomputed from canonical measurements');
assert(growth.includes("u=x.u==='in'?'in':x.u==='cm'?'cm':null"),'plant-growth-tracker: restore must validate height units');

const vent=read('co2-ventilation');
for(const signal of [
  'Air-change calculator','Delivered airflow factor','User target ACH',
  'This tool does not calculate CO₂ injection rates','Save to GrowLens','Export CSV',
  'Backup JSON','Restore JSON','Clear all plans','Enter valid room and airflow values',
  'ACH is a room-air exchange calculation, not a CO₂ exposure or enrichment target',
  'airChangesPerHour','deliveredCfmForAirChanges'
]) assert(vent.includes(signal),'co2-ventilation: missing '+signal);
assert((vent.match(/aria-live=/gi)||[]).length>=2,'co2-ventilation: expected live calculation feedback regions');
for(const signal of ['normalizeVentPlan','Backup contains no valid ventilation plans.','recalculated from canonical inputs','Browser storage is unavailable. Export or print the plan instead.'])
  assert(vent.includes(signal),'co2-ventilation: missing '+signal);
assert(vent.includes("unit=x.airUnit==='m3h'?'m3h':x.airUnit==='cfm'?'cfm':null"),'co2-ventilation: restore must validate airflow units');
assert(vent.includes('volumeFt3=lengthFt*widthFt*heightFt')&&vent.includes('airChangesPerHour(deliveredCfm,volumeFt3)'), 'co2-ventilation: restored volume and ACH must be recomputed from canonical inputs');

if(errors.length){
  console.error('Second-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Second-tier grow tool release gate passed: root-zone-temperature, plant-growth-tracker, co2-ventilation.');
