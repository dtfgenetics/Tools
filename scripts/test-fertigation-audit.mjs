import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditFertigationRecipe} from '../site/public-route-patch/assets/thc-fertigation-audit-v1.mjs';

const base={volumeL:100,products:[{N:15,Ca:19},{Mg:10},{S:20}],targets:{N:150,Ca:190,Mg:50,S:60}};
const good=auditFertigationRecipe(base);
assert.equal(good.blocked,false);
assert.equal(good.ok,true);
assert.ok(Math.abs(good.result.amounts[0]-100)<0.001);
assert.deepEqual(good.checkedTargets,['N','Ca','Mg','S']);
assert.ok(good.issues.some(x=>x.code==='model-limitations'));
const exceeded=auditFertigationRecipe({...base,sourceWater:{N:180}});
assert.equal(exceeded.blocked,true);
assert.ok(exceeded.issues.some(x=>x.code==='source-exceeds-target'));
const missing=auditFertigationRecipe({...base,targets:{P:30}});
assert.equal(missing.blocked,true);
assert.ok(missing.issues.some(x=>x.code==='missing-source'));
const out=auditFertigationRecipe({...base,amounts:[0,0,0]});
assert.equal(out.ok,false);
assert.ok(out.issues.some(x=>x.code==='target-miss'&&x.element==='N'));
const ambiguous=auditFertigationRecipe({...base,products:[{P:10,P2O5:10}]});
assert.equal(ambiguous.blocked,true);
const basis=auditFertigationRecipe({...base,products:[{P:10}],targets:{P:10}});
assert.ok(basis.issues.some(x=>x.code==='phosphorus-label-basis'));
assert.throws(()=>auditFertigationRecipe({...base,volumeL:0}),/positive/);
assert.throws(()=>auditFertigationRecipe({...base,products:[{N:-1}]}),/0–100/);
assert.throws(()=>auditFertigationRecipe({...base,sourceWater:{N:NaN}}),/finite/);
assert.throws(()=>auditFertigationRecipe({...base,amounts:[1]}),/One gram/);

const partial=auditFertigationRecipe({volumeL:100,targets:{N:100},products:[{N:10,Ca:40}]});
assert.equal(partial.blocked,false);
assert.ok(Math.abs(partial.result.achieved.N-100)<0.001,'Unspecified calcium must not pull optimizer away from nitrogen target');
assert.ok(partial.result.achieved.Ca>0,'Unlisted co-delivered nutrients remain visible in report');

const html=readFileSync(new URL('../site/public-route-patch/fertigation-lab/index.html',import.meta.url),'utf8');
assert.ok(html.includes("import {auditFertigationRecipe} from '/assets/thc-fertigation-audit-v1.mjs';"));
assert.ok(html.includes('Recipe blocked by feasibility audit.'));
assert.ok(html.includes("auditFertigationRecipe({volumeL:L,sourceWater,targets,products})"));
console.log('Fertigation feasibility audit passed.');
