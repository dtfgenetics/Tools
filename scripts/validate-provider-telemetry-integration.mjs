import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const renderer=await readFile(new URL('../site/public-route-patch/assets/thc-telemetry-dashboard-v1.mjs',import.meta.url),'utf8');
const env=await readFile(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');

for(const token of [
  './thc-provider-client-v1.mjs',
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
const dryback=await readFile(new URL('../site/public-route-patch/dryback-lab/index.html',import.meta.url),'utf8');
for(const token of ['id="connected-substrate-provider"','/assets/thc-provider-client-v1.mjs','createProviderTelemetryClient()','listProviders()','listDevices(','getRecent(','applyProviderPacket','Start read-only polling','The page never auto-saves irrigation events.'])assert.ok(dryback.includes(token),'Dryback authenticated provider workflow missing '+token);
assert.ok(!dryback.toLowerCase().includes('x-api-key'),'Dryback browser UI must never handle provider API keys');
assert.ok(!dryback.includes('PULSE_API_KEY'),'Dryback must never reference server provider secrets');

const dryCure=await readFile(new URL('../site/public-route-patch/dry-cure-lab/index.html',import.meta.url),'utf8');
for(const token of ['id="connected-dry-cure-provider"','/assets/thc-provider-client-v1.mjs','createProviderTelemetryClient()','applyDryCureProviderPacket','listProviders()','listDevices(','getRecent(','Start read-only polling','Checkpoints are never saved automatically.'])assert.ok(dryCure.includes(token),'Dry/Cure authenticated provider workflow missing '+token);
assert.ok(!dryCure.toLowerCase().includes('x-api-key'),'Dry/Cure browser UI must never handle provider API keys');
assert.ok(!dryCure.includes('PULSE_API_KEY'),'Dry/Cure must never reference server provider secrets');

console.log('provider telemetry integration: ok');
