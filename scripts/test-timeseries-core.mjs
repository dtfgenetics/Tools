import assert from 'node:assert/strict';
import {
  numericSummary,
  filterTimeWindow,
  latestObservation,
  groupSummary,
  bandSummary
} from '../site/public-route-patch/assets/thc-timeseries-core-v1.mjs';

assert.deepEqual(numericSummary([], 'value'),{count:0,min:null,max:null,avg:null});
assert.deepEqual(numericSummary([{value:1},{value:'2'},{value:'bad'},{value:3}], 'value'),{count:3,min:1,max:3,avg:2});
assert.deepEqual(numericSummary([{value:null},{},{value:''},{value:2}], 'value'),{count:1,min:2,max:2,avg:2});

const rows=[
  {at:'2026-09-28T16:00:00Z',zone:'A',value:1.0},
  {at:'2026-09-28T17:00:00Z',zone:'A',value:1.5},
  {at:'2026-09-28T18:00:00Z',zone:'B',value:2.0}
];
assert.equal(filterTimeWindow(rows,{from:'2026-09-28T16:30:00Z',to:'2026-09-28T18:00:00Z',dateKey:'at'}).length,2);
assert.deepEqual(groupSummary(rows,'zone','value'),{
  A:{count:2,min:1,max:1.5,avg:1.25},
  B:{count:1,min:2,max:2,avg:2}
});

assert.equal(latestObservation([{at:null,value:9},{value:8}],{dateKey:'at',now:new Date('2026-09-28T18:05:00Z')}).row,null);

const latest=latestObservation(rows,{dateKey:'at',now:new Date('2026-09-28T18:05:00Z'),staleAfterMs:10*60*1000});
assert.equal(latest.row.zone,'B');
assert.equal(latest.freshness.label,'fresh');

const old=latestObservation(rows,{dateKey:'at',now:new Date('2026-09-28T19:00:00Z'),staleAfterMs:10*60*1000});
assert.equal(old.freshness.label,'stale');

const band=bandSummary([{v:1.0},{v:1.7},{v:1.8},{v:1.9},{v:1.5}], 'v', {low:.8,high:1.6,sustainSamples:3,clearMargin:.05});
assert.equal(band.episodes,1);
assert.equal(band.activeState,'normal');

console.log('timeseries core: ok');
