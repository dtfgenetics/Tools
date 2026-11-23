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

const backupHandler=ec.split("document.getElementById('backupEcJson').onclick=()=>")[1]?.split("document.getElementById('restoreEcJson')")[0];
assert.ok(backupHandler,'EC/TDS backup handler must exist');
assert.ok(backupHandler.includes('Array.isArray(records)'),'EC/TDS backup must reject non-array journals');
assert.ok(backupHandler.includes('records.some(r=>'),'EC/TDS backup must validate each journal record');
assert.ok(backupHandler.includes('Number.isFinite(r.ec)'),'EC/TDS backup must reject non-finite EC');
assert.ok(backupHandler.includes('r.ec<0||r.ec>20'),'EC/TDS backup must reject out-of-range EC');
assert.ok(backupHandler.includes("THC.backupJson("),'valid EC/TDS journals must remain exportable');

const restoreHandler=ec.split("file.addEventListener('change',async()=>")[1];
assert.ok(restoreHandler,'EC/TDS JSON restore handler must exist');
assert.ok(restoreHandler.includes("status.setAttribute('role','alert')"),'JSON restore errors must be announced to assistive technology');
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
assert.equal(validateRestored({ec:0,tempC:0}),true,'zero EC and zero temperature are valid bounds');
assert.equal(validateRestored({ec:20,tempC:60}),true,'upper supported EC and temperature bounds are valid');
for(const tempC of [-1,61,'bad',Infinity,[],{},false,true]){
  assert.equal(validateRestored({ec:1.413,tempC}),false,'invalid restore temperature must fail');
}

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


// Source-water comparisons must use the same supported EC domain as the meter.
const deltaHandler=ec.split('function renderDelta(){')[1]?.split("ecunit.addEventListener('change'")[0];
assert.ok(deltaHandler,'EC/TDS source-water comparison handler must exist');
const sourceEc={value:'1.0'},finalEc={value:'2.5'},deltaOut={innerHTML:''};
const renderDelta=runInNewContext('(function renderDelta(){'+deltaHandler+')',{
 sourceEc,finalEc,deltaOut,tdsNumericInput:input=>input.value.trim()===''?NaN:Number(input.value),
 Number,Math
});
renderDelta();
assert.match(deltaOut.innerHTML,/\+1\.50 mS\/cm/,'valid source-water delta must remain available');
sourceEc.value='20.1';
renderDelta();
assert.match(deltaOut.innerHTML,/0–20 mS\/cm/,'source EC above supported range must fail');
sourceEc.value='1.0';
finalEc.value='20.1';
renderDelta();
assert.match(deltaOut.innerHTML,/0–20 mS\/cm/,'final EC above supported range must fail');
finalEc.value=' ';
renderDelta();
assert.match(deltaOut.innerHTML,/0–20 mS\/cm/,'blank final EC must fail');


// JSON backups must not silently export invalid optional sample temperatures.
const backupTempHandler=ec.split("document.getElementById('backupEcJson').onclick=()=>{")[1]?.split("document.getElementById('restoreEcJson')")[0];
assert.ok(backupTempHandler,'EC JSON backup handler must exist');
assert.match(backupTempHandler,/r\.tempC!==null/,'optional sample temperature must be validated');
assert.match(backupTempHandler,/Number\(r\.tempC\)>60/,'temperature above 60 C must fail');
assert.match(backupTempHandler,/Number\(r\.tempC\)<0/,'temperature below 0 C must fail');


// Execute the real backup handler: invalid journal records must not be exported.
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

// Execute JSON restore's real change listener, not just its predicate.
const restoreScript=ec.split("file.addEventListener('change',async()=>{")[1]?.split("\n})();")[0];
assert.ok(restoreScript,'JSON restore event handler must exist');
const restoreCallbackSource="(async()=>{"+restoreScript.slice(0,restoreScript.lastIndexOf('});'))+"})";
const restoreFile={files:[{name:'measurements.json'}],value:'measurements.json'};
const restoreStatus={textContent:'',setAttribute(name,value){this[name]=value}};
let persisted=null, reloads=0, confirmationCount=0;
let restorePayload=[{ec:1.4,tempC:22}];
let existingJournal=[];
let allowReplace=true;
const restoreTHC={
  restoreJson:async(_file,_type,_version,validate)=>{if(!restorePayload.every(validate))throw new Error('Invalid restored record');return restorePayload},
  load:()=>existingJournal,save:(_key,records)=>{persisted=records}
};
const restoreEvent=runInNewContext(restoreCallbackSource,{
  THC:restoreTHC,file:restoreFile,key:'thc-ec-measurements-v1',status:restoreStatus,
  location:{reload:()=>{reloads++}},confirm:()=>{confirmationCount++;return allowReplace},
  Number,String,Array
});
await restoreEvent();
assert.equal(persisted,restorePayload,'valid JSON restore must persist validated records');
assert.equal(reloads,1,'valid JSON restore must reload journal');
assert.equal(restoreFile.value,'','restore file selection must clear');
restorePayload=[{ec:1.4,tempC:61}];
persisted=null;restoreStatus.textContent='';restoreStatus.role='';
restoreFile.value='measurements.json';
await restoreEvent();
assert.equal(persisted,null,'invalid JSON restore must not persist');
assert.equal(reloads,1,'invalid JSON restore must not reload');
assert.equal(restoreStatus.role,'alert','restore failure must be announced');
assert.match(restoreStatus.textContent,/Invalid restored record/);
assert.equal(restoreFile.value,'','invalid restore must clear file selection');
assert.equal(confirmationCount,0,'empty journal must not request replacement confirmation');

// Restore must reject malformed EC and temperature payloads without mutating stored data.
for(const record of [
  {ec:-0.01,tempC:22},{ec:20.01,tempC:22},{ec:'1.4',tempC:22},
  {ec:null,tempC:22},{ec:false,tempC:22},{ec:[],tempC:22},
  {ec:1.4,tempC:-1},{ec:1.4,tempC:'invalid'},
  {ec:1.4,tempC:[]},{ec:1.4,tempC:false}
]){
  restorePayload=[record];
  persisted=null;
  restoreStatus.textContent='';
  restoreStatus.role='';
  restoreFile.value='measurements.json';
  await restoreEvent();
  assert.equal(persisted,null,'malformed restore must not persist records');
  assert.equal(reloads,1,'malformed restore must not reload');
  assert.equal(restoreStatus.role,'alert','malformed restore must announce an error');
  assert.equal(restoreFile.value,'','malformed restore must reset file selection');
}
assert.equal(confirmationCount,0,'invalid restores must not request replacement confirmation');

// Corrupted existing journal storage must never be silently overwritten on restore.
restorePayload=[{ec:1.4,tempC:22}];
existingJournal={corrupt:true};
allowReplace=false;
persisted=null;
restoreFile.value='measurements.json';
await restoreEvent();
assert.equal(confirmationCount,1,'malformed existing journal must prompt before replacement');
assert.equal(persisted,null,'declining replacement must preserve existing storage');
assert.equal(reloads,1,'declining replacement must not reload');
assert.equal(restoreFile.value,'','cancelled restore must clear file selection');
allowReplace=true;
restoreFile.value='measurements.json';
await restoreEvent();
assert.equal(confirmationCount,2,'confirmed malformed journal replacement must prompt');
assert.equal(persisted,restorePayload,'confirmed replacement must persist valid restored data');
assert.equal(reloads,2,'confirmed replacement must reload journal');

console.log('meter core integration: ok');
