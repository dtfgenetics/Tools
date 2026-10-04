import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const routes=['dew-point','unit-converter','dilution-calculator','substrate-calculator','photoperiod-planner'];
const errors=[];
const assert=(ok,msg)=>{if(!ok)errors.push(msg)};

for(const route of routes){
  const file=path.join(root,'site/public-route-patch',route,'index.html');
  assert(fs.existsSync(file),route+': index.html missing');
  if(!fs.existsSync(file))continue;
  const html=fs.readFileSync(file,'utf8');
  assert(/<html[^>]+lang=["']en["']/i.test(html),route+': missing html lang');
  assert(/<meta[^>]+name=["']viewport["']/i.test(html),route+': missing viewport');
  assert(/<meta[^>]+name=["']description["']/i.test(html),route+': missing description');
  assert(/<link[^>]+rel=["']canonical["']/i.test(html),route+': missing canonical');
  assert(/<h1\b/i.test(html)&&/<main\b/i.test(html),route+': missing primary document structure');
  assert(/thc-tool-suite-v1\.css/i.test(html),route+': missing shared tool CSS');
  assert(/thc-cultivation-math-v1\.mjs/i.test(html),route+': missing shared cultivation math');
  assert(/Teaching Healthy Cultivation/i.test(html),route+': missing educational brand layer');
  assert(/GrowLens/i.test(html),route+': missing GrowLens bridge');
  assert(/Export CSV/i.test(html),route+': missing CSV export');
  assert(/Backup JSON/i.test(html)&&/Restore JSON/i.test(html),route+': missing backup/restore');
  assert(/Print \/ Save report/i.test(html),route+': missing printable report workflow');
  assert(/aria-live=/i.test(html),route+': missing live feedback region');
}

const dew=fs.readFileSync(path.join(root,'site/public-route-patch/dew-point/index.html'),'utf8');
for(const signal of [
  'Temperature unit','fahrenheitToCelsius','celsiusToFahrenheit',
  'How to read the condensation margin','Condensation physically possible now',
  'Clear history','humidity must be between 1% and 100%',
  'Canonical stored values remain in °C','not a disease diagnosis'
]) assert(dew.includes(signal),'dew-point: missing '+signal);

const unit=fs.readFileSync(path.join(root,'site/public-route-patch/unit-converter/index.html'),'utf8');
for(const signal of ['Temperature','Volume','Length','Area','Mass','Conductivity','Airflow','Copy summary'])
  assert(unit.includes(signal),'unit-converter: missing '+signal);

const dilution=fs.readFileSync(path.join(root,'site/public-route-patch/dilution-calculator/index.html'),'utf8');
assert(dilution.includes('C₁V₁ = C₂V₂'),'dilution-calculator: missing mass-balance model');
assert(/final|target/i.test(dilution)&&/concentration/i.test(dilution),'dilution-calculator: missing target concentration workflow');

const substrate=fs.readFileSync(path.join(root,'site/public-route-patch/substrate-calculator/index.html'),'utf8');
assert(/substrate/i.test(substrate)&&/volume/i.test(substrate),'substrate-calculator: missing substrate volume workflow');

const photo=fs.readFileSync(path.join(root,'site/public-route-patch/photoperiod-planner/index.html'),'utf8');
for(const signal of ['DLI','PPFD','dawn ramp','dusk ramp','Use in Light Lab','Compare saved schedules'])
  assert(photo.includes(signal),'photoperiod-planner: missing '+signal);

if(errors.length){
  console.error('Quick-win grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Quick-win grow tool release gate passed for '+routes.length+' tools.');
