import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../site/public-route-patch/atlas/root-system/water-uptake/index.html',import.meta.url),'utf8');
for(const item of ['water-pathway-title','water-pathway-description','Root cortex','and endodermis','Xylem','Substrate','Conceptual teaching illustration','Water follows gradients in water potential']){
 assert.ok(html.includes(item),'Missing water transport scientific visual content: '+item);
}
assert.match(html,/<svg\b[^>]*role="img"[^>]*aria-labelledby="water-pathway-title water-pathway-description"/);
assert.match(html,/<figcaption\b[^>]*class="caption"/);
assert.doesNotMatch(html,/<foreignObject\b/i);
console.log('Atlas water transport visual content checks passed.');
