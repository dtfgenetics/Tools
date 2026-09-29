import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const tableRoutes=['breeder-pedigree','dry-cure-lab','grow-planner','ipm-scout','photoperiod-planner'];
for(const route of tableRoutes){
  const html=readFileSync(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.match(html,/thc-history-core-v1\.mjs/);
  assert.match(html,/csvTable\(/);
  assert.doesNotMatch(html,/replaceAll\(['"]"['"],['"]""['"]\)/);
}
const fert=readFileSync(new URL('../site/public-route-patch/fertigation-lab/index.html',import.meta.url),'utf8');
assert.match(fert,/thc-history-core-v1\.mjs/);
assert.match(fert,/csvRow\(/);
assert.doesNotMatch(fert,/replaceAll\(['"]"['"],['"]""['"]\)/);
console.log('remaining shared CSV export integration ok');
