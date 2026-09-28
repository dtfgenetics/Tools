import fs from 'node:fs';

const errors=[];
const ok=(value,message)=>{if(!value)errors.push(message)};
const read=path=>fs.readFileSync(path,'utf8');

const benchmarkPath='docs/COMPETITIVE_TOOL_BENCHMARK.md';
ok(fs.existsSync(benchmarkPath),'Competitive benchmark document is missing');
if(fs.existsSync(benchmarkPath)){
  const benchmark=read(benchmarkPath);
  for(const token of [
    'Connected workflows beat isolated calculators.',
    'Current external benchmarks',
    'Required parity gates for production',
    'Fertigation: expand optimizer',
    'Dryback: field-capacity workflow',
    'Plant Atlas: guided tours',
    'Tools Hub: task-first workflow navigation'
  ])ok(benchmark.includes(token),'Competitive benchmark missing production requirement: '+token);
}

const fert=read('site/public-route-patch/fertigation-lab/index.html');
for(const token of [
  'Auto-balance entered products',
  'Source-water S (mg/L)',
  'rp5n',
  'up to five user-defined products',
  'Advanced trace nutrient worksheet',
  'rp5Mo',
  'Fe, Mn, Zn, Cu, B and Mo',
  'Product cost & stock-group metadata',
  'recipeCostOut',
  'Stock labels are organizational only',
  'cost_per_kg,stock_group',
  '/assets/thc-fertigation-solver-v1.mjs',
  'optimizeRecipe',
  'weighted RMS error',
  'does not certify compatibility',
  'User-defined fertilizer product library',
  'thc-fertigation-product-library-v1',
  'Save row to library',
  'thc-fertigation-workspace'
])ok(fert.includes(token),'Fertigation competitive workflow missing '+token);

const dryback=read('site/public-route-patch/dryback-lab/index.html');
for(const token of [
  'P0 · pre-irrigation / overnight dryback',
  'P1 · ramp-up toward field capacity',
  'P2 · daytime maintenance',
  'P3 · final irrigation to dark period',
  'Root-zone / pore-water EC',
  'Dryback target low (%)',
  'root EC Δ vs feed',
  'steering_phase',
  'Field-capacity / reference profiles',
  'thc-dryback-reference-profiles-v1',
  'Save current references',
  'thc-dryback-workspace'
])ok(dryback.includes(token),'Dryback competitive workflow missing '+token);

const breeder=read('site/public-route-patch/breeder-pedigree/index.html');
for(const token of ['Pedigree validation','collectAncestors','collectDescendants','wouldCreateCycle','Conflicting parentage records','All saved ancestors','All saved descendants'])ok(breeder.includes(token),'Breeder competitive workflow missing '+token);

const hub=read('site/public-route-patch/tools/index.html');
for(const token of ['id="task-workflows"','Task-first workflows','Diagnose the room before blaming the plant.','Review water delivery, root conditions, then dryback.','Formulate from source water, then verify the mixed result.','Put stage, photoperiod, light, and growth on one timeline.','Preserve the harvest record through dry and cure.','Measure phenotype before you preserve lineage.','workflow-entry-grid'])ok(hub.includes(token),'Tools Hub task-first navigation missing '+token);

const dryCure=read('site/public-route-patch/dry-cure-lab/index.html');
for(const token of ['Actual vs active program','activeProgramTarget','programTarget','programDelta','Vapor-pressure & water-activity context','roomVp','roomVpd','thc-dry-cure-workspace-backup.json'])ok(dryCure.includes(token),'Dry/Cure competitive workflow missing '+token);

const css=read('site/public-route-patch/assets/thc-tool-suite-v1.css');
for(const token of ['.table-wrap table{min-width:640px}', '.table-wrap th{position:sticky'])ok(css.includes(token),'Shared competitive table UX missing '+token);

if(errors.length){
  console.error('Competitive tool standard validation failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Competitive tool standard validation passed.');
