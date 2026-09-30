import assert from 'node:assert/strict';
import {
  appendCultivationRecord,
  canonicalMetricUnit,
  createCultivationRecord,
  filterCultivationRecords,
  latestCultivationMetrics,
  validateCultivationRecord,
  cultivationRecordFromMeter,
  cultivationRecordFromDryback,
  cultivationRecordToGrowLens
} from '../site/public-route-patch/assets/thc-cultivation-data-core-v1.mjs';

const first=createCultivationRecord({
  id:'reading-1',
  type:'environment',
  sourceType:'sensor',
  sourceId:'pulse-1',
  plantId:'plant-1',
  spaceId:'tent-a',
  observedAt:'2026-09-29T12:00:00Z',
  metrics:{temperatureC:26.2,humidityPercent:61,unknownMetric:99},
  provenance:{deviceModel:'test-sensor'}
});
assert.deepEqual(first.metrics,{temperatureC:26.2,humidityPercent:61});
assert.equal(first.units.temperatureC,'C');
assert.equal(canonicalMetricUnit('ppfdUmolM2S'),'umol/m2/s');
assert.deepEqual(validateCultivationRecord(first),[]);

const second=createCultivationRecord({
  id:'reading-2',
  type:'light',
  sourceType:'meter',
  plantId:'plant-1',
  observedAt:'2026-09-29T12:05:00Z',
  metrics:{ppfdUmolM2S:712}
});

let records=[];
records=appendCultivationRecord(records,first);
records=appendCultivationRecord(records,second);
assert.equal(records.length,2);
assert.equal(filterCultivationRecords(records,{plantId:'plant-1'}).length,2);
assert.equal(filterCultivationRecords(records,{metric:'ppfdUmolM2S'}).length,1);

const latest=latestCultivationMetrics(records,{plantId:'plant-1'});
assert.equal(latest.ppfdUmolM2S.value,712);
assert.equal(latest.temperatureC.value,26.2);

assert.throws(()=>createCultivationRecord({type:'made-up',sourceType:'manual'}),/Unsupported cultivation record type/);

console.log('Cultivation data core validated.');

const phRecord=cultivationRecordFromMeter({kind:'ph',value:6.1,observedAt:'2026-09-30T12:00:00Z',deviceModel:'meter-a'});
assert.equal(phRecord.metrics.ph,6.1);assert.equal(phRecord.sourceType,'meter');
const dryRecord=cultivationRecordFromDryback({observedAt:'2026-09-30T12:05:00Z',zone:'Room A',rootEcMsCm:3.2,vwcPercent:41,drybackPercent:18,recipeId:'feed-a'});
assert.equal(dryRecord.metrics.ecMsCm,3.2);assert.equal(dryRecord.metrics.vwcPercent,41);assert.equal(dryRecord.values.recipeId,'feed-a');
const gl=cultivationRecordToGrowLens(phRecord,{title:'pH measurement'});assert.equal(gl.reservoir.ph,6.1);assert.equal(gl.environment,null);
const envRecord=createCultivationRecord({type:'environment',sourceType:'sensor',observedAt:'2026-09-30T12:10:00Z',metrics:{temperatureC:25,humidityPercent:60,ppfdUmolM2S:700}});
assert.equal(cultivationRecordToGrowLens(envRecord).environment.ppfd,700);
console.log('Canonical cultivation record adapters validated.');
