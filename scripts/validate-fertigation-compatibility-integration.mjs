import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../site/public-route-patch/fertigation-lab/index.html',import.meta.url),'utf8');
for(const token of ['/assets/thc-fertigation-compatibility-v1.mjs','evaluateFertigationCompatibility(rows',"finalVolumeL:THC.num('recipeLiters')",'issues.map(x=>','x.message']) assert.ok(html.includes(token),'Fertigation compatibility integration missing '+token);
assert.doesNotMatch(html,/function compatibilityConcerns\(/);

const core=readFileSync(new URL('../site/public-route-patch/assets/thc-fertigation-compatibility-v1.mjs',import.meta.url),'utf8');
for(const token of ["id:'calcium-phosphate'","id:'calcium-sulfate'","severity:'separate'","id:'iron-phosphate-review'","ruleId:'user-solubility-limit'"]) assert.ok(core.includes(token),'Fertigation compatibility core missing '+token);

console.log('fertigation compatibility integration ok');
