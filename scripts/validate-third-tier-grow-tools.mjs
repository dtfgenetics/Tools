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
for(const signal of ['normalizeEnvRecord','normalizeGuardrailProfile','Backup contains no valid environmental readings.','VPD, dew point, DLI and alerts recalculated from canonical measurements and saved guardrails','Browser storage is unavailable. Export or print the reading instead.'])
  assert(env.includes(signal),'environment-control: missing '+signal);
assert(env.includes('t>=-273.15')&&env.includes('l>=-273.15')&&env.includes('rootValue>=-273.15'),'environment-control: live temperatures must reject values below absolute zero');
assert(env.includes('const record=normalizeEnvRecord({...x'),'environment-control: saved readings must pass canonical normalization');
assert(env.includes('history=(Array.isArray(THC.load(key,[]))')&&env.includes('.map(normalizeEnvRecord).filter(Boolean)'),'environment-control: persisted history must be normalized on load');
assert(env.includes('profiles=(Array.isArray(THC.load(profileKey,[]))')&&env.includes('.map(normalizeGuardrailProfile).filter(Boolean)'),'environment-control: saved guardrail profiles must be normalized on load');

if(errors.length){
  console.error('Third-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Third-tier grow tool release gate passed: dry-cure-lab, dryback-lab, environment-control.');
