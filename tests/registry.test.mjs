import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const file=path.join(root,'data/tool-registry.json');
const errors=[];
const ok=(v,m)=>{if(!v)errors.push(m)};

ok(fs.existsSync(file),'tool registry missing');
if(!fs.existsSync(file)){console.error(errors.join('\n'));process.exit(1)}

const registry=JSON.parse(fs.readFileSync(file,'utf8'));
const expected=['tools','atlas','terpene-atlas','ph-meter','tds-meter','vpd-chart','ppfd-chart','water-quality-lab','fertigation-lab','dryback-lab','dew-point','environment-control','ipm-scout','dry-cure-lab','grow-planner','substrate-calculator','breeder-pedigree','co2-ventilation','photoperiod-planner','plant-growth-tracker','root-zone-temperature','dilution-calculator','unit-converter'];
const tools=registry.tools||[];
const slugs=tools.map(x=>x.slug);

ok(tools.length===expected.length,`expected ${expected.length} tools, found ${tools.length}`);
ok(new Set(slugs).size===slugs.length,'duplicate tool slug');
ok(new Set(tools.map(x=>x.id)).size===tools.length,'duplicate tool id');
for(const slug of expected)ok(slugs.includes(slug),'missing tool slug: '+slug);
for(const tool of tools){
  ok(tool.title,'missing title: '+tool.slug);
  ok(tool.category,'missing category: '+tool.slug);
  ok(typeof tool.public==='boolean','missing public flag: '+tool.slug);
  ok(Array.isArray(tool.validationMarkers)&&tool.validationMarkers.length>0,'missing validation markers: '+tool.slug);
  if(tool.public)ok(Array.isArray(tool.liveMarkers)&&tool.liveMarkers.length>0,'missing live markers: '+tool.slug);
}
ok(registry.targetRepository==='dtfgenetics/Tools','target repository must be dtfgenetics/Tools');

if(errors.length){console.error('Registry test failed:');for(const e of errors)console.error(' - '+e);process.exit(1)}
console.log('Registry test passed for '+tools.length+' tool routes.');
