import assert from 'node:assert/strict';
import {transitionModel,transitionEquivalentFactor,effectiveLightHours} from '../site/public-route-patch/assets/thc-light-transition-v1.mjs';

assert.equal(transitionEquivalentFactor('linear'),0.5);
assert.equal(transitionEquivalentFactor('slow-edge'),1/3);
assert.equal(transitionEquivalentFactor('fast-edge'),2/3);
assert.equal(transitionModel('unknown').id,'linear');

const linear=effectiveLightHours({clockHours:12,dawnMinutes:60,duskMinutes:60,model:'linear'});
assert.equal(linear.effectiveHours,11);
const slow=effectiveLightHours({clockHours:12,dawnMinutes:60,duskMinutes:60,model:'slow-edge'});
assert.ok(Math.abs(slow.effectiveHours-(10+2/3))<1e-12);
const fast=effectiveLightHours({clockHours:12,dawnMinutes:60,duskMinutes:60,model:'fast-edge'});
assert.ok(Math.abs(fast.effectiveHours-(11+1/3))<1e-12);
assert.throws(()=>effectiveLightHours({clockHours:1,dawnMinutes:40,duskMinutes:40,model:'linear'}),/cannot exceed/);
console.log('light transition core: ok');
