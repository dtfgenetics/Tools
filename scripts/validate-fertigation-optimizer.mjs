import assert from 'node:assert/strict';
import {evaluateRecipe,optimizeRecipe} from '../site/public-route-patch/assets/thc-fertigation-solver-v1.mjs';

const oxide=evaluateRecipe({
  volumeL:100,
  products:[{P2O5:10,K2O:20}],
  amounts:[100]
});
assert(Math.abs(oxide.P-43.64)<1e-9,'P2O5 conversion contribution failed');
assert(Math.abs(oxide.K-166.02)<1e-9,'K2O conversion contribution failed');

const solved=optimizeRecipe({
  volumeL:100,
  sourceWater:{N:0,P:0,K:0,Ca:0,Mg:0},
  targets:{N:150,P:0,K:0,Ca:190,Mg:50},
  products:[
    {N:15,Ca:19},
    {Mg:10}
  ]
});
assert(Math.abs(solved.amounts[0]-100)<1e-3,'Optimizer failed calcium-nitrate-style product target');
assert(Math.abs(solved.amounts[1]-50)<1e-3,'Optimizer failed magnesium product target');
assert(Math.abs(solved.achieved.N-150)<1e-3,'Optimizer N result mismatch');
assert(Math.abs(solved.achieved.Ca-190)<1e-3,'Optimizer Ca result mismatch');
assert(Math.abs(solved.achieved.Mg-50)<1e-3,'Optimizer Mg result mismatch');
assert(solved.weightedRmsPct<0.01,'Optimizer residual unexpectedly high');

console.log('Fertigation optimizer validation passed.');
