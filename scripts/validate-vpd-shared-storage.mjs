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

// Rows with explicit malformed sensor readings must never masquerade as estimated values.
const csvWithLeaf='time,temp,rh,leaf_temp,leaf_offset\n' +
 '00,26,60,25,\n' +
 '01,26,60,invalid,\n' +
 '02,26,60,,invalid\n' +
 '03,26,60,,0\n' +
 '04,26,60,,25\n' +
 '05,26,60,,';
const expected=parse(csvWithLeaf);
assert.equal(expected.length,3,'Fallback parser must reject malformed leaf and offset values');
assert.deepEqual(Array.from(expected, r=>r.label),['00','03','05']);
assert.equal(expected[1].leaf,26,'Explicit zero offset must not be treated as missing');
assert.equal(expected[2].leaf,25,'Blank optional leaf readings use the configured estimate');
const headers=['time','temp','rh','leaf_temp','leaf_offset'];
ctx.window.Papa={parse:()=>({meta:{fields:headers},errors:[],data:csvWithLeaf.split('\n').slice(1).filter(Boolean).map(row=>{
 const cols=row.split(',');return Object.fromEntries(headers.map((h,i)=>[h,cols[i]]))
})})};
const papaRows=parse(csvWithLeaf);
assert.equal(papaRows.length,3,'Papa Parse must reject the same malformed readings');
assert.deepEqual(Array.from(papaRows,r=>r.label),['00','03','05']);
assert.equal(papaRows[1].leaf,26);
ctx.window.Papa=null;

console.log('VPD CSV parser functional regression checks ok');


// Exercise the on-page renderer rather than only matching its source.
const renderStart=html.indexOf('function targetRange(){');
const renderEnd=html.indexOf('\nfunction readVpdProfiles()',renderStart);
assert.ok(renderStart>=0&&renderEnd>renderStart);
const air={value:'26',min:'5',max:'45'}, humidity={value:'60'}, leafOffset={value:'-1'};
const display={temp:air,rh:humidity,offset:leafOffset,unit:{value:'c'},leafMode:{value:'offset'},
 leafMeasured:{value:'25',min:'0',max:'55'},offsetField:{hidden:false},leafMeasuredField:{hidden:true},
 vpdTargetLow:{value:'0.8'},vpdTargetHigh:{value:'1.2'},
 vout:{innerHTML:''},scenario:{innerHTML:''},chart:{innerHTML:''},
 toC:(v,u)=>u==='f'?(v-32)*5/9:v,
 fromC:(v,u)=>u==='f'?v*9/5+32:v,
 deltaC:(v,u)=>u==='f'?v*5/9:v,
 leafVpd:(a,h,l)=>0.6108*Math.exp(17.27*l/(l+237.3))-0.6108*Math.exp(17.27*a/(a+237.3))*h/100,
 airVpd:(a,h)=>0.6108*Math.exp(17.27*a/(a+237.3))*(1-h/100),
 dewPoint:()=>18,relativeHumidityForLeafVpd:()=>60
};
display.rawCalc=display.leafVpd;
display.calc=(...args)=>Math.max(0,display.rawCalc(...args));
const renderPage=runInNewContext(html.slice(renderStart,renderEnd)+'\nrender',display);
renderPage();
assert.match(display.vout.innerHTML,/Leaf–dew-point margin<\/span><b>7\.0 °C/);
assert.doesNotMatch(display.vout.innerHTML,/Leaf–dew-point margin<\/span><b>25\.0 °C/);
assert.ok(display.chart.innerHTML.length>0,'Valid conditions must render a heatmap');
air.value='';
renderPage();
assert.match(display.vout.innerHTML,/Enter valid conditions/);
assert.equal(display.chart.innerHTML,'','Invalid inputs must clear stale heatmap cells');
air.value='26';display.leafMode.value='measured';display.leafMeasured.value='';
renderPage();
assert.match(display.vout.innerHTML,/valid measured leaf temperature/);
assert.equal(display.chart.innerHTML,'');

// Saved profiles must not silently coerce blanks to 0 or overwrite 0 margin.
const profileStart=html.indexOf('function normalizeVpdProfile(x){');
const profileEnd=html.indexOf("\ndocument.getElementById('saveVpdProfile')",profileStart);
assert.ok(profileStart>=0&&profileEnd>profileStart);
const normalize=runInNewContext(html.slice(profileStart,profileEnd)+'\nnormalizeVpdProfile',{deltaC:display.deltaC});
const profile={unit:'c',temp:'26',rh:'60',leafMode:'offset',offset:'-1',
 leafMeasured:'25',targetLow:'0.8',targetHigh:'1.2',sustain:'3',clearMargin:'0'};
assert.equal(normalize(profile).clearMargin,'0');
assert.equal(normalize({...profile,temp:''}),null);
assert.equal(normalize({...profile,rh:''}),null);
assert.equal(normalize({...profile,targetHigh:''}),null);
assert.equal(normalize({...profile,offset:'21'}),null);
assert.equal(normalize({...profile,leafMode:'measured',leafMeasured:''}),null);
assert.match(html,/Enter valid conditions before saving to GrowLens/);
assert.match(html,/if\(result\.ok\)\{collectManualCultivationMeasurement/);
console.log('VPD rendered dew margin, stale UI and profile validation regression ok');
