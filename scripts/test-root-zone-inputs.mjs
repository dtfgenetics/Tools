import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../site/public-route-patch/root-zone-temperature/index.html',import.meta.url),'utf8');
const context=vm.createContext({rzt:{value:'20'},rat:{value:'24'},solutionT:{value:'21'},feedRootEc:{value:''},measuredRootEc:{value:''}});
vm.runInContext(html.slice(html.indexOf('function rootNumber('),html.indexOf('\nlet history=')),context);
vm.runInContext(html.match(/function values\(\)\{[^\n]+/)[0],context);
assert.equal(context.values().valid,true);
assert.equal(context.values().rootAirDelta,-4);
for(const name of ['rzt','rat','solutionT']){
 const old=context[name].value;
 for(const bad of ['', '   ','nonsense','-274','Infinity']){context[name].value=bad;assert.equal(context.values().valid,false,`${name}: ${JSON.stringify(bad)}`)}
 context[name].value='0';assert.equal(context.values().valid,true,'Measured zero Celsius remains valid');context[name].value=old;
}
const record={at:'2026-11-05T12:00:00Z',timing:'Lights on',root:20,air:24,solution:21};
for(const key of ['root','air','solution'])for(const value of [null,undefined,true,false,[],{},'', ' ',Infinity,-274])assert.equal(context.normalizeRootRecord({...record,[key]:value}),null,`${key}: ${JSON.stringify(value)}`);
for(const key of ['feedEc','rootEc'])for(const value of [true,false,[],{},'invalid',-1])assert.equal(context.normalizeRootRecord({...record,[key]:value}),null);
assert.equal(context.normalizeRootRecord({...record,root:'0'}).root,0);
assert.equal(context.normalizeRootRecord(record).feedEc,null);
assert.equal(context.normalizeRootRecord({...record,feedEc:0,rootEc:1.5}).ecDelta,1.5);
assert.equal(context.normalizeRootRecord({...record,root:1e308,air:1e308,solution:1e308}).rootAirDelta,0);
console.log('Root-zone measurement validation passed: required inputs, zero temperatures, restore types and optional EC.');
context.rootOut={innerHTML:''};context.saveRoot={disabled:false};context.saveRootGrowLens={disabled:false};context.THC={fmt:(x,n)=>Number.isFinite(x)?x.toFixed(n):'—'};
vm.runInContext(html.slice(html.indexOf('function render(){'),html.indexOf('function baseFilteredHistory()')),context);
context.rzt.value='';context.render();assert.equal(context.saveRoot.disabled,true);assert.equal(context.saveRootGrowLens.disabled,true);assert.match(context.rootOut.innerHTML,/Complete all three temperature fields/);
context.rzt.value='0';context.render();assert.equal(context.saveRoot.disabled,false);assert.match(context.rootOut.innerHTML,/Root zone 0.0 °C/);
