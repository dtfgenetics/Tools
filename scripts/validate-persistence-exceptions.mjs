import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const simpleRoutes=['environment-control','plant-growth-tracker'];
for(const route of simpleRoutes){
  const html=readFileSync(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.match(html,/THC\.backupJson\(/);
  assert.match(html,/THC\.restoreJson\(/);
  assert.doesNotMatch(html,/JSON\.parse\(await .*\.text\(\)\)/);
}

const intentional=['dry-cure-lab','dryback-lab','fertigation-lab'];
for(const route of intentional){
  const html=readFileSync(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.match(html,/JSON\.parse\(await .*\.text\(\)\)/);
}
console.log('persistence exception boundary ok');
