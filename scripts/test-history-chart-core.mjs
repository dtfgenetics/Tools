import assert from 'node:assert/strict';
import {historyBarModel} from '../site/public-route-patch/assets/thc-history-chart-v1.mjs';

const zero=historyBarModel([{v:0},{v:5},{v:10}],{valueKey:'v',format:v=>v.toFixed(0),unit:'kPa'});
assert.equal(zero.length,3);
assert.equal(zero[0].heightPct,3);
assert.equal(zero[2].heightPct,100);
assert.equal(zero[1].label,'5');
assert.equal(zero[1].title,'5 kPa');

const extent=historyBarModel([{v:20},{v:25},{v:30}],{valueKey:'v',scale:'extent',format:v=>v.toFixed(1)});
assert.equal(extent[0].heightPct,8);
assert.equal(extent[2].heightPct,100);
assert.ok(extent[1].heightPct>8&&extent[1].heightPct<100);

const warned=historyBarModel([{v:.7},{v:1.2},{v:1.8}],{valueKey:'v',warn:v=>v<.8||v>1.6});
assert.deepEqual(warned.map(x=>x.warn),[true,false,true]);

const clipped=historyBarModel(Array.from({length:20},(_,i)=>({v:i})),{valueKey:'v',maxItems:12});
assert.equal(clipped.length,12);
assert.equal(clipped[0].value,8);
assert.equal(clipped.at(-1).value,19);

console.log('history chart core ok');
