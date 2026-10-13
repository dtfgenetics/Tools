import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateObservation } from '../site/public-route-patch/atlas/diagnostics/evidence-intake/observation-validation.mjs';

const root = new URL('../site/public-route-patch/atlas/diagnostics/', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const html = read('evidence-intake/index.html');
const formJs = read('evidence-intake/observation-demo.mjs');
const spec = JSON.parse(read('evidence-intake/root-zone-observation-template.json'));
const landing = read('index.html');

assert.match(landing, /href="\/atlas\/diagnostics\/evidence-intake\/"/, 'landing page must link intake');
assert.match(html, /<form id="intake"/);
assert.match(html, /<meta name="viewport"/);
assert.match(html, /role="alert"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /src="\.\/observation-demo\.mjs"/);
assert.match(formJs, /fetch\('\.\/root-zone-observation-template\.json'\)/);
assert.match(formJs, /collectObservation\(form,spec\)/);
assert.match(formJs, /validateObservation\(values,spec\)/);
assert.match(formJs, /JSON\.stringify\(payload,null,2\)/);
assert.match(formJs, /URL\.createObjectURL/);
assert.ok(spec.schemaVersion === 1 && spec.fields.length === 13);
assert.equal(new Set(spec.fields.map(f => f.id)).size, spec.fields.length);

const record = { recordedAt: '2026-10-12T15:00', medium: 'soil', containerLiters: '11', soilPH:'7.2', method:'soil extract', sampleLocation:'root zone' };
const success = validateObservation(record, spec);
assert.equal(success.ok, true, success.errors.join('; '));
assert.equal(success.record.soilPH, 7.2);
assert.equal(success.record.soilEC, null);
assert.equal(validateObservation({...record,method:''},spec).ok, false);
assert.equal(validateObservation({...record,sampleLocation:''},spec).ok, false);
assert.equal(validateObservation({...record,soilPH:'15'},spec).ok, false);
assert.equal(validateObservation({...record,recordedAt:'2026-02-30T15:00'},spec).ok, false);
assert.equal(validateObservation({...record,containerLiters:'-1'},spec).ok, false);
console.log('Atlas intake source-route and validation contract passed');
