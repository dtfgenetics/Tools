import fs from 'node:fs';

const requirements=JSON.parse(fs.readFileSync('data/tool-data-requirements-v1.json','utf8'));
const requiredProducers=['ph-meter','tds-meter','water-quality-lab','fertigation-lab','dryback-lab','environment-control','root-zone-temperature','ppfd-chart'];
const errors=[];
for(const id of requiredProducers){
  const tool=requirements.tools.find(tool=>tool.id===id);
  if(!tool){errors.push(id+': missing data requirement');continue;}
  const slug=String(tool.route||'').split('/').filter(Boolean).at(-1);
  const file='site/public-route-patch/'+slug+'/index.html';
  if(!fs.existsSync(file)){errors.push(id+': missing deployed route '+file);continue;}
  const html=fs.readFileSync(file,'utf8');
  for(const token of [
    'thc-cultivation-data-ui-v1.mjs',
    'collectManualCultivationMeasurement',
    "toolId:'"+id+"'"
  ]) if(!html.includes(token))errors.push(id+': canonical data producer missing '+token);
  for(const metric of tool.requires||[]){
    if(!html.includes(metric+':'))errors.push(id+': required canonical metric is not emitted: '+metric);
  }
}
if(errors.length){
  console.error('Canonical cultivation data producer validation failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Canonical cultivation data producers validated: '+requiredProducers.join(', ')+'.');
