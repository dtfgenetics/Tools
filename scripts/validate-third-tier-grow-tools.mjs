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
for(const signal of ['normalizeDryCheckpoint','normalizeDryProgram','Backup contains no valid dry/cure checkpoints or programs.','weight-loss, dew-point, and program deltas recalculated from canonical measurements','Browser storage is unavailable. Export or print the checkpoint instead.'])
  assert(dryCure.includes(signal),'dry-cure-lab: missing '+signal);
assert(dryCure.includes('loss=(s-cur)/s*100')&&dryCure.includes('day=loss/(hrs/24)'), 'dry-cure-lab: restored weight-loss metrics must be recomputed');
assert(dryCure.includes('dewPointC=dewPoint(t,rh)'), 'dry-cure-lab: restored dew point must be recomputed');
assert(dryCure.includes('dewPointC>tempC'), 'dry-cure-lab: staged programs must reject dew point above stage temperature');

const dryback=read('dryback-lab');
for(const signal of [
  'THC Irrigation & Dryback Lab','Enter a valid dryback event','Clear workspace',
  'Save event','Save to GrowLens','Export CSV','Print / Save report',
  'Backup JSON','Restore JSON','target low cannot exceed target high',
  'collectManualCultivationMeasurement','renderTimeSeriesChart','mountLiveToolAdapter'
]) assert(dryback.includes(signal),'dryback-lab: missing '+signal);
assert(dryback.includes('if(!x.valid)return'),'dryback-lab: invalid event save must be blocked');
for(const signal of ['normalizeDrybackEvent','Backup contains no valid dryback events, profiles, or steering templates.','raw-input events were recalculated from canonical measurements.','Browser storage is unavailable. Export or print the event instead.'])
  assert(dryback.includes(signal),'dryback-lab: missing '+signal);
assert(dryback.includes("raw={low:THC.num('dry'),wet:THC.num('wet'),current:THC.num('current'),hours:THC.num('hours')"), 'dryback-lab: saved events must preserve raw dryback inputs');
assert(dryback.includes('pct=drybackPercent(wet,low,current)')&&dryback.includes('rate=ratePerHour(pct,hours)'), 'dryback-lab: raw-input restore must recompute dryback percent and rate');
for(const signal of ['normalizeDrybackProfile','normalizeSteeringTemplate','derivationStatus','recomputed-from-raw','legacy-derived'])
  assert(dryback.includes(signal),'dryback-lab: missing '+signal);
assert(dryback.includes('.map(normalizeDrybackProfile).filter(Boolean)'),'dryback-lab: reference profiles must be normalized on load/restore');
assert(dryback.includes('.map(normalizeSteeringTemplate).filter(Boolean)'),'dryback-lab: steering templates must be normalized on load/restore');
assert(dryback.includes("'derivation_status'"),'dryback-lab: exports must disclose whether event metrics were recomputed or legacy-derived');

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
for(const signal of ['normalizeEnvironmentRecord','normalizeGuardrailProfile','Backup contains no valid environment readings.','VPD, dew point, DLI, and alerts recalculated from canonical measurements.','Browser storage is unavailable. Export or print the reading instead.'])
  assert(env.includes(signal),'environment-control: missing '+signal);
assert(env.includes('v=Math.max(0,leafVpd(t,rh,l))')&&env.includes('dew=dewPoint(t,rh)')&&env.includes('dli=dliFromPpfd(p,ph)'), 'environment-control: restored derived metrics must be recomputed');
assert(env.includes('t<-273.15')&&env.includes('l<-273.15')&&env.includes('root<-273.15'),'environment-control: persisted temperatures must reject values below absolute zero');
assert(env.includes('t>=-273.15')&&env.includes('l>=-273.15')&&env.includes('rootValue>=-273.15'),'environment-control: live temperatures must reject values below absolute zero');
assert(env.includes('normalizeEnvironmentRecord(record)'),'environment-control: saved readings must pass canonical normalization');
assert(env.includes('history=(Array.isArray(THC.load(key,[]))')&&env.includes('.map(normalizeEnvironmentRecord).filter(Boolean)'),'environment-control: persisted history must be normalized on load');
assert(env.includes('profiles=(Array.isArray(THC.load(profileKey,[]))')&&env.includes('.map(normalizeGuardrailProfile).filter(Boolean)'),'environment-control: saved guardrail profiles must be normalized on load');
for(const signal of ['Optional telemetry dashboard failed to mount.','Optional telemetry alert board failed to mount.','Optional live environment adapter failed to mount.'])
  assert(env.includes(signal),'environment-control: optional runtime boundary missing '+signal);
assert(env.includes("let telemetryDashboard={getPackets:()=>[]}")&&env.includes('try{telemetryDashboard=mountTelemetryDashboard'), 'environment-control: telemetry dashboard must fail safe to an empty packet source');
assert(env.includes('try{mountTelemetryAlertBoard')&&env.includes('try{mountLiveToolAdapter'), 'environment-control: optional alert/live adapters must not block core calculator initialization');

if(errors.length){
  console.error('Third-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Third-tier grow tool release gate passed: dry-cure-lab, dryback-lab, environment-control.');
