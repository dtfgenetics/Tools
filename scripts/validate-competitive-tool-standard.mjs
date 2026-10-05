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
    '**Environment:** add authenticated vendor/provider ingestion.',
    '**Dryback:** add authenticated vendor-specific substrate/controller connectors',
    '**Fertigation:** deepen chemistry-aware compatibility/solubility constraints',
    '**Plant Atlas:** richer scientific media blocks',
    '**Terpene Atlas:** richer local 2D/3D chemistry rendering'
  ])ok(benchmark.includes(token),'Competitive benchmark missing production requirement: '+token);
}

const environment=read('site/public-route-patch/environment-control/index.html');
for(const token of ['Live environment adapter','telemetryDashboard','telemetryAlertBoard','environmentTrendMetric','renderTimeSeriesChart(vpdChart','Saved low guardrail','Saved high guardrail'])ok(environment.includes(token),'Environment competitive workflow missing '+token);

const light=read('site/public-route-patch/ppfd-chart/index.html');
for(const token of ['Light logger','logMeasurementType','PAR / PPFD · 400–700 nm','ePAR · 400–750 nm','Start auto-log','Export log CSV','timeSeriesStats','integrateTimeSeries','thc-light-lab-time-log-v1','uplot-1.6.32.min.js','logged photon integral'])ok(light.includes(token),'Light Lab competitive logging workflow missing '+token);

const water=read('site/public-route-patch/water-quality-lab/index.html');
for(const token of ['Import CSV','papaparse-5.7.0.min.js','Use in Fertigation Lab','thc-water-fertigation-handoff-v1','Laboratory / source of report','Lab / method notes','Ca/Mg-derived hardness cross-check',
  'Ion / charge-balance screening',
  'ionBalanceScreening',
  'Nitrate-N (mg/L as N, optional)',
  'Sulfate-S (mg/L as S, optional)',
  'Charge-balance error',
  'nitrate_n_mg_l',
  'sulfate_s_mg_l','n_mg_l','molybdenum_mg_l','data-load-index','data-delete-index','function loadWaterReport(index)','function deleteWaterReport(index)'])ok(water.includes(token),'Water Quality competitive workflow missing '+token);

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
  'Compatibility screening uses only your explicit chemistry-class/solubility entries',
  'cost_per_kg',
  'chemistry_class\',\'stock_volume_l\',\'solubility_limit_g_l',
  'No screening concern',
  '/assets/thc-fertigation-compatibility-v1.mjs',
  'evaluateFertigationCompatibility',
  'User solubility limit (g/L)',
  'Chemistry class',
  'stock_group',
  'Expected / reference final EC',
  'Measured vs expected EC',
  'function ecVerification',
  'does not predict conductivity',
  '/assets/thc-fertigation-solver-v1.mjs',
  'optimizeRecipe',
  'weighted RMS error',
  'does not certify compatibility',
  'User-defined fertilizer product library',
  'thc-fertigation-product-library-v1',
  'Save row to library',
  'thc-fertigation-workspace',
  'sourceWaterContextOut',
  'renderSourceWaterContext',
  'These fields are preserved for interpretation but are not optimizer nutrient targets',
  'source_context_field',
  'nitrate-N or sulfate-S are used only as elemental fallbacks',
  "pick('n','no3n')",
  "pick('s','so4s')",
  'thc-fertigation-history-v1',
  'Save mix locally',
  'Saved fertigation mixes',
  'Repeatability check',
  'Export mix history CSV',
  'function currentMixRecord()',
  'function loadMixRecord(id)',
  'function deleteMixRecord(id)',
  'data-load-mix',
  'data-delete-mix'
])ok(fert.includes(token),'Fertigation competitive workflow missing '+token);
const fertCompatibility=read('site/public-route-patch/assets/thc-fertigation-compatibility-v1.mjs');
for(const token of ["id:'calcium-phosphate'","id:'calcium-sulfate'","id:'iron-phosphate-review'","ruleId:'user-solubility-limit'"])ok(fertCompatibility.includes(token),'Fertigation shared compatibility core missing '+token);

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
  'thc-dryback-workspace',
  'Steering-phase schedule templates',
  'thc-dryback-steering-templates-v1',
  'Auto-classify phase from event time',
  'classifySteeringPhase',
  'phaseSource',
  'steeringTemplate',
  'Multi-sensor / position comparison',
  'Sensor / probe / plant position',
  'latestBySensor',
  'renderSensorComparison',
  'drybackSpread',
  'rootEcSpread',
  'dryTrendSensor',
  'dryTrendMetric',
  'renderTimeSeriesChart(drybackChart',
  'Saved target low',
  'Saved target high',
  'Automatic irrigation-event candidates',
  'irrigationRiseThreshold',
  'thc-dryback-detected-irrigation-v1',
  'observeIrrigationCandidate',
  'generic-live-vwc',
  'Possible irrigation event detected.',
  'dryback-detected-irrigation-candidates.csv'
])ok(dryback.includes(token),'Dryback competitive workflow missing '+token);

const photoperiod=read('site/public-route-patch/photoperiod-planner/index.html');
for(const token of ['Schedule name','Plant stage','photoTimeline','scheduleCompareOut','compareScheduleA','compareScheduleB','Clock schedule is internally consistent.','Use in Light Lab','thc-photoperiod-light-handoff-v1','Linear dawn ramp (minutes)','Linear dusk ramp (minutes)','full-output-equivalent hours','dawn_ramp_minutes','effectiveHours'])ok(photoperiod.includes(token),'Photoperiod competitive workflow missing '+token);

