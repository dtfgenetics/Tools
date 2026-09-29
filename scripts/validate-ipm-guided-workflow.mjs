import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../site/public-route-patch/ipm-scout/index.html',import.meta.url),'utf8');
for(const token of [
  '/assets/thc-workflow-core-v1.mjs',
  'Guided scout route',
  'Start / rebuild route',
  'scoutRouteProgress',
  'scoutRouteSteps',
  'thc-ipm-scout-route-workflow-v1',
  'restoreWorkflow',
  'setStepComplete',
  'progress(scoutWorkflow)'
])assert.ok(html.includes(token),'IPM guided route missing '+token);
console.log('IPM guided workflow integration ok');
