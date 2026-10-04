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
for(const signal of ['normalizeSavedWaterReport','Backup contains no valid water-quality reports.','full chemistry, date, pH, EC and temperature validation','Browser storage is unavailable. Export or print the report instead.'])
  assert(water.includes(signal),'water-quality-lab: missing '+signal);
assert(water.includes('Number(r.temp)>=-273.15'),'water-quality-lab: sample temperature must reject values below absolute zero');
assert(water.includes('.map(normalizeSavedWaterReport).filter(Boolean)'),'water-quality-lab: persisted history must be normalized on load/restore');
assert(water.includes('normalizeSavedWaterReport(requireValidReport())'),'water-quality-lab: local save and downstream workflows must use canonical report normalization');

const planner=read('grow-planner');
for(const signal of [
  'THC Grow Cycle Planner','Clear saved plans','plannerInputsValid',
  'Enter a valid start date and stage durations',
  'Create GrowLens cycle','Create GrowLens stage tasks',
  'Print / Save report','Export CSV','Backup JSON','Restore JSON',
  'collectCultivationToolResult'
]) assert(planner.includes(signal),'grow-planner: missing '+signal);
assert(planner.includes('Stage durations must be zero or greater'),'grow-planner: missing duration validation');
assert(planner.includes('Correct the plan inputs before saving'),'grow-planner: invalid plan save must be blocked');
for(const signal of ['normalizeGrowPlan','buildPlanStages','Backup contains no valid grow plans.','Stage dates were recalculated from each saved start date and canonical stage durations.','Browser storage is unavailable.'])
  assert(planner.includes(signal),'grow-planner: missing '+signal);
assert(planner.includes("canonicalStageNames=['Seedling','Vegetative','Transition','Flowering','Drying','Initial cure']"),'grow-planner: canonical stage order missing');
assert(planner.includes('.map(normalizeGrowPlan).filter(Boolean)'),'grow-planner: persisted plans must be normalized on load/restore');
assert(planner.includes('return buildPlanStages(start.value'),'grow-planner: interactive calendar must use the same canonical stage builder as restored plans');

if(errors.length){
  console.error('Fourth-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Fourth-tier grow tool release gate passed: water-quality-lab, grow-planner.');
