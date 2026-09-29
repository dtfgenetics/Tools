import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const core=readFileSync(new URL('../site/public-route-patch/assets/thc-timeseries-core-v1.mjs',import.meta.url),'utf8');
for(const token of ['export function medianValue','export function timeSeriesStats','export function integrateTimeSeries','maxObservedGapMs']) assert.ok(core.includes(token),'time-series core missing '+token);

const html=readFileSync(new URL('../site/public-route-patch/ppfd-chart/index.html',import.meta.url),'utf8');
for(const token of [
  'id="light-logger"',
  'PAR / PPFD · 400–700 nm',
  'ePAR · 400–750 nm',
  'id="startLightAutoLog"',
  'id="exportLightLog"',
  'LIGHT_LOG_KEY=\'thc-light-lab-time-log-v1\'',
  'timeSeriesStats(rows',
  'integrateTimeSeries(rows',
  'scale:1e-6',
  'slice(-2000)',
  'csvTable([',
  '/assets/vendor/uplot-1.6.32.min.js',
  '/assets/vendor/uplot-1.6.32.min.css',
  'measurement bases are kept separate',
  'not automatically a full-day DLI'
]) assert.ok(html.includes(token),'Light Lab logger integration missing '+token);
assert.match(html,/x=>x\.basis===logMeasurementType\.value/);
assert.match(html,/clearInterval\(lightAutoTimer\)/);
console.log('Light Lab logger integration ok');
