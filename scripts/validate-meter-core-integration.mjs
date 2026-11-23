import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const ph=await readFile(new URL('../site/public-route-patch/ph-meter/index.html',import.meta.url),'utf8');
const ec=await readFile(new URL('../site/public-route-patch/tds-meter/index.html',import.meta.url),'utf8');

for(const [name,html,key] of [
  ['pH',ph,'thc-ph-measurements-v1'],
  ['EC/TDS',ec,'thc-ec-measurements-v1']
]){
  assert.ok(html.includes("/assets/thc-meter-core-v1.mjs"),name+' must import the shared meter core');
  assert.ok(html.includes(key),name+' must preserve its existing storage key');
  assert.ok(!html.includes('function calibrationAgeDays('),name+' must not keep a duplicate calibration-age helper');
}

assert.ok(ph.includes('calibrationState('),'pH must use shared calibration state');
assert.ok(ph.includes('normalizeMeterRecord('),'pH must use shared meter record normalization');
assert.ok(ph.includes('validatePh('),'pH must use shared pH validation');

assert.ok(ec.includes('calibrationState('),'EC/TDS must use shared calibration state');
assert.ok(ec.includes('normalizeMeterRecord('),'EC/TDS must use shared meter record normalization');
assert.ok(ec.includes('validateEc('),'EC/TDS must use shared EC validation');

const journal=ec.split('normalizeRecord:r=>{try{')[1]?.split('catch{return null}')[0];
assert.ok(journal,'EC/TDS journal normalization must exist');
for (const factor of [500,640,650,700]) {
  assert.ok(journal.includes('ppm'+factor+':Math.round(ecToDisplayedPpm(v,'+factor+'))'), 'ppm '+factor+' must derive from validated EC');
  assert.ok(!journal.includes('r?.ppm'+factor), 'imported ppm '+factor+' must not override validated EC');
}


const backupHandler=ec.split("document.getElementById('backupEcJson').onclick=()=>")[1]?.split("document.getElementById('restoreEcJson')")[0];
assert.ok(backupHandler,'EC/TDS backup handler must exist');
assert.ok(backupHandler.includes('Array.isArray(records)'),'EC/TDS backup must reject non-array journals');
assert.ok(backupHandler.includes('records.some(r=>'),'EC/TDS backup must validate each journal record');
assert.ok(backupHandler.includes('Number.isFinite(r.ec)'),'EC/TDS backup must reject non-finite EC');
assert.ok(backupHandler.includes('r.ec<0||r.ec>20'),'EC/TDS backup must reject out-of-range EC');
assert.ok(backupHandler.includes("THC.backupJson("),'valid EC/TDS journals must remain exportable');

assert.ok(backupHandler.includes("r.tempC!=null"),'optional sample temperature must be validated in backup exports');
const backupSource=ec.split("document.getElementById('backupEcJson').onclick=()=>{")[1]?.split("document.getElementById('restoreEcJson')")[0];
assert.ok(backupSource,'EC JSON backup handler must exist');
const backupBody=backupSource.slice(0,backupSource.lastIndexOf('};'));
const backupStatus={textContent:'',setAttribute(name,value){this[name]=value}};
let backedUp=0;
let backupRecords=[{ec:1.4,tempC:22}];
const backup=runInNewContext('(()=>{'+backupBody+'})',{
  THC:{load:()=>backupRecords,backupJson:()=>{backedUp++}},
  key:'thc-ec-measurements',status:backupStatus,Array,Number,String
});
backup();
assert.equal(backedUp,1,'valid journal should export');
for(const record of [{ec:1.4,tempC:61},{ec:1.4,tempC:-1},{ec:1.4,tempC:'invalid'},{ec:1.4,tempC:[]},{ec:1.4,tempC:{}},{ec:1.4,tempC:false},{ec:'1.4',tempC:22}]){
  backupRecords=[record];
  backupStatus.textContent='';
  backup();
  assert.equal(backedUp,1,'invalid journal must not export');
  assert.match(backupStatus.textContent,/invalid measurements/,'invalid backup announces corrective error');
  assert.equal(backupStatus.role,'alert','backup failure must be announced accessibly');
}


const restoreHandler=ec.split("file.addEventListener('change',async()=>")[1];
assert.ok(restoreHandler,'EC/TDS JSON restore handler must exist');
assert.ok(!restoreHandler.includes("typeof value==='string'"),'JSON restore must reject string EC values, including numeric-looking strings');
assert.ok(restoreHandler.includes("typeof value!=='number'"),'JSON restore must reject null and nonnumeric EC types');
assert.ok(restoreHandler.includes('Number.isFinite(ec)&&ec>=0&&ec<=20'),'JSON restore must enforce finite EC range');

const restorePredicate=restoreHandler.match(/r=>(\{if\(!r[\s\S]*?\}),2000\)/)?.[1];
assert.ok(restorePredicate,'EC restore record validator must exist');
const validateRestored=runInNewContext('(r=>'+restorePredicate+')',{Number,String,Array});
assert.equal(validateRestored({ec:1.413,tempC:22}),true,'valid EC and temperature restore');
assert.equal(validateRestored({ec:1.413,tempC:null}),true,'optional temperature may be absent');
for(const ecValue of [-0.01,20.01,NaN,Infinity,null,'1.413',[],{},false]){
  assert.equal(validateRestored({ec:ecValue,tempC:22}),false,'invalid restored EC must fail');
}
assert.equal(validateRestored({ec:0,tempC:0}),true,'zero EC and temperature are valid bounds');
assert.equal(validateRestored({ec:20,tempC:60}),true,'upper supported EC and temperature bounds are valid');
for(const tempC of [-1,61,'bad',Infinity,[],{},false,true]){
  assert.equal(validateRestored({ec:1.413,tempC}),false,'invalid restored temperature must fail');
}


