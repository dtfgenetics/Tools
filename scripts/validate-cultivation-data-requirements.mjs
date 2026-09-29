import fs from 'node:fs';

const registry=JSON.parse(fs.readFileSync('data/tool-data-requirements-v1.json','utf8'));
const core=fs.readFileSync('site/public-route-patch/assets/thc-cultivation-data-core-v1.mjs','utf8');

const metricBlock=core.match(/const METRIC_UNITS=Object\.freeze\(\{([\s\S]*?)\}\);/);
if(!metricBlock)throw new Error('Could not locate METRIC_UNITS in cultivation data core.');
const canonicalMetrics=[...metricBlock[1].matchAll(/^\s*([A-Za-z0-9_]+):/gm)].map(match=>match[1]);
const metricSet=new Set(canonicalMetrics);

const allowedStructured=new Set([
  'parentA','parentB','generation','seedType','lineStatus','selectedPlantIds',
  'selectionTraits','generationNotes','breederSource','externalReference','purpose',
  'symptoms','possibleCauses','verifiedCause','actionTaken','outcomeStatus',
  'severity','locationOnPlant','tissue','pestOrPathogen','trainingType',
  'sampleContext','sourceWater','substrate','medium','cultivarTrait',
  'stage','cultivar','spaceId','cycleId','plantId','observationId','parentRecordId','mediaRefs'
]);

const dirs=fs.readdirSync('site/public-route-patch',{withFileTypes:true})
  .filter(entry=>entry.isDirectory()&&!['assets','tools'].includes(entry.name))
  .map(entry=>entry.name)
  .sort();

const routeSlugs=registry.tools.map(tool=>String(tool.route||'').split('/').filter(Boolean).at(-1)).sort();
const errors=[];

for(const dir of dirs){
  if(!routeSlugs.includes(dir))errors.push('deployed tool route missing from registry: '+dir);
}
for(const slug of routeSlugs){
  if(!dirs.includes(slug))errors.push('registry route does not match a deployed tool directory: '+slug);
}

for(const tool of registry.tools){
  if(!['stateful','derived-optional','reference-only'].includes(tool.dataMode)){
    errors.push(tool.id+': invalid or missing dataMode');
  }
  if(tool.dataMode==='stateful'&&!tool.recordTypes?.length){
    errors.push(tool.id+': stateful tool must declare at least one recordType');
  }
  for(const field of [...(tool.requires||[]),...(tool.optional||[]),...(tool.derives||[]),...(tool.collects||[])]){
    if(!metricSet.has(field)&&!allowedStructured.has(field)){
      errors.push(tool.id+': undeclared collection field '+field);
    }
  }
}

const mustCover=[
  'temperatureC','humidityPercent','vpdKpa','ppfdUmolM2S','dliMolM2Day','ph','ecMsCm',
  'inputPh','runoffPh','inputEcMsCm','runoffEcMsCm','vwcPercent','drybackPercent',
  'heightCm','widthCm','stemDiameterMm','wetWeightG','dryWeightG','waterActivity',
  'alkalinityMgLAsCaCO3','hardnessMgLAsCaCO3','airChangesPerHour','photoperiodHours',
  'populationCount'
];
for(const metric of mustCover){
  if(!metricSet.has(metric))errors.push('canonical metric missing: '+metric);
}

for(const toolId of ['ipm-scout','plant-atlas']){
  const tool=registry.tools.find(x=>x.id===toolId);
  for(const field of ['symptoms','possibleCauses','mediaRefs']){
    if(!tool?.collects?.includes(field))errors.push(toolId+': diagnostic collection missing '+field);
  }
}

if(errors.length){
  console.error('Cultivation data requirements validation failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}

const stateful=registry.tools.filter(tool=>tool.dataMode==='stateful').length;
const optional=registry.tools.filter(tool=>tool.dataMode==='derived-optional').length;
const reference=registry.tools.filter(tool=>tool.dataMode==='reference-only').length;
console.log('Cultivation data coverage validated: '+registry.tools.length+' tools, '+canonicalMetrics.length+' canonical metrics, '+stateful+' stateful, '+optional+' derived-optional, '+reference+' reference-only.');
