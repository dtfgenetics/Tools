import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const renderer=await readFile(new URL('../site/public-route-patch/assets/thc-telemetry-dashboard-v1.mjs',import.meta.url),'utf8');
const env=await readFile(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');

for(const token of [
  '/assets/thc-provider-client-v1.mjs',
  'createProviderTelemetryClient(',
  'data-provider-refresh',
  'data-provider-select',
  'data-provider-device',
  'data-provider-load',
  'listProviders(',
  'listDevices(',
  'getRecent('
]) assert.ok(renderer.includes(token),'Telemetry dashboard provider discovery missing '+token);

assert.ok(!renderer.toLowerCase().includes('x-api-key'),'Browser provider UI must never handle provider API keys');
assert.ok(!renderer.includes('authorization:'),'Browser provider UI must not construct authorization headers');
assert.ok(env.includes('mountTelemetryDashboard('),'Environment must retain shared dashboard mount');
assert.ok(!env.includes('PULSE_API_KEY'),'Environment must never reference server provider secrets');

console.log('provider telemetry integration: ok');
