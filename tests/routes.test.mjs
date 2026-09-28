import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const registry=JSON.parse(fs.readFileSync(path.join(root,'data/tool-registry.json'),'utf8'));
const errors=[];
const ok=(v,m)=>{if(!v)errors.push(m)};
const migrated=['tools','ppfd-chart','vpd-chart','ph-meter','tds-meter','terpene-atlas'];

for(const slug of migrated){
  const tool=registry.tools.find(x=>x.slug===slug);
  ok(tool,slug+' missing from registry');
  const entry=path.join(root,'apps',slug,'index.html');
  ok(fs.existsSync(entry),slug+' index.html missing');
  if(!fs.existsSync(entry)||!tool)continue;
  const html=fs.readFileSync(entry,'utf8');
  for(const marker of tool.validationMarkers||[])ok(html.toLowerCase().includes(String(marker).toLowerCase()),slug+' missing marker: '+marker);
  if(slug!=='tools')ok(html.includes('href="/tools/"'),slug+' missing All Tools return link');
  for(const match of html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)){
    const publicPath=path.join(root,'public',match[1].replace(/^\//,''));
    ok(fs.existsSync(publicPath),slug+' references missing asset '+match[1]);
  }
  ok(!/coming soon|\bplaceholder\b/i.test(html.replace(/placeholder=["'][^"']*["']/gi,'')),slug+' contains unfinished-state copy');
}

const ppfd=fs.readFileSync(path.join(root,'apps/ppfd-chart/index.html'),'utf8');
for(const marker of ['Canopy mapper','Variable-light DLI schedule','Measurement protocol','.cell input:focus-visible'])ok(ppfd.includes(marker),'PPFD missing production marker: '+marker);

const ph=fs.readFileSync(path.join(root,'apps/ph-meter/index.html'),'utf8');
ok(ph.includes('This page does not measure pH by itself'),'pH page must clearly state that the browser does not measure pH');

const tds=fs.readFileSync(path.join(root,'apps/tds-meter/index.html'),'utf8');
ok(tds.includes('500 scale')&&tds.includes('700 scale'),'TDS page missing scale distinction');

const terpeneJs=fs.readFileSync(path.join(root,'apps/terpene-atlas/terpene-atlas-v1.js'),'utf8');
for(const rel of [...terpeneJs.matchAll(/fetch\(['"]\/terpene-atlas\/(data\/[^'"]+)/g)].map(m=>m[1])){
  ok(fs.existsSync(path.join(root,'apps/terpene-atlas',rel)),'Terpene Atlas missing fetched dataset: '+rel);
}
const terpeneCatalog=JSON.parse(fs.readFileSync(path.join(root,'apps/terpene-atlas/data/terpene-catalog-v1.json'),'utf8'));
const terpeneRecords=Array.isArray(terpeneCatalog)?terpeneCatalog:(terpeneCatalog.terpenes||terpeneCatalog.compounds||[]);
ok(terpeneRecords.length>=120,'Terpene Atlas catalog must retain at least 120 curated records');

if(errors.length){console.error('Route test failed:');for(const e of errors)console.error(' - '+e);process.exit(1)}
console.log('Route tests passed for '+migrated.length+' migrated tool routes.');
