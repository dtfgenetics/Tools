import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const ok=(value,message)=>{if(!value)errors.push(message)};
const manifest=JSON.parse(fs.readFileSync(path.join(root,'migration/manifest.json'),'utf8'));
const canonical=manifest.canonicalToolSlugs||[];

const coverage={
  tools:['validate-tools-repo.mjs','audit-tool-experience-standard.mjs'],
  atlas:['validate-plant-atlas-v4.mjs','audit-tool-experience-standard.mjs'],
  'terpene-atlas':['validate-terpene-atlas.mjs','audit-tool-experience-standard.mjs'],
  'ph-meter':['validate-cultivation-reference-tools.mjs','audit-tool-experience-standard.mjs'],
  'tds-meter':['validate-cultivation-reference-tools.mjs','audit-tool-experience-standard.mjs'],
  'vpd-chart':['validate-cultivation-reference-tools.mjs','validate-final-stateful-grow-tools.mjs'],
  'ppfd-chart':['validate-cultivation-reference-tools.mjs','validate-light-lab-shared-math-integration.mjs'],
  'unit-converter':['validate-quick-win-grow-tools.mjs','audit-tool-experience-standard.mjs'],
  'dilution-calculator':['validate-quick-win-grow-tools.mjs','audit-tool-experience-standard.mjs'],
  'root-zone-temperature':['validate-second-tier-grow-tools.mjs','validate-shared-growth-root-chart-integration.mjs'],
  'plant-growth-tracker':['validate-second-tier-grow-tools.mjs','validate-shared-growth-root-chart-integration.mjs'],
  'photoperiod-planner':['validate-quick-win-grow-tools.mjs','validate-final-stateful-grow-tools.mjs'],
  'co2-ventilation':['validate-second-tier-grow-tools.mjs','audit-tool-experience-standard.mjs'],
  'breeder-pedigree':['validate-final-stateful-grow-tools.mjs','validate-breeder-pedigree-graph.mjs'],
  'substrate-calculator':['validate-quick-win-grow-tools.mjs','audit-tool-experience-standard.mjs'],
  'grow-planner':['validate-fourth-tier-grow-tools.mjs','validate-grow-planner-timeline.mjs'],
  'dry-cure-lab':['validate-third-tier-grow-tools.mjs','validate-dry-cure-live-telemetry.mjs'],
  'ipm-scout':['validate-sixth-tier-grow-tools.mjs','validate-ipm-scout-trend.mjs'],
  'environment-control':['validate-third-tier-grow-tools.mjs','validate-environment-data-producer.mjs'],
  'dew-point':['validate-quick-win-grow-tools.mjs','validate-cultivation-reference-tools.mjs'],
  'dryback-lab':['validate-third-tier-grow-tools.mjs','validate-environment-dryback-timeseries.mjs'],
  'fertigation-lab':['validate-fifth-tier-grow-tools.mjs','validate-fertigation-guided-mix.mjs'],
  'water-quality-lab':['validate-fourth-tier-grow-tools.mjs','validate-cultivation-reference-tools.mjs']
};

ok(canonical.length===23,'expected 23 canonical public routes');
ok(new Set(canonical).size===canonical.length,'canonical route list contains duplicates');
for(const slug of canonical){
  const routeFile=path.join(root,'site/public-route-patch',slug,'index.html');
  ok(fs.existsSync(routeFile),slug+': canonical route file missing');
  const validators=coverage[slug];
  ok(Array.isArray(validators)&&validators.length>=2,slug+': release coverage must have at least two independent guards');
  for(const validator of validators||[]){
    const validatorPath=path.join(root,'scripts',validator);
    ok(fs.existsSync(validatorPath),slug+': missing validator '+validator);
    if(fs.existsSync(validatorPath)){
      const source=fs.readFileSync(validatorPath,'utf8');
      ok(source.includes(slug)||validator==='audit-tool-experience-standard.mjs',slug+': '+validator+' does not reference the route');
    }
  }
}
for(const slug of Object.keys(coverage))ok(canonical.includes(slug),'coverage map includes non-canonical route '+slug);

const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const testScript=pkg?.scripts?.test||'';
for(const validator of new Set(Object.values(coverage).flat())){
  ok(testScript.includes(validator),validator+': release guard is not wired into npm test');
}

if(errors.length){
  console.error('Canonical release coverage failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Canonical release coverage passed: '+canonical.length+' routes have explicit multi-guard ownership.');
