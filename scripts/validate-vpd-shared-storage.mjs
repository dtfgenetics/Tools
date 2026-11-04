import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../site/public-route-patch/vpd-chart/index.html',import.meta.url),'utf8');
assert.match(html,/THC\.load\(VPD_PROFILE_KEY,\[\]\)/);
assert.match(html,/THC\.save\(VPD_PROFILE_KEY/);
assert.doesNotMatch(html,/localStorage\.(?:getItem|setItem)\(VPD_PROFILE_KEY/);
// Guard against Number('') silently converting missing sensor readings into 0.
assert.match(html, /temp\.value\.trim\(\)===''\?NaN:Number\(temp\.value\)/);
assert.match(html, /leafMeasured\.value\.trim\(\)===''\?NaN:Number\(leafMeasured\.value\)/);
assert.match(html, /rawT<Number\(temp\.min\)/);
assert.match(html, /Math\.abs\(deltaC\(rawO,u\)\)>20/);
for (const input of ['row[ak]', 'row[lk]', 'cols[ai]', 'cols[li]']) {
  assert.ok(html.includes("String("+input+"??'').trim()!==''") ||
    html.includes("String("+input+"??'').trim()===''?NaN"), 'Missing CSV value guard for '+input);
}
assert.match(html, /trendOffset\.value\.trim\(\)===''\?-1:Number\(trendOffset\.value\)/);
console.log('VPD shared storage and input validation integration ok');
