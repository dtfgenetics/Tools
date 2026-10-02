import fs from 'node:fs';

const requirements=JSON.parse(fs.readFileSync('data/tool-data-requirements-v1.json','utf8'));
const contracts=JSON.parse(fs.readFileSync('data/canonical-producer-contracts-v1.json','utf8'));
const errors=[];
const allowedModes=new Set(['measurement','observation','mixed','genetics','derived','planning']);
const allowedStatuses=new Set(contracts.statuses||[]);
const stateful=requirements.tools.filter(tool=>tool.dataMode==='stateful');
const byId=new Map((contracts.producers||[]).map(contract=>[contract.toolId,contract]));

for(const tool of stateful){
  const contract=byId.get(tool.id);
  if(!contract){errors.push(tool.id+': stateful tool is missing a producer contract');continue;}
  if(!allowedModes.has(contract.producerMode))errors.push(tool.id+': invalid producerMode '+contract.producerMode);
  if(!allowedStatuses.has(contract.status))errors.push(tool.id+': invalid producer status '+contract.status);
  if(!contract.collector)errors.push(tool.id+': producer collector is required');
}
for(const contract of contracts.producers||[]){
  if(!stateful.some(tool=>tool.id===contract.toolId))errors.push(contract.toolId+': producer contract does not map to a stateful tool');
}
const implemented=(contracts.producers||[]).filter(contract=>contract.status==='implemented');
for(const contract of implemented){
  const tool=requirements.tools.find(tool=>tool.id===contract.toolId);
  if(!tool)continue;
  const slug=String(tool.route||'').split('/').filter(Boolean).at(-1);
  const file='site/public-route-patch/'+slug+'/index.html';
  if(!fs.existsSync(file)){errors.push(tool.id+': missing deployed route '+file);continue;}
  const html=fs.readFileSync(file,'utf8');
  for(const token of [
    'thc-cultivation-data-ui-v1.mjs',
    contract.collector,
    "toolId:'"+tool.id+"'"
  ]) if(!html.includes(token))errors.push(tool.id+': canonical data producer missing '+token);
  for(const metric of tool.requires||[]){
    if(!html.includes(metric+':'))errors.push(tool.id+': required canonical metric is not emitted: '+metric);
  }
}
if(errors.length){
  console.error('Canonical cultivation data producer validation failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
const planned=(contracts.producers||[]).filter(contract=>contract.status==='planned');
console.log('Canonical cultivation data producers validated: '+implemented.map(x=>x.toolId).join(', ')+'.');
console.log('Canonical producer migration queue: '+(planned.length?planned.map(x=>x.toolId).join(', '):'complete')+'.');
