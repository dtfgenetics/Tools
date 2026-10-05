import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const env=await readFile(new URL('../site/public-route-patch/environment-control/index.html',import.meta.url),'utf8');
const board=await readFile(new URL('../site/public-route-patch/assets/thc-telemetry-alert-board-v1.mjs',import.meta.url),'utf8');
for(const token of ['id="telemetryAlertBoard"','/assets/thc-telemetry-alert-board-v1.mjs','mountTelemetryAlertBoard(','telemetryDashboard.getPackets()']) assert.ok(env.includes(token),'Environment alert board missing '+token);
for(const token of ['evaluateTelemetryRules(','buildAlertBoardModel(','data-alert-refresh','onEvaluated=()=>{}','onEvaluated(model)']) assert.ok(board.includes(token),'Shared alert board missing '+token);
assert.ok(env.includes("id:'vpd-band'"),'Environment alert board must derive VPD rule from user guardrails');
assert.ok(env.includes("id:'rh-high'"),'Environment alert board must derive RH rule from user guardrails');
assert.ok(!env.includes('setClimateTarget'),'Environment alert board must not control hardware');
console.log('telemetry alert board integration: ok');

for(const token of ['Environment alert delivery & history','enableEnvironmentNotifications','environmentAlertRows','environment-alert-history.csv','onEvaluated:(model)=>handleTelemetryAlertModel(model)']) assert.ok(env.includes(token),'Environment alert delivery missing '+token);
