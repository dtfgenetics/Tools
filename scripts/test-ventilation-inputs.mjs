import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as math from '../site/public-route-patch/assets/thc-cultivation-math-v1.mjs';

// Execute the shipped page functions rather than duplicate the validation logic.
const html=fs.readFileSync(new URL('../site/public-route-patch/co2-ventilation/index.html',import.meta.url),'utf8');
const fields=Object.fromEntries(Object.entries({len:'10',wid:'10',hei:'10',cfm:'100',delivery:'100',roomName:'Room A'}).map(([id,value])=>[id,{value}]));
const context=vm.createContext({...math,$:id=>fields[id],airUnit:{value:'cfm'},targetAch:{value:'6'}});
const functions=html.slice(html.indexOf('function ventNumber('),html.indexOf('\nlet plans='));
vm.runInContext(functions,context);
vm.runInContext(html.slice(html.indexOf('function values(){'),html.indexOf('\nfunction render()')),context);
const plan={at:'2026-11-05T12:00:00Z',lengthFt:10,widthFt:10,heightFt:10,entered:100,deliveryPercent:100,targetAch:6,airUnit:'cfm'};
assert.equal(context.values().ach,6);
assert.equal(context.values().requiredCfm,100);
for(const id of ['len','wid','hei','cfm','delivery']){
 const old=fields[id].value;
 for(const value of ['', '   ','nonsense','Infinity']){fields[id].value=value;assert.equal(context.values().valid,false,`${id}: ${JSON.stringify(value)}`)}
 fields[id].value=old;
}
for(const key of ['lengthFt','widthFt','heightFt','entered','deliveryPercent']){
 for(const value of [null,undefined,true,false,[],[10],{},'', '  ','NaN',Infinity])assert.equal(context.normalizeVentPlan({...plan,[key]:value}),null,`${key}: ${JSON.stringify(value)}`);
}
for(const targetAch of [true,false,[],{},-1,Infinity])assert.equal(context.normalizeVentPlan({...plan,targetAch}),null);
for(const targetAch of [null,undefined,'','  '])assert.equal(context.normalizeVentPlan({...plan,targetAch}).requiredCfm,null);
assert.equal(context.normalizeVentPlan({...plan,entered:0}).ach,0);
assert.equal(context.normalizeVentPlan({...plan,entered:0}).minutesPerVolume,null);
assert.equal(context.normalizeVentPlan({...plan,targetAch:0}).requiredCfm,0);
fields.cfm.value='0';assert.equal(context.values().valid,true);fields.cfm.value='100';
for(const overflow of [{lengthFt:1e200,widthFt:1e200},{entered:1e308},{targetAch:1e308},{entered:1e-320}])assert.equal(context.normalizeVentPlan({...plan,...overflow}),null,'Nonfinite derived metrics must be rejected');
assert.equal(context.normalizeVentPlan({...plan,airUnit:'invalid'}),null);
const metric=context.normalizeVentPlan({...plan,entered:math.cfmToCubicMetersPerHour(100),airUnit:'m3h'});
assert.ok(Math.abs(metric.ach-6)<1e-9);
assert.equal(context.normalizeVentPlan({...plan,lengthFt:'10',entered:'100'}).ach,6,'Legacy numeric-string backups remain supported');
console.log('Ventilation input regressions passed: blank/typed imports, zero flow, units, overflow, and live form.');
for(const id of ['airOut','targetOut','saveVent','saveVentGrowLens'])context[id]={innerHTML:'',disabled:false};
context.THC={fmt:(x,n)=>Number.isFinite(x)?x.toFixed(n):'—'};
vm.runInContext(html.slice(html.indexOf('function render(){'),html.indexOf('\nfunction refreshRooms()')),context);
fields.cfm.value='';context.render();assert.equal(context.saveVent.disabled,true);assert.equal(context.saveVentGrowLens.disabled,true);
fields.cfm.value='0';context.render();assert.equal(context.saveVent.disabled,false);assert.match(context.airOut.innerHTML,/No air exchange at zero delivered airflow/);
