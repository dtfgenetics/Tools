import assert from 'node:assert/strict';
import {buildTimeSeriesData} from '../site/public-route-patch/assets/thc-timeseries-chart-v1.mjs';

const rows=[
  {at:'2026-09-29T12:20:00Z',a:3,b:null},
  {at:'bad',a:9,b:9},
  {at:'2026-09-29T12:00:00Z',a:1,b:5},
  {at:'2026-09-29T12:10:00Z',a:2,b:6}
];
const data=buildTimeSeriesData(rows,{series:[{key:'a'},{key:'b'}]});
assert.equal(data.timestamps.length,3);
assert.deepEqual(data.series[0],[1,2,3]);
assert.deepEqual(data.series[1],[5,6,null]);
const missing=buildTimeSeriesData([{at:'2026-09-29T12:00:00Z',v:null},{at:'2026-09-29T12:01:00Z',v:''},{at:'2026-09-29T12:02:00Z',v:0}],{series:[{key:'v'}]});
assert.deepEqual(missing.series[0],[0]);
assert.equal(data.rows[0].a,1);
assert.equal(data.rows.at(-1).a,3);

const custom=buildTimeSeriesData([{t:1,v:'4'}],{dateKey:r=>new Date(r.t*1000),series:[{value:r=>r.v}]});
assert.equal(custom.timestamps[0],1);
assert.equal(custom.series[0][0],4);

console.log('time-series chart core ok');
