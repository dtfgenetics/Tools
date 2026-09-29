import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const shared=readFileSync(new URL('../site/public-route-patch/assets/thc-timeseries-chart-v1.mjs',import.meta.url),'utf8');
for(const token of ['buildTimeSeriesData','renderTimeSeriesChart','renderFallback','globalThis.uPlot']) assert.ok(shared.includes(token),'shared time-series chart missing '+token);

const ipm=readFileSync(new URL('../site/public-route-patch/ipm-scout/index.html',import.meta.url),'utf8');
assert.match(ipm,/thc-timeseries-chart-v1\.mjs/);
assert.match(ipm,/renderTimeSeriesChart\(ipmTrendChart/);
assert.doesNotMatch(ipm,/new window\.uPlot/);

const light=readFileSync(new URL('../site/public-route-patch/ppfd-chart/index.html',import.meta.url),'utf8');
assert.match(light,/thc-timeseries-chart-v1\.mjs/);
assert.match(light,/renderTimeSeriesChart\(\$\('lightLogChart'\)/);
assert.doesNotMatch(light,/lightLogChart=new window\.uPlot/);

const dry=readFileSync(new URL('../site/public-route-patch/dry-cure-lab/index.html',import.meta.url),'utf8');
for(const token of [
  'id="dryTrendLot"',
  'id="dryTrendMetric"',
  'id="dryTrendChart"',
  'dryMetricConfig',
  'Saved program target',
  'renderTimeSeriesChart(dryTrendChart',
  'dew_point_c',
  'dewPointC:cmp.actualDew',
  '/assets/vendor/uplot-1.6.32.min.js',
  '/assets/vendor/uplot-1.6.32.min.css'
]) assert.ok(dry.includes(token),'Dry/Cure long-history trend missing '+token);

console.log('shared time-series chart integration ok');
