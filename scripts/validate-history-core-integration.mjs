import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const env=await readFile(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');
const root=await readFile(new URL('../site/public-route-patch/root-zone-temperature/index.html',import.meta.url),'utf8');
const dry=await readFile(new URL('../site/public-route-patch/dryback-lab/index.html',import.meta.url),'utf8');
const growth=await readFile(new URL('../site/public-route-patch/plant-growth-tracker/index.html',import.meta.url),'utf8');

for(const [name,html,key] of [
  ['Environment',env,'thc-environment-history-v1'],
  ['Root zone',root,'thc-root-zone-history-v1'],
  ['Dryback',dry,'thc-dryback-events-v1'],
  ['Growth',growth,'thc-plant-growth-history-v1']
]){
  assert.ok(html.includes('/assets/thc-history-core-v1.mjs'),name+' must import shared history core');
  assert.ok(html.includes(key),name+' must preserve storage key');
  assert.ok(html.includes('filterRecords('),name+' must use shared record filtering');
  assert.ok(html.includes('csvTable('),name+' must use shared CSV serialization');
}

assert.ok(env.includes('uniqueFieldValues('),'Environment must use shared filter-value enumeration');
assert.ok(root.includes('uniqueFieldValues('),'Root-zone must use shared filter-value enumeration');
assert.ok(dry.includes('latestByGroup('),'Dryback must use shared latest-by-sensor selection');
assert.ok(dry.includes('numericSpread('),'Dryback must use shared spread calculation');
assert.ok(growth.includes('uniqueFieldValues('),'Growth must use shared filter-value enumeration');
assert.ok(growth.includes('numericSummary('),'Growth must use shared numeric summary');
assert.ok(!dry.includes('function mean(rows,key)'),'Dryback must remove duplicate mean helper');
assert.ok(!growth.includes('function mean(rows,key)'),'Growth must remove duplicate mean helper');

console.log('history core integration: ok');
