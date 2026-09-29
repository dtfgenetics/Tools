import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const runtime=readFileSync(new URL('../site/public-route-patch/assets/thc-tool-suite-v1.js',import.meta.url),'utf8');
for(const token of ['function downloadText(','function downloadJson(','backupJson','downloadText(name,rows.join','window.THC={growlens,backupJson,restoreJson,downloadText,downloadJson']) assert.ok(runtime.includes(token),'shared runtime missing '+token);

const light=readFileSync(new URL('../site/public-route-patch/ppfd-chart/index.html',import.meta.url),'utf8');
for(const token of ['THC.load(CALIBRATION_STORAGE_KEY','THC.save(CALIBRATION_STORAGE_KEY','THC.load(STORAGE_KEY','THC.save(STORAGE_KEY','THC.csv(','THC.downloadJson(']) assert.ok(light.includes(token),'Light Lab shared runtime integration missing '+token);
assert.doesNotMatch(light,/localStorage\.(?:getItem|setItem)\(/);
assert.doesNotMatch(light,/new Blob\(/);
assert.doesNotMatch(light,/URL\.createObjectURL/);

for(const route of ['environment-control','plant-growth-tracker']){
  const html=readFileSync(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.match(html,/THC\.backupJson\(/);
  assert.doesNotMatch(html,/new Blob\(\[JSON\.stringify\(/);
}

console.log('shared download and Light Lab storage integration ok');
