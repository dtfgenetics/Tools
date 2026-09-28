import fs from 'node:fs';
import path from 'node:path';
import {
  dewPoint,
  airChangesPerHour,
  deliveredCfmForAirChanges,
  dliFromPpfd,
  drybackPercent,
  fertilizerMassGrams
} from '../public/assets/thc-cultivation-math-v1.mjs';

const root=process.cwd();
const errors=[];
const ok=(v,m)=>{if(!v)errors.push(m)};
const near=(a,b,t=1e-9)=>Math.abs(a-b)<=t;

for(const file of [
  'public/assets/thc-tool-suite-v1.css',
  'public/assets/thc-tool-suite-v1.js',
  'public/assets/thc-cultivation-math-v1.mjs',
  'public/assets/thc-light-lab-math-v1.mjs',
  'public/assets/thc-measurement-journal-v1.js',
  'public/assets/breeder-pedigree-graph-v1.js'
]) ok(fs.existsSync(path.join(root,file)),file+' missing');

ok(Math.abs(dewPoint(24,65)-17.0)<0.3,'dew-point fixture failed');
ok(near(fertilizerMassGrams(150,100,10),150),'fertigation mass fixture failed');
ok(near(drybackPercent(5,2,4.1),30),'dryback fixture failed');
ok(near(airChangesPerHour(300,10*10*8),22.5),'ventilation ACH fixture failed');
ok(near(deliveredCfmForAirChanges(22.5,10*10*8),300),'reverse ventilation fixture failed');
ok(near(dliFromPpfd(700,12),30.24),'DLI fixture failed');

const shell=fs.readFileSync(path.join(root,'public/assets/thc-tool-suite-v1.js'),'utf8');
for(const token of ['thc-cultivation-context-v1','thc-growlens-state-v1','addEnvironmentReading','addIrrigationRecord','addObservation','addDiaryEntry']) {
  ok(shell.includes(token),'shared shell missing integration token: '+token);
}

if(errors.length){console.error('Shared runtime test failed:');for(const e of errors)console.error(' - '+e);process.exit(1)}
console.log('Shared runtime tests passed.');
