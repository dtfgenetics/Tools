import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {
  celsiusToFahrenheit, litersToGallons, centimetersToInches,
  squareMetersToSquareFeet, gramsToOunces, millisiemensToMicrosiemens,
  cfmToCubicMetersPerHour
} from '../site/public-route-patch/assets/thc-cultivation-math-v1.mjs';

// Execute the actual page normalizer against real shared math functions.
// Delimit by adjacent named functions; fail closed when the page structure changes.
const html=fs.readFileSync(new URL('../site/public-route-patch/unit-converter/index.html',import.meta.url),'utf8');
const match=html.match(/function normalizeSnapshot\(x\)\{[\s\S]*?\n\}\n(?=function currentSnapshot)/);
assert.ok(match,'Unit Converter normalizer missing or moved');
const normalizeSnapshot=vm.runInNewContext('('+match[0].trim()+')',{
  celsiusToFahrenheit,litersToGallons,centimetersToInches,squareMetersToSquareFeet,
  gramsToOunces,millisiemensToMicrosiemens,cfmToCubicMetersPerHour,
  Number,Date,Object
});
const sample={
  at:'2026-10-10T00:00:00.000Z',c:25,f:77,liters:10,gallons:2.64,
  cm:100,inch:39.37,sqm:1,sqft:10.76,grams:1000,ounces:35.27,
  ms:1.8,us:1800,cfm:100,m3h:169.9
};
const restored=normalizeSnapshot({...sample,f:9999,gallons:9999,us:9999});
assert.ok(restored,'Valid snapshot should restore');
assert.equal(restored.f,77,'Fahrenheit must be recomputed');
assert.equal(restored.us,1800,'Microsiemens must be recomputed');
assert.ok(Math.abs(restored.gallons-litersToGallons(10))<1e-10,'US gallons must be recomputed');
for(const bad of [
  {...sample,liters:''},{...sample,liters:'   '},{...sample,liters:null},
  {...sample,liters:undefined},{...sample,liters:false},{...sample,liters:'NaN'},
  {...sample,c:-274},{...sample,cm:-1},{...sample,at:'not-a-date'}
])assert.equal(normalizeSnapshot(bad),null,'Reject missing, malformed, or impossible saved measurements');
console.log('Unit Converter snapshot behavioral regression checks passed.');
