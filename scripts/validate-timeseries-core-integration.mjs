import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=await readFile(new URL('../site/public-route-patch/root-zone-temperature/index.html',import.meta.url),'utf8');
const env=await readFile(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');

for(const [name,html,key] of [
  ['Root-zone',root,'thc-root-zone-history-v1'],
  ['Environment',env,'thc-environment-history-v1']
]){
  assert.ok(html.includes("/assets/thc-timeseries-core-v1.mjs"),name+' must import the shared time-series core');
  assert.ok(html.includes(key),name+' must preserve its storage key');
  assert.ok(html.includes('numericSummary('),name+' must use shared numeric summaries');
  assert.ok(html.includes('latestObservation('),name+' must surface shared latest/freshness semantics');
}

assert.ok(!root.includes('function mean(rows,key)'), 'Root-zone must remove duplicate mean helper');
assert.ok(!env.includes('function avg(rows,key)'), 'Environment must remove duplicate avg helper');

console.log('timeseries core integration: ok');
