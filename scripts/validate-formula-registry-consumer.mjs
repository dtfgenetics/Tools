import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dliFromPpfd,ecToDisplayedPpm} from '../site/public-route-patch/assets/thc-cultivation-math-v1.mjs';

const manifest=JSON.parse(fs.readFileSync(new URL('../data/formula-registry-consumer-v1.json',import.meta.url),'utf8'));
assert.equal(manifest.schema_version,'thc-tools-formula-consumer-v1');
assert.equal(manifest.producer.schema_version,'thc-formula-registry-v1');
assert.match(manifest.producer.git_blob_sha,/^[0-9a-f]{40}$/);

const exportsByName={dliFromPpfd,ecToDisplayedPpm};
for(const formula of manifest.formulas){
  for(const vector of formula.test_vectors){
    let actual;
    if(formula.formula_id==='FORM-DLI-PPFD-PHOTOPERIOD') actual=dliFromPpfd(vector.inputs.PPFD_umol_m2_s,vector.inputs.photoperiod_hours);
    else if(formula.formula_id==='FORM-TDS-FROM-EC-FACTOR') actual=ecToDisplayedPpm(vector.inputs.EC_mS_cm,vector.inputs.factor_ppm_per_mS_cm);
    else throw new Error('Unsupported pinned formula '+formula.formula_id);
    assert.ok(Math.abs(actual-vector.expected)<=vector.tolerance,`${formula.formula_id}: ${actual} != ${vector.expected}`);
  }
  for(const name of formula.consumer_exports) assert.equal(typeof exportsByName[name],'function',name+' export missing');
}
const tds=manifest.formulas.find(x=>x.formula_id==='FORM-TDS-FROM-EC-FACTOR');
assert.equal(tds.requires_explicit_factor,true);
assert.throws(()=>ecToDisplayedPpm(2),/PPM scale/);
assert.throws(()=>ecToDisplayedPpm(2,600),/500, 640, 650 or 700/);
assert.equal(ecToDisplayedPpm(2,500),1000);
assert.equal(ecToDisplayedPpm(2,700),1400);

const routes=['tds-meter','ppfd-chart','photoperiod-planner','environment-control'];
for(const slug of routes){
  const html=fs.readFileSync(new URL(`../site/public-route-patch/${slug}/index.html`,import.meta.url),'utf8');
  assert.ok(html.includes('/assets/thc-cultivation-math-v1.mjs'),slug+' must use shared math engine');
}
console.log('Canonical formula registry consumer parity: PASS');
