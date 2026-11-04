import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
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

assert.match(html, /\[hidden\]\{display:none!important\}/);
assert.match(html, /lastTrendRows=\[\];if\(trendPlotInstance\)/);
assert.match(html, /trendPlot'\)\?\.replaceChildren\(\)/);

// Run the real CSV parser extracted from the page with a deterministic browser shim.
const begin=html.indexOf('function parseTrendCsv(text){');
const end=html.indexOf('\nlet lastTrendRows=[];',begin);
assert.ok(begin>=0&&end>begin,'VPD CSV parser must remain extractable');
const ctx={
 trendOffset:{value:'-1'},trendUnit:{value:'c'},window:{},
 norm:header=>header.trim().toLowerCase(),
 deltaC:(v,u)=>u==='f'?v*5/9:v,
 toC:(v,u)=>u==='f'?(v-32)*5/9:v,
 rawCalc:(air,rh,leaf)=>0.6108*Math.exp(17.27*leaf/(leaf+237.3))-0.6108*Math.exp(17.27*air/(air+237.3))*rh/100,
 dewPoint:()=>-99
};
const splitBegin=html.indexOf('function splitCsvLine(line){');
assert.ok(splitBegin>=0&&splitBegin<begin,'VPD CSV line splitter must remain extractable');
const parse=runInNewContext(html.slice(splitBegin,end)+'\nparseTrendCsv',ctx);
const rows=parse('time,temp,rh\n00,26,60\n01,,60\n02,25,0\n03,25,70');
assert.equal(rows.length,2,'Invalid and empty sensor rows must be ignored');
assert.equal(rows[0].label,'00');
assert.ok(rows[0].vpd>1&&rows[0].vpd<1.3,'Default leaf VPD must agree with FAO-56 equation');
ctx.trendOffset.value='';
assert.throws(()=>parse('time,temp,rh\n00,26,60'),/valid logger leaf offset/);
ctx.trendOffset.value='-1';
assert.throws(()=>parse('time,temp,rh\n'+'00,26,60\n'.repeat(10001)),/10,000 rows/);
assert.throws(()=>parse('time,temp,rh\n'+' '.repeat(2000000)),/2 MB/);
console.log('VPD CSV parser functional regression checks ok');
