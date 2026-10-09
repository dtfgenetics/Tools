#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const path='site/public-route-patch/atlas/atlas-study-progress-v1.js';
const source=readFileSync(path,'utf8');
assert.match(source,/dtf\.atlas\.study-progress\.v1/, 'Keep existing progress storage namespace');
assert.match(source,/\bvisited\b/, 'Visited systems must remain represented');
assert.match(source,/\bcompleted\b/, 'Completed systems must remain represented');
assert.match(source,/aria-pressed/, 'Completion toggle must expose pressed state');
assert.match(source,/textContent\s*=/, 'System title and status must use safe DOM text');
assert.doesNotMatch(source,/host\.innerHTML\s*=/, 'Do not render raw titles into HTML');
assert.match(source,/try\s*\{\s*localStorage\.setItem/, 'Blocked local storage writes must be handled');
assert.match(source,/\/atlas\/study\//, 'Dashboard destination must remain available');
console.log('Atlas study progress source contract PASS');
