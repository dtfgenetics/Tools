import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const growth=readFileSync(new URL('../site/public-route-patch/plant-growth-tracker/index.html',import.meta.url),'utf8');
for(const token of [
  '/assets/thc-timeseries-chart-v1.mjs',
  '/assets/vendor/uplot-1.6.32.min.js',
  'renderTimeSeriesChart(growthLineChart',
  "value:r=>r[metric]",
  'Missing optional measurements remain gaps rather than being treated as zero.'
]) assert.ok(growth.includes(token),'Plant Growth shared chart missing '+token);
assert.doesNotMatch(growth,/<svg id="growthLineChart"/);
assert.doesNotMatch(growth,/growthChart\.innerHTML=/);

const root=readFileSync(new URL('../site/public-route-patch/root-zone-temperature/index.html',import.meta.url),'utf8');
for(const token of [
  '/assets/thc-timeseries-chart-v1.mjs',
  '/assets/vendor/uplot-1.6.32.min.js',
  'renderTimeSeriesChart(rootChart',
  "label:'Root zone'",
  "label:'Air'",
  "label:'Irrigation solution'",
  "yLabel:'°C'"
]) assert.ok(root.includes(token),'Root-Zone shared chart missing '+token);
assert.doesNotMatch(root,/renderHistoryBars\(rootChart/);

console.log('Growth and Root-Zone shared chart integration ok');
