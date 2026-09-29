import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const core=readFileSync(new URL('../site/public-route-patch/assets/thc-live-data-core-v1.mjs',import.meta.url),'utf8');
for(const token of [
  "waterActivity:['waterActivity','aw','water_activity','productWaterActivity']",
  "if(key==='aw'||key.includes('wateractivity'))return 'waterActivity'",
  "'dry-cure':{temperatureC:'dt',humidity:'drh',waterActivity:'aw'}"
]) assert.ok(core.includes(token),'Dry/Cure telemetry core missing '+token);

const html=readFileSync(new URL('../site/public-route-patch/dry-cure-lab/index.html',import.meta.url),'utf8');
for(const token of [
  'id="liveToolAdapter"',
  '/assets/thc-live-tool-adapter-v1.mjs',
  "tool:'dry-cure'",
  "title:'Live dry / cure measurement adapter'",
  'onApplied:()=>render()'
]) assert.ok(html.includes(token),'Dry/Cure live telemetry integration missing '+token);
assert.doesNotMatch(html,/saveCheckpoint\.click\(\)/);

console.log('Dry Cure live telemetry integration ok');
