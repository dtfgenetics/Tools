import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const slugs=["tools","atlas","terpene-atlas","ph-meter","tds-meter","vpd-chart","ppfd-chart","unit-converter","dilution-calculator","root-zone-temperature","plant-growth-tracker","photoperiod-planner","co2-ventilation","breeder-pedigree","substrate-calculator","grow-planner","dry-cure-lab","ipm-scout","environment-control","dew-point","dryback-lab","fertigation-lab","water-quality-lab"];
const errors=[];
const ok=(v,m)=>{if(!v)errors.push(m)};

for(const slug of slugs){
  const file=path.join(root,'site/public-route-patch',slug,'index.html');
  ok(fs.existsSync(file),`missing canonical route file: ${slug}/index.html`);
  if(fs.existsSync(file)) ok(fs.statSync(file).size>200,`canonical route file is unexpectedly small: ${slug}/index.html`);
}
for(const asset of [
  'site/public-route-patch/assets/thc-cultivation-math-v1.mjs',
  'site/public-route-patch/assets/thc-tool-suite-v1.css',
  'site/public-route-patch/assets/thc-tool-suite-v1.js',
  'site/public-route-patch/assets/breeder-pedigree-graph-v1.js',
  'site/public-route-patch/assets/vendor/cytoscape-3.34.3.min.js',
  'site/public-route-patch/assets/vendor/cytoscape-3.34.3.LICENSE.txt',
  'site/public-route-patch/assets/vendor/uplot-1.6.32.min.js',
  'site/public-route-patch/assets/vendor/uplot-1.6.32.min.css'
]) ok(fs.existsSync(path.join(root,asset)),`missing shared dependency: ${asset}`);

const hubPath=path.join(root,'site/public-route-patch/tools/index.html');
if(fs.existsSync(hubPath)){
  const hub=fs.readFileSync(hubPath,'utf8');
  for(const slug of slugs.filter(x=>x!=='tools')) ok(hub.includes(`/${slug}/`),`Tools hub missing route /${slug}/`);
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'migration/manifest.json'),'utf8'));
ok(manifest.sourceOfTruth==='dtfgenetics/Tools','migration manifest must name dtfgenetics/Tools as source of truth');
ok(manifest.integrationRepository==='dtfgenetics/Thc','migration manifest integration repository mismatch');
for(const slug of slugs) ok(manifest.publicRoutes.includes(`/${slug}/`),`migration manifest missing /${slug}/`);
const workflow=fs.readFileSync(path.join(root,'.github/workflows/complete-tool-migration.yml'),'utf8');
ok(!workflow.includes('cp -a "/tmp/thc/site/public-route-patch'),'migration workflow must never copy implementation files from THC back into Tools');

if(errors.length){
  console.error('Canonical Tools repository validation failed:');
  for(const e of errors) console.error(' - '+e);
  process.exit(1);
}
console.log(`Canonical Tools repository valid: ${slugs.length} public routes and required shared dependencies are owned here.`);
