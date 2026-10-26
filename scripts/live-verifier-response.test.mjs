import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isHtmlFallback } from './live-verifier-response.mjs';

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
