import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const assert=(ok,msg)=>{if(!ok)errors.push(msg)};
const html=fs.readFileSync(path.join(root,'site/public-route-patch','fertigation-lab','index.html'),'utf8');

for(const signal of [
  'THC Fertigation Lab',
  'Clear workspace',
  'Backup workspace',
  'Restore workspace',
  'workspaceVersion=3',
  'mixes:mixHistory',
  'mixWorkflow',
  'sourceWaterContext',
  'parsed?.version===2',
  "THC.save(mixHistoryKey,mixHistory)",
  "THC.save(mixWorkflowKey,mixWorkflow)",
  "$('clearFertigationWorkspace').onclick",
  "THC.save(handoffKey,null)",
  'Fertigation workspace backup restored.',
  'Fertigation workspace cleared.',
  'Save mix locally',
  'Export mix history CSV',
  'Save to GrowLens',
  'Use in Dryback Lab',
  'Auto-balance entered products',
  'evaluateFertigationCompatibility',
  'collectManualCultivationMeasurement'
]) assert(html.includes(signal),'fertigation-lab: missing '+signal);

assert(
  html.includes('recipes:savedRecipes,products:savedProducts,mixes:mixHistory,mixWorkflow,sourceWaterContext'),
  'fertigation-lab: v3 backup must preserve recipes, products, mix history, workflow, and source-water context'
);

assert(
  html.includes("savedRecipes=[];savedProducts=[];mixHistory=[];mixWorkflow=null;sourceWaterContext=null"),
  'fertigation-lab: clear workspace must reset every persisted workspace collection'
);

if(errors.length){
  console.error('Fifth-tier grow tool release gate failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Fifth-tier grow tool release gate passed: fertigation-lab.');
