import assert from 'node:assert/strict';
import {
  normalizeSolutionRecord,
  normalizeWaterReport,
  ionBalanceScreening,
  ecComparison,
  irrigationMetrics,
  createFertigationHandoff,
  readFertigationHandoff,
  numericDifference,
  mapWaterReportToFertigationSource,
  alkalinityContext
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

const fullWaterMap=mapWaterReportToFertigationSource({
  date:'2026-10-05',source:'Lab',ph:7.2,ec:.45,alk:85,hard:120,
  n:12,p:3,k:7,ca:42,mg:14,s:18,fe:.08,mn:.02,zn:.01,cu:.004,b:.03,mo:.002,
  no3n:99,so4s:88,na:20,cl:25
});
assert.deepEqual(fullWaterMap.values,{N:12,P:3,K:7,Ca:42,Mg:14,S:18,Fe:.08,Mn:.02,Zn:.01,Cu:.004,B:.03,Mo:.002});
assert.deepEqual(fullWaterMap.fallbacks,{});
assert.equal(fullWaterMap.nutrients.N.source,'n');
assert.equal(fullWaterMap.nutrients.S.source,'s');

const fallbackWaterMap=mapWaterReportToFertigationSource({
  date:'2026-10-05',source:'Lab',ph:7.2,ec:.45,alk:85,hard:120,
  n:'',p:3,k:7,ca:42,mg:14,s:'',fe:.08,mn:.02,zn:.01,cu:.004,b:.03,mo:.002,
  no3n:9,so4s:11,na:20,cl:25
});
assert.equal(fallbackWaterMap.values.N,9);
assert.equal(fallbackWaterMap.values.S,11);
assert.deepEqual(fallbackWaterMap.fallbacks,{N:'no3n',S:'so4s'});
assert.equal(mapWaterReportToFertigationSource({ph:'',ec:.4}),null);

const alkContext=alkalinityContext({alkalinityAsCaCO3:100,ph:7.4});
assert.equal(alkContext.alkalinityMeqL,2);
assert.ok(Math.abs(alkContext.bicarbonateEquivalentMgL-122.0336)<1e-6);
assert.equal(alkContext.ph,7.4);
assert.deepEqual(alkalinityContext({alk:'',ph:6.8}),{alkalinityAsCaCO3:null,alkalinityMeqL:null,bicarbonateEquivalentMgL:null,ph:6.8});
