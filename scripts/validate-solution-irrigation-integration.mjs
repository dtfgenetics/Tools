import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const water=await readFile(new URL('../site/public-route-patch/water-quality-lab/index.html',import.meta.url),'utf8');
const fert=await readFile(new URL('../site/public-route-patch/fertigation-lab/index.html',import.meta.url),'utf8');
const dry=await readFile(new URL('../site/public-route-patch/dryback-lab/index.html',import.meta.url),'utf8');

assert.ok(water.includes("/assets/thc-solution-irrigation-core-v1.mjs"),'Water Quality must import shared solution core');
assert.ok(water.includes("/assets/thc-timeseries-core-v1.mjs"),'Water Quality must import shared time-series core');
assert.ok(water.includes("thc-water-quality-history-v1"),'Water Quality storage key must remain stable');
assert.ok(water.includes('normalizeWaterReport('),'Water Quality must use shared report normalization');
assert.ok(water.includes('ionBalanceScreening('),'Water Quality must use shared ion-balance screening');
assert.ok(fert.includes('mapWaterReportToFertigationSource'),'Fertigation integration must import full-chemistry Water Lab mapper');
assert.ok(water.includes('nitrate_n_mg_l'),'Water Quality export must preserve explicit nitrate-N');
assert.ok(water.includes('sulfate_s_mg_l'),'Water Quality export must preserve explicit sulfate-S');
assert.ok(water.includes('numericSummary('),'Water Quality must use shared numeric summary');
assert.ok(!water.includes('function average(rows,key)'),'Water Quality must remove duplicate average helper');

assert.ok(fert.includes("/assets/thc-solution-irrigation-core-v1.mjs"),'Fertigation must import shared solution core');
assert.ok(fert.includes("thc-fertigation-dryback-handoff-v1"),'Fertigation handoff key must remain stable');
assert.ok(fert.includes('ecComparison('),'Fertigation must use shared EC comparison');
assert.ok(fert.includes('createFertigationHandoff('),'Fertigation must create shared v1 handoffs');
assert.ok(!fert.includes("const v=Number(latest[waterKey])"),'Fertigation must not coerce missing Water Lab analytes to zero');
assert.ok(fert.includes("no3n:latest.no3n??null"),'Fertigation must preserve Water Lab nitrate-N context');
assert.ok(fert.includes("so4s:latest.so4s??null"),'Fertigation must preserve Water Lab sulfate-S context');
assert.ok(fert.includes('mapWaterReportToFertigationSource(latest)'),'Fertigation must use shared full-chemistry Water Lab mapping');
assert.ok(fert.includes("resolved.source==='no3n'"),'Fertigation must surface nitrate-N fallback provenance');
assert.ok(fert.includes("resolved.source==='so4s'"),'Fertigation must surface sulfate-S fallback provenance');
assert.ok(fert.includes('never added twice'),'Fertigation must explain species fallback without double counting');

assert.ok(dry.includes("/assets/thc-solution-irrigation-core-v1.mjs"),'Dryback must import shared solution core');
assert.ok(dry.includes("thc-dryback-events-v1"),'Dryback storage key must remain stable');
assert.ok(dry.includes('irrigationMetrics('),'Dryback must use shared irrigation metrics');
assert.ok(dry.includes('ecComparison('),'Dryback must use shared EC comparison');
assert.ok(dry.includes('readFertigationHandoff('),'Dryback must read shared v1 handoffs');

console.log('solution irrigation integration: ok');
