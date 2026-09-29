import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const routes=['environment-control','dryback-lab'];
for(const route of routes){
  const html=readFileSync(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.match(html,/thc-history-chart-v1\.mjs/);
  assert.match(html,/renderHistoryBars\(/);
  assert.doesNotMatch(html,/history-bar-wrap" title=/);
}
console.log('history chart integration ok');
