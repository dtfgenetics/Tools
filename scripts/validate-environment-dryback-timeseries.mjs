import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const env=readFileSync(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');
for(const token of [
  '/assets/thc-timeseries-chart-v1.mjs',
  '/assets/vendor/uplot-1.6.32.min.js',
  'environmentTrendMetric',
  'environmentTrendConfig',
  'renderTimeSeriesChart(vpdChart',
  'Saved low guardrail',
  'Saved high guardrail',
  "targetLow:r=>r.guardrails?.vpdLow"
]) assert.ok(env.includes(token),'Environment shared trend missing '+token);
assert.doesNotMatch(env,/renderHistoryBars\(/);
assert.doesNotMatch(env,/thc-history-chart-v1\.mjs/);

const dry=readFileSync(new URL('../site/public-route-patch/dryback-lab/index.html',import.meta.url),'utf8');
for(const token of [
  '/assets/thc-timeseries-chart-v1.mjs',
  '/assets/vendor/uplot-1.6.32.min.js',
  'dryTrendSensor',
  'dryTrendMetric',
  'dryTrendConfig',
  'renderTimeSeriesChart(drybackChart',
  'Saved target low',
  'Saved target high',
  "secondaryLabel:'Feed EC'"
]) assert.ok(dry.includes(token),'Dryback shared trend missing '+token);
assert.doesNotMatch(dry,/renderHistoryBars\(/);
assert.doesNotMatch(dry,/thc-history-chart-v1\.mjs/);

console.log('Environment and Dryback shared trend integration ok');
