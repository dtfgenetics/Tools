import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const env=await readFile(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');
const adapter=await readFile(new URL('../site/public-route-patch/assets/thc-live-tool-adapter-v1.mjs',import.meta.url),'utf8');

for(const token of [
  'id="liveToolAdapter"',
  '/assets/thc-live-tool-adapter-v1.mjs',
  "tool:'environment'",
  "title:'Live environment adapter'",
  'onApplied:()=>render()'
]) assert.ok(env.includes(token),'Environment shared live adapter missing '+token);

for(const token of [
  'normalizeTelemetryPacket',
  'telemetryFreshness',
  'packetToToolFields',
  'createRestPollingAdapter',
  'createWebSocketAdapter',
  'data-live-transport',
  'data-live-endpoint',
  'data-live-auto-apply'
]) assert.ok(adapter.includes(token),'Shared live adapter missing '+token);

assert.ok(!env.includes("THC.save('thc-environment-live"),'Live adapter must not persist connection/source credentials or packets');
assert.ok(!env.includes('saveReading.click()'),'Applying a live packet must not auto-save environment history');
assert.ok(!adapter.includes('localStorage'),'Shared live adapter must not persist transport settings or packets');

console.log('live environment integration: ok');
