import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../site/public-route-patch/vpd-chart/index.html',import.meta.url),'utf8');
assert.match(html,/THC\.load\(VPD_PROFILE_KEY,\[\]\)/);
assert.match(html,/THC\.save\(VPD_PROFILE_KEY/);
assert.doesNotMatch(html,/localStorage\.(?:getItem|setItem)\(VPD_PROFILE_KEY/);
console.log('VPD shared storage integration ok');
