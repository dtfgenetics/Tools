import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isHtmlFallback, matchesAssetMime, mediaType } from './live-verifier-response.mjs';

test('detects HTML fallback for missing JS/CSS/SVG assets', () => {
  for (const html of [
    '<!doctype html><html lang="en">',
    '   <!DOCTYPE   html><title>Fallback</title>',
    '\n\t<html><head></head><body>not JS</body></html>',
    '<HTML class="fallback"><body></body></HTML>',
    '\uFEFF<!doctype html><html></html>',
    '<!-- CDN error response --><html><body>not found</body></html>',
    '<?xml version="1.0" encoding="UTF-8"?><html><body>error</body></html>',
    '<head><title>fallback</title></head>',
    '<body class="error">404</body>',
  ]) assert.equal(isHtmlFallback(html), true, html);
});

test('does not misclassify valid JavaScript, CSS or SVG', () => {
  for (const content of [
    'export function calculate() { return 42; }',
    '  .shell { display: grid; }',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>',
    '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>',
    '<!-- SVG asset --><svg xmlns="http://www.w3.org/2000/svg"></svg>',
    'const html = "<!doctype html>";',
    '/* comment */ const page = "<html>";',
    '',
  ]) assert.equal(isHtmlFallback(content), false, content);
});

test('normalizes parameterized and mixed-case media types', () => {
  assert.equal(mediaType(' TEXT/JAVASCRIPT ; charset=utf-8'), 'text/javascript');
  assert.equal(mediaType(null), '');
});

test('accepts recognized browser JavaScript, CSS, and SVG MIME types', () => {
  for (const mime of ['text/javascript', 'application/javascript', 'application/x-javascript', 'text/ecmascript', 'application/ecmascript']) {
    assert.equal(matchesAssetMime('/assets/example.mjs', mime + '; charset=UTF-8'), true, mime);
    assert.equal(matchesAssetMime('/assets/example.js', mime), true, mime);
  }
  assert.equal(matchesAssetMime('/assets/style.css', 'text/css; charset=utf-8'), true);
  assert.equal(matchesAssetMime('/atlas/icon.svg', 'image/svg+xml'), true);
});

test('rejects HTML fallbacks, swapped content types, and unknown assets', () => {
  assert.equal(matchesAssetMime('/assets/example.mjs', 'text/html'), false);
  assert.equal(matchesAssetMime('/assets/example.mjs', 'text/css'), false);
  assert.equal(matchesAssetMime('/assets/style.css', 'application/javascript'), false);
  assert.equal(matchesAssetMime('/assets/icon.svg', 'text/html'), false);
  assert.equal(matchesAssetMime('/assets/example.js', ''), false);
  assert.equal(matchesAssetMime('/assets/readme.txt', 'text/javascript'), false);
});