assert.ok(restoreHandler.includes("status.setAttribute('role','alert')"),'JSON restore errors must announce an accessible alert');
const restoreConfirmation=restoreHandler.match(/const current=THC\.load\(key,\[\]\);if\(\(!Array\.isArray\(current\)\|\|current\.length>0\)\&\&!confirm\('[^']+'\)\)return;/)?.[0];
assert.ok(restoreConfirmation,'restoration must guard non-array existing storage and nonempty journals');
const confirmRestore=(existing,answer)=>{
  let prompts=0;
  const shouldSave=Boolean(runInNewContext('(function(){'+restoreConfirmation+'return true})',{
    THC:{load:()=>existing},key:'thc-ec-measurements',Array,
    confirm:()=>{prompts++;return answer}
  })());
  return {shouldSave,prompts};
};
assert.deepEqual(confirmRestore([],false),{shouldSave:true,prompts:0},'empty journal can restore without prompting');
assert.deepEqual(confirmRestore([{ec:1}],false),{shouldSave:false,prompts:1},'declined replacement preserves nonempty journal');
assert.deepEqual(confirmRestore({malformed:true},false),{shouldSave:false,prompts:1},'declined replacement preserves malformed storage');
assert.deepEqual(confirmRestore({malformed:true},true),{shouldSave:true,prompts:1},'confirmed replacement permits restore');


const sharedObservation=ec.split("button?.addEventListener('click',()=>")[1];
assert.ok(sharedObservation,'EC/TDS shared observation handler must exist');
assert.ok(sharedObservation.includes("ecText===''?NaN:Number(ecText)"),'blank EC must not become zero in shared observations');
assert.ok(sharedObservation.includes('!Number.isFinite(ec)||ec<0||ec>20'),'shared observations must enforce EC range');
assert.ok(sharedObservation.includes("tempText===''?null:Number(tempText)"),'missing temperature must remain null');
assert.ok(sharedObservation.includes('temp<0||temp>60'),'shared observations must reject invalid temperatures');
assert.ok(sharedObservation.includes("ecInput.focus()")&&sharedObservation.includes("tempInput.focus()"),'invalid observations must focus corrective input');

const growLens=ec.split("document.getElementById('saveEcGrowLens').onclick=()=>")[1]?.split("document.getElementById('backupEcJson')")[0];
assert.ok(growLens,'GrowLens save handler must exist');
assert.ok(growLens.includes("tempText!==''")&&growLens.includes("Number(tempText)>60"),'GrowLens must reject invalid supplied temperatures');
assert.ok(growLens.includes("document.getElementById('ecSampleTemp').focus()"),'invalid GrowLens temperature must focus corrective input');
assert.ok(growLens.includes("status.setAttribute('role','alert')"),'GrowLens errors must be announced accessibly');


const reverseHandler=ec.split('function renderPPM(){')[1]?.split('function renderIdentify(){')[0];
assert.ok(reverseHandler,'EC/TDS reverse conversion handler must exist');
const reverseResult={innerHTML:''};
const reversePpm={value:'900'};
const reverseScale={value:'500'};
const reverseContext={
  ppm:reversePpm,scale:reverseScale,ecout:reverseResult,
  tdsNumericInput:input=>input.value.trim()===''?NaN:Number(input.value),
  displayedPpmToEc:(p,s)=>p/s,
  millisiemensToMicrosiemens:v=>v*1000,
  Number,Math
};
const renderReverse=runInNewContext('(function renderPPM(){'+reverseHandler+')',reverseContext);
renderReverse();
assert.ok(reverseResult.innerHTML.includes('1.80 mS/cm'),'valid reverse conversion remains available');
reversePpm.value='10001';
renderReverse();
assert.ok(reverseResult.innerHTML.includes('0–20 mS/cm'),'reverse conversion above 20 mS/cm must be rejected');
reversePpm.value=' ';
renderReverse();
assert.match(reverseResult.innerHTML,/valid displayed ppm/,'blank ppm must not become zero');
reversePpm.value='900';
reverseScale.value='invalid';
renderReverse();
assert.match(reverseResult.innerHTML,/conversion factor/,'unknown scale must be rejected');

const deltaHandler=ec.split('function renderDelta(){')[1]?.split('function render')[0]?.split("ecunit.addEventListener")[0];
assert.ok(deltaHandler,'EC/TDS source comparison handler must exist');
const deltaOut={innerHTML:''},sourceEc={value:'1.0'},finalEc={value:'2.5'};
const renderDelta=runInNewContext('(function renderDelta(){'+deltaHandler.replace(/}\s*$/,'')+'})',{
  sourceEc,finalEc,deltaOut,Number,Math,
  tdsNumericInput:input=>input.value.trim()===''?NaN:Number(input.value)
});
renderDelta();
assert.match(deltaOut.innerHTML,/\+1\.50 mS\/cm/,'valid EC delta remains available');
sourceEc.value='20.1';renderDelta();
assert.match(deltaOut.innerHTML,/0–20 mS\/cm/,'source EC above 20 must be rejected');
sourceEc.value='1';finalEc.value='20.1';renderDelta();
assert.match(deltaOut.innerHTML,/0–20 mS\/cm/,'final EC above 20 must be rejected');
finalEc.value='';renderDelta();
assert.match(deltaOut.innerHTML,/0–20 mS\/cm/,'blank final EC must be rejected');

console.log('meter core integration: ok');
