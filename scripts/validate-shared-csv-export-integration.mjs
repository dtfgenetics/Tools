import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const routes=[
  'co2-ventilation',
  'dew-point',
  'dilution-calculator',
  'substrate-calculator',
  'unit-converter'
];

for(const route of routes){
  const html=readFileSync(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.match(html,/thc-history-core-v1\.mjs/);
  assert.match(html,/csvTable\(/);
  assert.doesNotMatch(html,/replaceAll\(['"]"['"],['"]""['"]\)/);
}

console.log('shared CSV export integration ok');
