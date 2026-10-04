import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const assert=(ok,msg)=>{if(!ok)errors.push(msg)};
const read=route=>fs.readFileSync(path.join(root,'site/public-route-patch',route,'index.html'),'utf8');

const vpd=read('vpd-chart');
for(const signal of [
  'Clear all profiles','Print / Save report','clearVpdProfiles','printVpdReport',
  'All saved VPD profiles cleared.','Backup JSON','Restore JSON','Save current to GrowLens'
]) assert(vpd.includes(signal),'vpd-chart: missing '+signal);

const breeder=read('breeder-pedigree');
for(const signal of [
  'Clear all records','clearPedigree','Clear all saved breeder/pedigree records on this device?',
  'All breeder/pedigree records cleared.','Backup JSON','Restore JSON','Print / Save report',
  'Save focused line to GrowLens'
]) assert(breeder.includes(signal),'breeder-pedigree: missing '+signal);

const photo=read('photoperiod-planner');
for(const signal of [
  'Clear schedules','scheduleValid','Correct the schedule before saving.',
  'Correct the schedule before saving to GrowLens.',
  'Correct the schedule before sending it to Light Lab.',
  'Saved photoperiod schedules cleared.','Backup JSON','Restore JSON',
  'Print / Save report','Export CSV'
]) assert(photo.includes(signal),'photoperiod-planner: missing '+signal);
assert(photo.includes('Number(x.h)>=0&&Number(x.h)<=24'),'photoperiod-planner: restore must reject invalid clock hours');
assert(photo.includes('Number(x.p)>=0'),'photoperiod-planner: restore must reject negative PPFD');
assert(photo.includes('saveSchedule.disabled=!valid'),'photoperiod-planner: invalid schedules must disable local save');

if(errors.length){
  console.error('Final stateful grow-tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Final stateful grow-tool release gate passed: vpd-chart, breeder-pedigree, photoperiod-planner.');
