import assert from 'node:assert/strict';
import {evaluateFertigationCompatibility,CONCENTRATE_RULES} from '../site/public-route-patch/assets/thc-fertigation-compatibility-v1.mjs';

assert.ok(CONCENTRATE_RULES.some(rule=>rule.id==='calcium-phosphate'&&rule.severity==='separate'));
assert.ok(CONCENTRATE_RULES.some(rule=>rule.id==='calcium-sulfate'&&rule.severity==='separate'));

const incompatible=evaluateFertigationCompatibility([
  {id:'ca',name:'Calcium nitrate',g:100,stock:'stock-a',chem:'calcium-salt'},
  {id:'p',name:'Phosphate',g:50,stock:'stock-a',chem:'phosphate-salt'},
  {id:'s',name:'Sulfate',g:50,stock:'stock-a',chem:'sulfate-salt'}
]);
assert.deepEqual(incompatible.blockers.map(x=>x.ruleId).sort(),['calcium-phosphate','calcium-sulfate']);

const separated=evaluateFertigationCompatibility([
  {g:100,stock:'stock-a',chem:'calcium-salt'},
  {g:50,stock:'stock-b',chem:'phosphate-salt'},
  {g:50,stock:'stock-b',chem:'sulfate-salt'}
]);
assert.equal(separated.blockers.length,0);

const iron=evaluateFertigationCompatibility([{g:10,stock:'stock-b',chem:'iron-micro'},{g:10,stock:'stock-b',chem:'phosphate-salt'}]);
assert.equal(iron.issues[0].ruleId,'iron-phosphate-review');
assert.equal(iron.issues[0].severity,'review');

const sol=evaluateFertigationCompatibility([{name:'Product A',g:150,stock:'stock-a',stockVol:1,sol:100}]);
assert.equal(sol.issues[0].type,'solubility');
assert.equal(sol.issues[0].plannedGL,150);

const direct=evaluateFertigationCompatibility([{name:'Direct',g:50,stock:'direct',sol:4}],{finalVolumeL:10});
assert.equal(direct.issues[0].plannedGL,5);

console.log('fertigation compatibility core ok');
