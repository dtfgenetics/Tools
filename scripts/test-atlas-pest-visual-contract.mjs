#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('site/public-route-patch/atlas/leaf-module/pest-damage/index.html', 'utf8');
assert.doesNotMatch(html, /Visual reference slot|Needed asset/i, 'Pest lesson must not claim its real visual is missing');
assert.match(html, /href="#pest-observation-title"/, 'Opening card must link to the actual diagram');
assert.match(html, /id="pest-observation-title"/, 'Linked diagram section must exist');
assert.match(html, /<svg[^>]*aria-labelledby="pest-svg-title pest-svg-desc"/, 'Diagram must expose title and description');
assert.match(html, /<desc id="pest-svg-desc">/, 'Scouting zones must be described for screen readers');
assert.match(html, /symptom photo does not identify a pest species/i, 'Visual limitations must be stated');
console.log('Pest Damage visual-link and instructional-integrity checks passed.');
