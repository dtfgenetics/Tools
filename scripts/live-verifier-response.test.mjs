import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isHtmlFallback } from './live-verifier-response.mjs';

test('detects HTML fallback for missing JS/CSS/SVG assets', () => {
  for (const html of [
    '<!doctype html><html lang="en">',
    '   <!DOCTYPE   html><title>Fallback</title>',
    '\n\t<html><head></head><body>not JS</body></html>',
    '<HTML class="fallback"><body></body></HTML>',
  ]) assert.equal(isHtmlFallback(html), true, html);
});

test('does not misclassify valid JavaScript, CSS or SVG', () => {
  for (const content of [
    'export function calculate() { return 42; }',
    '  .shell { display: grid; }',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>',
    'const html = "<!doctype html>";',
  ]) assert.equal(isHtmlFallback(content), false, content);
});
