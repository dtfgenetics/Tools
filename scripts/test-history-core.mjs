import assert from 'node:assert/strict';
import {
  filterRecords,
  uniqueFieldValues,
  latestByGroup,
  numericSpread,
  csvRow,
  csvTable,
  sanitizeHistory,
  numericValue
} from '../site/public-route-patch/assets/thc-history-core-v1.mjs';

const rows=[
  {at:'2026-09-28T16:00:00Z',zone:'A',stage:'Veg',sensor:'S1',value:1},
  {at:'2026-09-28T17:00:00Z',zone:'A',stage:'Flower',sensor:'S1',value:2},
  {at:'2026-09-28T18:00:00Z',zone:'B',stage:'Flower',sensor:'S2',value:4},
  {at:'bad',zone:'B',stage:'Flower',sensor:'S2',value:null}
];

assert.equal(filterRecords(rows,{zone:'A'}).length,2);
assert.equal(filterRecords(rows,{zone:'A',stage:'Flower'}).length,1);
assert.equal(filterRecords(rows,{zone:''}).length,4);
assert.deepEqual(uniqueFieldValues(rows,'zone'),['A','B']);
assert.deepEqual(uniqueFieldValues([{x:null},{x:''},{x:'B'},{x:'A'},{x:'A'}],'x'),['A','B']);

const latest=latestByGroup(rows,'sensor','at');
assert.equal(latest.length,2);
assert.equal(latest.find(x=>x.key==='S1').row.value,2);
assert.equal(latest.find(x=>x.key==='S2').row.value,4);

assert.equal(numericSpread(rows,'value'),3);
assert.equal(numericSpread([{value:null},{value:''},{value:2}],'value'),0);
assert.equal(numericSpread([{value:null},{value:''}],'value'),null);
assert.equal(numericValue(null),null);
assert.equal(numericValue(''),null);
assert.equal(numericValue('2.5'),2.5);
assert.equal(numericValue('bad'),null);

assert.equal(csvRow(['a,b','he said "hi"','line\nbreak',null]),'"a,b","he said ""hi""","line\nbreak",""');
assert.deepEqual(csvTable(['a','b'],[{a:'x',b:'y,z'}],r=>[r.a,r.b]),['"a","b"','"x","y,z"']);

const clean=sanitizeHistory(
  [{v:1},{v:'bad'},{v:2},{v:3}],
  {limit:2,validator:r=>Number.isFinite(Number(r.v)),normalize:r=>({v:Number(r.v)})}
);
assert.deepEqual(clean,[{v:2},{v:3}]);

console.log('history core: ok');
