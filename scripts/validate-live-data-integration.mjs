import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const env=await readFile(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');

for(const token of [
  '/assets/thc-live-data-core-v1.mjs',
  'id="liveJson"',
  'id="liveSourceId"',
  'id="liveDeviceId"',
  'id="previewLivePacket"',
  'id="applyLivePacket"',
  'id="liveStatus"',
  'normalizeTelemetryPacket(',
  'telemetryFreshness(',
  "packetToToolFields(packet,'environment')"
]) assert.ok(env.includes(token),'Environment live adapter missing '+token);

assert.ok(env.includes("liveStatus.textContent="),'Live adapter status must render as text, not injected HTML');
assert.ok(env.includes("JSON.parse(liveJson.value)"),'Live adapter must parse explicit JSON input');
assert.ok(env.includes("document.getElementById(field)"),'Live adapter must apply normalized tool fields by existing field id');
assert.ok(!env.includes("THC.save('thc-environment-live"),'Live adapter must not persist connection/source credentials or packets');
assert.ok(!env.includes("saveReading.click()"),'Applying a live packet must not auto-save environment history');

console.log('live environment integration: ok');
