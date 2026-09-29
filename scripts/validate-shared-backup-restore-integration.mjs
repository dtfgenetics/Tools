import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const routes=['substrate-calculator','breeder-pedigree','grow-planner','ipm-scout'];
for(const route of routes){
  const html=readFileSync(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.match(html,/THC\.backupJson\(/);
  assert.match(html,/THC\.restoreJson\(/);
  assert.doesNotMatch(html,/new Blob\(\[JSON\.stringify\(/);
  assert.doesNotMatch(html,/JSON\.parse\(await .*\.text\(\)\)/);
}
console.log('shared backup restore integration ok');
