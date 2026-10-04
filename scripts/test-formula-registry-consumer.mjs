import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FORMULA_CONTRACTS,dliFromPpfd,ecToDisplayedPpm} from '../site/public-route-patch/assets/thc-cultivation-math-v1.mjs';

const contract=JSON.parse(fs.readFileSync('data/formula-registry-consumer-v1.json','utf8'));
assert.equal(contract.schema_version,'thc-tools-formula-consumer-contract-v1');
assert.equal(contract.canonical_source.repository,'dtfgenetics/Thc-dataset');
assert.equal(contract.canonical_source.path,'dataset/registry/formula_registry_v1.json');

const implementations={dliFromPpfd:(i)=>dliFromPpfd(i.PPFD_umol_m2_s,i.photoperiod_hours),ecToDisplayedPpm:(i)=>ecToDisplayedPpm(i.EC_mS_cm,i.factor_ppm_per_mS_cm)};
const metadata=new Map(Object.values(FORMULA_CONTRACTS).map(x=>[x.formulaId,x]));
for(const formula of contract.formulas){
 const meta=metadata.get(formula.formula_id);
 assert.ok(meta,`missing runtime formula metadata for ${formula.formula_id}`);
 assert.equal(meta.version,formula.version);
 const fn=implementations[formula.implementation];
 assert.ok(fn,`missing implementation ${formula.implementation}`);
 for(const vector of formula.test_vectors){
  const actual=fn(vector.inputs);
  assert.ok(Math.abs(actual-vector.expected)<=vector.tolerance,`${formula.formula_id} expected ${vector.expected}, got ${actual}`);
 }
}
assert.equal(contract.formulas.length,2);
console.log('formula registry consumer contract: ok (2 formulas, 4 vectors)');
