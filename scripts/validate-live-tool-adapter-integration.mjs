import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const routes=[
  ['Environment','environment-control','environment','thc-environment-history-v1'],
  ['VPD','vpd-chart','vpd','thc-vpd-profiles'],
  ['Root Zone','root-zone-temperature','root-zone','thc-root-zone-history-v1'],
  ['Dryback','dryback-lab','dryback','thc-dryback-events-v1'],
  ['Dry/Cure','dry-cure-lab','dry-cure','thc-dry-cure-checkpoints-v1'],
  ['pH','ph-meter','ph','thc-ph-measurements-v1'],
  ['EC/TDS','tds-meter','tds','thc-ec-measurements-v1'],
  ['PPFD','ppfd-chart','ppfd','thc-light-lab-workspace']
];

for(const [name,route,tool,storageKey] of routes){
  const html=await readFile(new URL('../site/public-route-patch/'+route+'/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('id="liveToolAdapter"'),name+' must expose shared live adapter mount');
  assert.ok(html.includes('/assets/thc-live-tool-adapter-v1.mjs'),name+' must import shared live adapter');
  assert.ok(html.includes("tool:'"+tool+"'"),name+' must mount correct live tool mapping');
  assert.ok(html.includes(storageKey),name+' must preserve existing storage key/contract');
  assert.ok(!html.includes("THC.save('thc-"+tool+"-live"),name+' must not persist live packets or credentials');
  assert.ok(!html.includes('saveReading.click()'),name+' must not auto-save history');
}
const adapter=await readFile(new URL('../site/public-route-patch/assets/thc-live-tool-adapter-v1.mjs',import.meta.url),'utf8');
assert.ok(adapter.includes('onPacket=()=>{}'),'shared live adapter must expose optional onPacket observer');
assert.ok(adapter.includes('onPacket(current);'),'shared live adapter must notify packet observers for every incoming packet');
const dryback=await readFile(new URL('../site/public-route-patch/dryback-lab/index.html',import.meta.url),'utf8');
for(const token of ['/assets/thc-irrigation-event-detection-v1.mjs','detectIrrigationCandidates','onPacket:observeIrrigationCandidate','Maximum packet gap for rise detection'])assert.ok(dryback.includes(token),'Dryback stream detection missing '+token);
console.log('multi-tool live adapter integration: ok');
