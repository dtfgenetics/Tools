import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../site/public-route-patch/tools/index.html',import.meta.url),'utf8');
for(const token of ['id="toolSearchEmpty"','id="toolSearchReset"','aria-describedby="toolSearchHelp toolSearchStatus"','No tools matched that search.','Try a broader subject','event.key===\'Escape\'','reset?.addEventListener','empty.classList.toggle(\'tool-hidden\',visible.length>0)','empty.classList.add(\'tool-hidden\')']){
 assert.ok(page.includes(token),'Missing tools search usability contract: '+token);
}
const input=page.match(/<input[^>]*id="toolSearch"[^>]*>/);
assert.ok(input,'Tool search input missing');
assert.match(input[0],/type="search"/);
assert.match(page,/<div id="toolSearchEmpty"[^>]*role="status"/);
for(const token of ["event.key==='Enter'","event.key==='/'","window.location.assign(best.href)","event.target?.isContentEditable","Press Enter to open the best match"]){
 assert.ok(page.includes(token),'Missing keyboard search contract: '+token);
}
console.log('Tools search empty-state, keyboard navigation, and reset contract passed.');
