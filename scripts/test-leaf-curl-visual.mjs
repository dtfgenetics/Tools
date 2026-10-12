import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../site/public-route-patch/atlas/leaf-module/leaf-curl/index.html',import.meta.url),'utf8');
assert.match(html,/<svg\b[^>]*role="img"[^>]*aria-labelledby="curl-figure-title curl-figure-desc"/);
assert.match(html,/<title id="curl-figure-title">/);
assert.match(html,/<desc id="curl-figure-desc">/);
for(const phrase of ['Upward margins','Downward tip','Distorted growth','not diagnostic signatures','Document direction, tissue age','Curl direction is an observation, not a diagnosis.']){
 assert.ok(html.includes(phrase),'Missing scientific visual contract: '+phrase);
}
assert.ok((html.match(/<path\b/g)||[]).length>=3,'Diagram must contain three distinct illustrative leaf paths');

assert.ok(!/<image\b|<foreignObject\b/i.test(html), 'Diagram must not depend on external image or embedded HTML assets');
assert.match(html, /<figcaption\b[^>]*>/, 'Diagram must include a visible explanatory caption');
assert.ok((html.match(/<text\b/g)||[]).length >= 4, 'Diagram must have visible labels and uncertainty note');
console.log('Leaf curl diagram semantic and educational checks passed.');
