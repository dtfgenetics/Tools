import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const validator = fileURLToPath(new URL('./validate-atlas-canonical-urls.mjs', import.meta.url));
function validate(html, page = 'leaf-module/chlorosis/index.html') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-canonical-test-'));
  try {
    const file = path.join(dir, 'site/public-route-patch/atlas', page);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    return spawnSync(process.execPath, [validator], { cwd: dir, encoding: 'utf8' });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const correct = 'https://dtfseeds.com/atlas/leaf-module/chlorosis/';
const tags = (url, og = url) => `<link rel="canonical" href="${url}"><meta property="og:url" content="${og}">`;

test('accepts correct canonical and social URL', () => assert.equal(validate(tags(correct)).status, 0));
test('rejects correct domain but wrong Atlas page', () => {
  const r = validate(tags('https://dtfseeds.com/atlas/'));
  assert.equal(r.status, 1); assert.match(r.stderr, /does not match expected/);
});
test('rejects disagreeing canonical and social URLs', () => {
  const r = validate(tags(correct, 'https://dtfseeds.com/atlas/'));
  assert.equal(r.status, 1); assert.match(r.stderr, /og:url URL.*does not match expected/);
});
test('rejects duplicate canonical tags', () => {
  const r = validate(`${tags(correct)}<link href="${correct}" rel="canonical">`);
  assert.equal(r.status, 1); assert.match(r.stderr, /duplicate canonical/);
});
test('allows legacy pages without tags until metadata backfill', () => assert.equal(validate('<title>Chlorosis</title>').status, 0));
test('allows existing canonical-only legacy lesson', () => assert.equal(validate(`<link rel="canonical" href="${correct}">`).status, 0));
test('rejects query string and off-domain metadata', () => {
  assert.equal(validate(tags(`${correct}?utm_source=ad`)).status, 1);
  assert.equal(validate(tags('https://other.example/atlas/leaf-module/chlorosis/')).status, 1);
});
test('validates root index page', () => assert.equal(validate(tags('https://dtfseeds.com/atlas/'), 'index.html').status, 0));
test('recognizes attributes in either order', () => assert.equal(validate(`<link href="${correct}" rel="canonical"><meta content="${correct}" property="og:url">`).status, 0));
test('recognizes unquoted canonical attributes', () => assert.equal(validate(`<link href=${correct} rel=canonical>`).status, 0));
test('rejects empty URL attributes', () => {
  const r = validate('<link href="" rel="canonical">');
  assert.equal(r.status, 1); assert.match(r.stderr, /missing canonical URL/);
});
test('ignores commented-out stale metadata', () => assert.equal(validate(`<!-- <link rel="canonical" href="https://dtfseeds.com/atlas/"> -->${tags(correct)}`).status, 0));
test('rejects fragments and noncanonical normalization', () => {
  assert.equal(validate(tags(`${correct}#top`)).status, 1);
  assert.equal(validate(tags('https://dtfseeds.com:443/atlas/leaf-module/chlorosis/')).status, 1);
});
