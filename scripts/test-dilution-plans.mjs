import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {dilutionStockVolume} from '../site/public-route-patch/assets/thc-cultivation-math-v1.mjs';

const html=fs.readFileSync(new URL('../site/public-route-patch/dilution-calculator/index.html',import.meta.url),'utf8');
const match=html.match(/function normalizePlan\(x\)\{[\s\S]*?\}\n(?=function loadPlan)/);
assert.ok(match,'Dilution plan normalization function not found');
const normalizePlan=vm.runInNewContext('('+match[0].trim()+')',{dilutionStockVolume,Number,Date,String});
const plan={at:'2026-10-10T00:00:00.000Z',name:'Test',material:'Reference stock',c1:1000,c2:100,v2:10,unit:'L',steps:2,v1:999,diluent:-989};
const valid=normalizePlan(plan);
assert.ok(valid,'Valid plan should normalize');
assert.equal(valid.v1,1,'Restored aliquot is recomputed from stock concentration');
assert.equal(valid.diluent,9,'Restored diluent is recomputed');
assert.equal(valid.ratio,10);
assert.equal(normalizePlan({...plan,c2:0}).v1,0,'Zero target requires no stock');
for(const key of ['c1','c2','v2','steps']){
 for(const raw of ['', '   ', null, undefined, false, true]){
  assert.equal(normalizePlan({...plan,[key]:raw}),null,'Reject '+key+'='+String(raw));
 }
}
for(const bad of [
 {...plan,c1:0},{...plan,c2:1001},{...plan,c2:-1},
 {...plan,v2:0},{...plan,steps:0},{...plan,steps:11},
 {...plan,steps:1.5},{...plan,unit:'cups'},
 {...plan,at:'invalid'},{...plan,c1:'NaN'}
])assert.equal(normalizePlan(bad),null,'Reject invalid restored plan');
console.log('Dilution Calculator behavioral restoration regression checks passed.');
