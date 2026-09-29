import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../site/public-route-patch/fertigation-lab/index.html',import.meta.url),'utf8');
for(const token of [
  '/assets/thc-workflow-core-v1.mjs',
  'Guided mix workflow',
  'Build / restart mix workflow',
  'thc-fertigation-mix-workflow-v1',
  'recipeMixSteps(currentMixProducts())',
  'function currentMixProducts()',
  'function buildMixWorkflow()',
  'function restoreMixWorkflow()',
  'data-mix-workflow-step',
  'progress(mixWorkflow)'
])assert.ok(html.includes(token),'Fertigation guided mix missing '+token);
console.log('Fertigation guided mix integration ok');
