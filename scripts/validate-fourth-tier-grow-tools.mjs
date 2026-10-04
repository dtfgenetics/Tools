import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const assert=(ok,msg)=>{if(!ok)errors.push(msg)};
const read=route=>fs.readFileSync(path.join(root,'site/public-route-patch',route,'index.html'),'utf8');

const water=read('water-quality-lab');
for(const signal of [
  'THC Water Quality','Clear history','Enter a valid dated water report',
  'Use in Fertigation Lab','Save to GrowLens','Export CSV','Import CSV',
  'Print / Save report','Backup JSON','Restore JSON',
  'validReport','requireValidReport','collectManualCultivationMeasurement'
]) assert(water.includes(signal),'water-quality-lab: missing '+signal);
assert(water.includes('pH must be 0–14'),'water-quality-lab: missing pH validation');
assert(water.includes('reported chemistry values cannot be negative'),'water-quality-lab: missing chemistry non-negative validation');

const planner=read('grow-planner');
for(const signal of [
  'THC Grow Planner','Clear saved plans','plannerInputsValid',
  'Enter a valid start date and stage durations',
  'Create GrowLens cycle','Create GrowLens stage tasks',
  'Print / Save report','Export CSV','Backup JSON','Restore JSON',
  'collectCultivationToolResult'
]) assert(planner.includes(signal),'grow-planner: missing '+signal);
assert(planner.includes('Stage durations must be zero or greater'),'grow-planner: missing duration validation');
assert(planner.includes('Correct the plan inputs before saving'),'grow-planner: invalid plan save must be blocked');

if(errors.length){
  console.error('Fourth-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Fourth-tier grow tool release gate passed: water-quality-lab, grow-planner.');
