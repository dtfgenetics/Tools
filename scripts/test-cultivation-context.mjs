import assert from 'node:assert/strict';import {createCultivationContext,normalizeCultivationContext,mergeCultivationContext,contextSummary} from '../site/public-route-patch/assets/thc-cultivation-context-v1.mjs';
const a=createCultivationContext({zone:'Room A',stage:'Flower',ecMsCm:'2.1',ph:6.1});assert.equal(a.schema,'thc-cultivation-context');assert.equal(a.measurement.ecMsCm,2.1);
assert.equal(normalizeCultivationContext({schema:'bad'}),null);
const b=mergeCultivationContext(a,{plantId:'P-7',ph:6.2});assert.equal(b.zone,'Room A');assert.equal(b.plantId,'P-7');assert.equal(b.measurement.ecMsCm,2.1);assert.equal(b.measurement.ph,6.2);
assert.ok(contextSummary(b).some(([k,v])=>k==='EC'&&v.includes('2.1')));const legacy=createCultivationContext({sourceTool:'legacy',ph:'',ecMsCm:'bad'});assert.equal(legacy.measurement.ph,null);assert.equal(legacy.measurement.ecMsCm,null);assert.equal(normalizeCultivationContext(legacy).sourceTool,'legacy');console.log('cultivation context core: ok');
