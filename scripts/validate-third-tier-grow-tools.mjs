import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const assert=(ok,msg)=>{if(!ok)errors.push(msg)};
const read=route=>fs.readFileSync(path.join(root,'site/public-route-patch',route,'index.html'),'utf8');

const dryCure=read('dry-cure-lab');
for(const signal of [
  'THC Dry & Cure Lab','Enter a valid drying checkpoint','Clear workspace',
  'Save checkpoint','Save harvest to GrowLens','Export CSV','Print / Save report',
  'Backup JSON','Restore JSON','water activity must be 0–1',
  'collectManualCultivationMeasurement','renderTimeSeriesChart','mountLiveToolAdapter'
]) assert(dryCure.includes(signal),'dry-cure-lab: missing '+signal);
assert(/current weight must be between zero and starting weight/i.test(dryCure),'dry-cure-lab: missing impossible-weight validation');

const dryback=read('dryback-lab');
for(const signal of [
  'THC Irrigation & Dryback Lab','Enter a valid dryback event','Clear workspace',
  'Save event','Save to GrowLens','Export CSV','Print / Save report',
  'Backup JSON','Restore JSON','target low cannot exceed target high',
  'collectManualCultivationMeasurement','renderTimeSeriesChart','mountLiveToolAdapter'
]) assert(dryback.includes(signal),'dryback-lab: missing '+signal);
assert(dryback.includes('if(!x.valid)return'),'dryback-lab: invalid event save must be blocked');

const env=read('environment-control');
for(const signal of [
  'THC Environmental Control Center','CO₂ (ppm, optional)',
  'Enter valid environment and guardrail values','Clear history',
  'Save to GrowLens','Export CSV','Print / Save report','Backup JSON','Restore JSON',
  'co2_ppm','co2Ppm:x.co2','collectManualCultivationMeasurement',
  'renderTimeSeriesChart','mountLiveToolAdapter'
]) assert(env.includes(signal),'environment-control: missing '+signal);
assert(env.includes('vpd high guardrail cannot be below the low guardrail')||env.includes('VPD high guardrail cannot be below the low guardrail'),'environment-control: missing guardrail-order validation');
assert(env.includes("co2Value=$('co2').value"),'environment-control: CO2 input must be read explicitly');

if(errors.length){
  console.error('Third-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Third-tier grow tool release gate passed: dry-cure-lab, dryback-lab, environment-control.');
