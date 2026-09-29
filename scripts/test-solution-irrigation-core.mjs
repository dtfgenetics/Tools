import assert from 'node:assert/strict';
import {
  normalizeSolutionRecord,
  normalizeWaterReport,
  ionBalanceScreening,
  ecComparison,
  irrigationMetrics,
  createFertigationHandoff,
  readFertigationHandoff,
  numericDifference
} from '../site/public-route-patch/assets/thc-solution-irrigation-core-v1.mjs';

assert.deepEqual(ecComparison({sourceEc:.4,expectedEc:2,feedEc:1.9,rootEc:2.7}),{
  sourceEc:.4,expectedEc:2,feedEc:1.9,rootEc:2.7,
  feedMinusSource:1.5,feedMinusExpected:-.1,rootMinusFeed:.8
});
assert.deepEqual(ecComparison({sourceEc:'',expectedEc:null,feedEc:'',rootEc:undefined}),{
  sourceEc:null,expectedEc:null,feedEc:null,rootEc:null,
  feedMinusSource:null,feedMinusExpected:null,rootMinusFeed:null
});

assert.deepEqual(irrigationMetrics({appliedMl:1000,runoffMl:150,substrateMl:3785}),{
  appliedMl:1000,runoffMl:150,substrateMl:3785,drainagePercent:15,shotPercent:1000/3785*100
});
assert.equal(irrigationMetrics({appliedMl:0,runoffMl:100,substrateMl:0}).drainagePercent,null);
assert.equal(irrigationMetrics({appliedMl:100,runoffMl:150,substrateMl:1000}).drainagePercent,150);
assert.equal(irrigationMetrics({appliedMl:100,runoffMl:0,substrateMl:''}).shotPercent,null);

assert.deepEqual(normalizeSolutionRecord({
  name:'  Batch A ',sourceWaterName:' RO ',startingEc:'0.2',expectedEc:'2.0',
  expectedEcBasis:' chart ',finalEc:'1.9',finalPh:'5.8',mixedVolumeL:'10',mixingNotes:' ok '
}),{
  name:'Batch A',sourceWaterName:'RO',startingEc:.2,expectedEc:2,expectedEcBasis:'chart',
  finalEc:1.9,finalPh:5.8,mixedVolumeL:10,mixingNotes:'ok'
});

const water=normalizeWaterReport({date:'2026-09-28',source:'Well',ph:'7.1',ec:'0.5',alk:'90',hard:'120',n:'',ca:'35',mg:'12',no3n:'5',so4s:'10'});
assert.equal(water.ph,7.1);
assert.equal(water.ec,.5);
assert.equal(water.n,null);
assert.equal(water.ca,35);
assert.equal(water.no3n,5);
assert.equal(water.so4s,10);

const balance=ionBalanceScreening({ca:40.078,mg:24.305,na:22.989769,k:39.0983,cl:35.453,nitrateN:14.0067,sulfateS:16.0325,alk:50});
assert.ok(Math.abs(balance.components.calcium-2)<1e-6);
assert.ok(Math.abs(balance.components.magnesium-2)<1e-6);
assert.ok(Math.abs(balance.components.sodium-1)<1e-6);
assert.ok(Math.abs(balance.components.potassium-1)<1e-6);
assert.ok(Math.abs(balance.components.chloride-1)<1e-6);
assert.ok(Math.abs(balance.components.nitrate-1)<1e-6);
assert.ok(Math.abs(balance.components.sulfate-1)<1e-6);
assert.ok(Math.abs(balance.components.alkalinity-1)<1e-6);
assert.equal(balance.complete,true);
assert.ok(Math.abs(balance.cationsMeqL-6)<1e-6);
assert.ok(Math.abs(balance.anionsMeqL-4)<1e-6);
assert.ok(Math.abs(balance.balanceErrorPercent-20)<1e-6);
const partialBalance=ionBalanceScreening({ca:40,mg:12,na:20,k:5,cl:25,alk:90});
assert.equal(partialBalance.complete,false);
assert.deepEqual(partialBalance.missing,['nitrate-N','sulfate-S']);

const handoff=createFertigationHandoff({
  createdAt:'2026-09-28T18:00:00Z',
  recipe:{name:'Test'},
  sourceWaterName:'RO',
  startingEc:.2,expectedEc:2,expectedEcBasis:'verified batch',finalEc:1.9,finalPh:5.8,mixedVolumeL:10,mixingNotes:'mixed'
});
assert.equal(handoff.version,1);
assert.equal(handoff.finalEc,1.9);
assert.deepEqual(readFertigationHandoff(handoff),handoff);
assert.equal(readFertigationHandoff({version:2}),null);
assert.equal(numericDifference(120,90),30);
assert.equal(numericDifference(null,90),null);
assert.equal(numericDifference('',90),null);

console.log('solution irrigation core: ok');