const rootZone=read('site/public-route-patch/root-zone-temperature/index.html');
for(const token of ['Filtered root-zone summary','rootZoneFilter','rootTimingFilter','avgRootAirDelta','avgSolutionRootDelta','avgRootEcDelta','Feed / irrigation EC','Root-zone / pore-water EC','does not infer dissolved oxygen',
  'Sensor / probe / plant position',
  'Multi-sensor / position comparison',
  'rootSensorCount',
  'rootTempSpread',
  'rootSensorEcSpread',
  'latestBySensor',
  'renderSensorComparison',
  'sensor_id'])ok(rootZone.includes(token),'Root-Zone competitive workflow missing '+token);

const water=read('site/public-route-patch/water-quality-lab/index.html');
for(const token of ['Alkalinity & carbonate-system context','Alkalinity meq/L','HCO₃⁻ equivalent mg/L','Do not use this as an acid-dose calculator.','alkalinityContext'])ok(water.includes(token),'Water Quality alkalinity education missing '+token);

const photo=read('site/public-route-patch/photoperiod-planner/index.html');
for(const token of ['Print selected comparison','scheduleCompareRows','comparisonRows','Equivalent full-output hours','The comparison reports schedule differences only'])ok(photo.includes(token),'Photoperiod competitive comparison missing '+token);

const growth=read('site/public-route-patch/plant-growth-tracker/index.html');
for(const token of ['Growth stage','Starting canopy width','Starting primary branches','stageFilter','trendMetric','growthLineChart','avgCanopyRate','avgBranchRate','canopyRate','branchRate','Photo / observation reference','baselineHeightDelta','baselineCanopyDelta','stageBaseline','safePhotoLink','photo_reference'])ok(growth.includes(token),'Plant Growth competitive workflow missing '+token);

const terpeneHtml=read('site/public-route-patch/terpene-atlas/index.html');
const terpeneRuntime=read('site/public-route-patch/terpene-atlas/terpene-atlas-v1.js');
const terpeneCatalog=JSON.parse(read('site/public-route-patch/terpene-atlas/data/terpene-catalog-v1.json'));
for(const token of ['Structure & identifiers','Download JSON record','PubChem CID','InChIKey'])ok(terpeneRuntime.includes(token),'Terpene Atlas chemistry record workflow missing '+token);
ok(terpeneRuntime.includes('pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/'),'Terpene Atlas PubChem structure rendering is missing');
ok(terpeneHtml.includes('data-data-quality'),'Terpene Atlas identity QA summary is missing');
ok((terpeneCatalog.compounds||[]).some(x=>x.pubchemCid),'Terpene Atlas catalog has no resolved PubChem identifiers');
ok((terpeneCatalog.compounds||[]).some(x=>x.identityStatus==='verified'),'Terpene Atlas catalog has no verified chemical identities');

const growth=read('site/public-route-patch/plant-growth-tracker/index.html');
for(const token of ['Starting stem diameter','Current stem diameter','Starting average internode length','Current average internode length','stemRate','internodeRate','baselineStemDelta','baselineInternodeDelta'])ok(growth.includes(token),'Plant Growth competitive morphology missing '+token);

const breeder=read('site/public-route-patch/breeder-pedigree/index.html');
for(const token of ['Pedigree validation','collectAncestors','collectDescendants','wouldCreateCycle','Conflicting parentage records','All saved ancestors','All saved descendants',
  'line_status',
  'validExternalUrl',
  'Generation / testing notes',
  'Selection criteria / observed traits',
  'External reference URL',
  'Breeder / source attribution'])ok(breeder.includes(token),'Breeder competitive workflow missing '+token);

const hub=read('site/public-route-patch/tools/index.html');
for(const token of ['id="task-workflows"','Task-first workflows','Diagnose the room before blaming the plant.','Review water delivery, root conditions, then dryback.','Formulate from source water, then verify the mixed result.','Put stage, photoperiod, light, and growth on one timeline.','Preserve the harvest record through dry and cure.','Measure phenotype before you preserve lineage.','workflow-entry-grid'])ok(hub.includes(token),'Tools Hub task-first navigation missing '+token);

const dryCure=read('site/public-route-patch/dry-cure-lab/index.html');
for(const token of ['Actual vs active program','activeProgramTarget','programTarget','programDelta','Vapor-pressure & water-activity context','roomVp','roomVpd','thc-dry-cure-workspace-backup.json','Dry / cure trend','dryTrendLot','dryTrendMetric','renderTimeSeriesChart(dryTrendChart','Saved program target','lotRunSummary','Mean |program temp Δ|','recorded elapsed-span difference','Cross-lot dry cure run comparison','liveToolAdapter',"tool:'dry-cure'",'Cross-lot comparison','compareLotA','compareLotB','renderLotComparison','latestForLot','Latest checkpoints are'])ok(dryCure.includes(token),'Dry/Cure competitive workflow missing '+token);

const css=read('site/public-route-patch/assets/thc-tool-suite-v1.css');
for(const token of ['.table-wrap table{min-width:640px}', '.table-wrap th{position:sticky'])ok(css.includes(token),'Shared competitive table UX missing '+token);

if(errors.length){
  console.error('Competitive tool standard validation failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Competitive tool standard validation passed.');
