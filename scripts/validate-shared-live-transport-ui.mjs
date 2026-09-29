import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const adapter=readFileSync(new URL('../site/public-route-patch/assets/thc-live-tool-adapter-v1.mjs',import.meta.url),'utf8');
for(const token of [
  'HTTP polling · GET only',
  'WebSocket',
  'data-live-endpoint',
  'data-live-auto-apply',
  'createRestPollingAdapter({',
  'createWebSocketAdapter({',
  'connection.start()',
  'connection.connect()',
  'Nothing is saved to tool history automatically.',
  'Do not put API keys, bearer tokens, passwords, or other secrets in endpoint URLs.',
  'WebSocket mode sends no application messages.',
  'live-status-board',
  'data-live-state',
  'data-live-identity',
  'data-live-observed',
  'data-live-age',
  'data-live-metrics',
  'updateStatusBoard',
  'formatAge'
]) assert.ok(adapter.includes(token),'Shared live transport adapter missing '+token);
assert.doesNotMatch(adapter,/localStorage|sessionStorage/);
assert.doesNotMatch(adapter,/saveReading\.click\(\)|saveDry\.click\(\)|\.submit\(\)/);
assert.ok(adapter.includes("intervalMs:Math.max(1,Number(interval.value)||10)*1000"),'HTTP polling interval must be user-bounded');
assert.ok(adapter.includes("onPacket:receivePacket"),'Live transports must reuse one packet handling path');

const dryback=readFileSync(new URL('../site/public-route-patch/dryback-lab/index.html',import.meta.url),'utf8');
for(const token of [
  "tool:'dryback'",
  'onApplied:({packet,applied})=>',
  "document.getElementById('sensorId').value=packet.deviceId",
  "document.getElementById('eventTime').value=local",
  "document.getElementById('mode').value='vwc'"
]) assert.ok(dryback.includes(token),'Dryback live metadata bridge missing '+token);

console.log('shared live transport UI integration ok');
