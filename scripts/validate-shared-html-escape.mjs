import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const routes=['breeder-pedigree','grow-planner','plant-growth-tracker','root-zone-temperature','substrate-calculator','ppfd-chart','vpd-chart'];
for(const route of routes){
  const html=readFileSync(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('THC.esc'),'shared escaping missing in '+route);
  assert.doesNotMatch(html,/String\(value\?\?'\'\)\.replace\(\/\[&<>"'\]\//);
  assert.doesNotMatch(html,/function escape(?:Html|Vpd)\(/);
}
const vpd=readFileSync(new URL('../site/public-route-patch/vpd-chart/index.html',import.meta.url),'utf8');
assert.match(vpd,/THC\.esc\(r\.label\)/);
console.log('shared HTML escaping integration ok');
