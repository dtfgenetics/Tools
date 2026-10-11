import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../site/public-route-patch/atlas/root-system/rhizosphere/index.html',import.meta.url),'utf8');
assert.match(html,/<svg\b[^>]*role="img"[^>]*aria-labelledby="rhizosphere-cycle-title rhizosphere-cycle-desc"/);
assert.match(html,/<title id="rhizosphere-cycle-title">/);
assert.match(html,/<desc id="rhizosphere-cycle-desc">/);
assert.match(html,/<figcaption class="caption">Conceptual pathway, not a diagnostic flowchart/);
for(const text of ['Root exudates','Microbial','transformations','root uptake','Water availability','Oxygen','Salinity','not proof'])assert.ok(html.includes(text),'Missing educational content: '+text);
console.log('Rhizosphere visualization accessibility and scientific-boundary checks passed.');
