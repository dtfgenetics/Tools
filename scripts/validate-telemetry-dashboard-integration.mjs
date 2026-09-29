import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const env=await readFile(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');
const renderer=await readFile(new URL('../site/public-route-patch/assets/thc-telemetry-dashboard-v1.mjs',import.meta.url),'utf8');

for(const token of [
  'id="telemetryDashboard"',
  '/assets/thc-telemetry-dashboard-v1.mjs',
  'mountTelemetryDashboard('
]) assert.ok(env.includes(token),'Environment telemetry dashboard missing '+token);

for(const token of [
  'normalizeTelemetryCollection(',
  'telemetryHealthSummary(',
  'zoneTelemetrySummary(',
  'telemetryMetricCoverage(',
  'telemetryTableModel('
]) assert.ok(renderer.includes(token),'Shared telemetry dashboard renderer missing '+token);

assert.ok(!env.includes("THC.save('thc-telemetry-dashboard"),'Telemetry dashboard must remain volatile');
assert.ok(!env.includes('saveReading.click()'),'Telemetry dashboard must not auto-save environment history');
assert.ok(env.includes('textContent'),'Telemetry dashboard status must use text rendering for untrusted packet metadata');

console.log('telemetry dashboard integration: ok');
