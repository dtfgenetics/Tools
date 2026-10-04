import assert from 'node:assert/strict';
import {dliFromPpfd,ppfdFromDli,integrateDli,leafVpd,relativeHumidityForLeafVpd,serialDilution,airChangesPerHour,deliveredCfmForAirChanges} from '../site/public-route-patch/assets/thc-cultivation-math-v1.mjs';

assert.equal(dliFromPpfd(0,18),0);
assert.equal(ppfdFromDli(0,18),0);
assert.ok(Math.abs(integrateDli([{ppfd:500,hours:0},{ppfd:500,hours:12}])-21.6)<=1e-9);
assert.ok(leafVpd(25,100,25)===0);
const targetRh=relativeHumidityForLeafVpd(26,25,1.0);
assert.ok(targetRh>60&&targetRh<70);
assert.ok(Math.abs(leafVpd(26,targetRh,25)-1.0)<1e-9);
assert.deepEqual(serialDilution({initialConcentration:10,targetConcentration:10,stepFactor:10,finalVolume:100}),[]);
assert.equal(airChangesPerHour(0,800),0);
assert.equal(deliveredCfmForAirChanges(0,800),0);
assert.throws(()=>ppfdFromDli(10,0),/Photoperiod/);
assert.throws(()=>serialDilution({initialConcentration:100,targetConcentration:10,stepFactor:1,finalVolume:10}),/Step factor/);
console.log('Cultivation math edge cases passed.');
