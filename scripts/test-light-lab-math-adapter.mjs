import assert from 'node:assert/strict';
import {calculateStableLight,calculateVariableLight,dliRangeForMap} from '../site/public-route-patch/assets/thc-light-lab-math-v1.mjs';

const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
const stable=calculateStableLight({ppfd:700,hours:12,targetDli:30.24});
near(stable.dli,30.24);near(stable.requiredPpfd,700);
const variable=calculateVariableLight([{ppfd:300,hours:1},{ppfd:700,hours:10},{ppfd:300,hours:1}]);
near(variable.dli,27.36);near(variable.hours,12);assert.equal(variable.segments.length,3);
assert.equal(variable.validDay,true);
const impossible=calculateVariableLight([{ppfd:700,hours:12},{ppfd:700,hours:13}]);
assert.equal(impossible.hours,25);
assert.equal(impossible.validDay,false);
assert.equal(impossible.dli,null);
const range=dliRangeForMap([500,700,900],12);near(range.min,21.6);near(range.max,38.88);
assert.equal(dliRangeForMap([],12),null);

// A blank or malformed block must not disappear and leave a plausible partial DLI.
for(const blocks of [
 [{ppfd:700,hours:12},{ppfd:'',hours:2}],
 [{ppfd:700,hours:12},{ppfd:100,hours:''}],
 [{ppfd:700,hours:12},{ppfd:3500,hours:2}],
 [{ppfd:700,hours:12},{ppfd:'not a number',hours:2}],
 [{ppfd:700,hours:12},null]
]){
 const result=calculateVariableLight(blocks);
 assert.equal(result.validDay,false,'invalid block must invalidate the schedule');
 assert.equal(result.dli,null,'invalid block must withhold integrated DLI');
 assert.equal(result.invalidSegments,1,'invalid block must be counted');
}
assert.equal(calculateVariableLight([{ppfd:'0',hours:'0'}]).validDay,true,'explicit numeric zero is allowed');
assert.equal(calculateVariableLight([{ppfd:'',hours:''}]).validDay,false,'initial blank schedule must not be valid');

console.log('Light Lab math adapter passed.');
