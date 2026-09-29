import assert from 'node:assert/strict';
import {createCultivationRecord} from '../site/public-route-patch/assets/thc-cultivation-data-core-v1.mjs';
import {
  collectCultivationRecord,
  exportCultivationData,
  importCultivationData,
  loadCultivationData
} from '../site/public-route-patch/assets/thc-cultivation-data-store-v1.mjs';
import {
  telemetryPacketToCultivationRecord,
  toolResultToCultivationRecord
} from '../site/public-route-patch/assets/thc-cultivation-data-bridge-v1.mjs';

const memory=()=>{
  const map=new Map();
  return {
    getItem:key=>map.has(key)?map.get(key):null,
    setItem:(key,value)=>map.set(key,String(value)),
    removeItem:key=>map.delete(key)
  };
};
const storage=memory();

const manual=createCultivationRecord({
  id:'manual-1',
  type:'solution',
  sourceType:'meter',
  plantId:'p1',
  observedAt:'2026-09-29T10:00:00Z',
  metrics:{ph:6.1,ecMsCm:1.7}
});
collectCultivationRecord(manual,{storage});
assert.equal(loadCultivationData({storage}).length,1);

const telemetry=telemetryPacketToCultivationRecord({
  sourceId:'pulse',
  deviceId:'sensor-1',
  zone:'tent-a',
  observedAt:'2026-09-29T10:05:00Z',
  metrics:{temperatureC:26,humidity:60,ppfd:700}
},{plantId:'p1',spaceId:'s1'});
assert.equal(telemetry.type,'light');
assert.equal(telemetry.metrics.humidityPercent,60);
collectCultivationRecord(telemetry,{storage});

const result=toolResultToCultivationRecord({
  toolId:'vpd',
  plantId:'p1',
  observedAt:'2026-09-29T10:06:00Z',
  metrics:{vpdKpa:1.2}
});
collectCultivationRecord(result,{storage});
assert.equal(loadCultivationData({storage}).length,3);

const exported=exportCultivationData(loadCultivationData({storage}),{generatedAt:'2026-09-29T11:00:00Z'});
const imported=importCultivationData(exported);
assert.equal(imported.length,3);
assert.equal(imported.find(row=>row.toolId==='vpd').metrics.vpdKpa,1.2);

console.log('Cultivation data store and source bridges validated.');
