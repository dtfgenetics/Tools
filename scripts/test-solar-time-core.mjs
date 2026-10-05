import assert from 'node:assert/strict';
import {solarTimes,clockFromDecimalHours} from '../site/public-route-patch/assets/thc-solar-time-v1.mjs';

const equinox=solarTimes({date:'2026-03-20',latitude:0,longitude:0,utcOffsetHours:0});
assert.equal(equinox.status,'ok');
assert.ok(equinox.sunriseLocalHours>5.5&&equinox.sunriseLocalHours<6.5,'Equatorial equinox sunrise should be near 06:00');
assert.ok(equinox.sunsetLocalHours>17.5&&equinox.sunsetLocalHours<18.5,'Equatorial equinox sunset should be near 18:00');
assert.ok(equinox.daylightHours>11.5&&equinox.daylightHours<12.5,'Equatorial equinox day length should be near 12 hours');
assert.equal(clockFromDecimalHours(6.5),'06:30');
assert.equal(clockFromDecimalHours(24.25),'00:15');
assert.throws(()=>solarTimes({date:'2026-03-20',latitude:91,longitude:0,utcOffsetHours:0}),/Latitude/);
const polar=solarTimes({date:'2026-12-21',latitude:80,longitude:0,utcOffsetHours:0});
assert.notEqual(polar.status,'ok');
console.log('solar time core: ok');
