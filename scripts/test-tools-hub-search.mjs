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


// Execute the real inline script against a small deterministic DOM fixture.
// Static string checks alone cannot detect divergent search vs Enter rankings.
import vm from 'node:vm';
const script=page.slice(page.lastIndexOf('<script>')+8,page.lastIndexOf('</script>')).trim();
assert.ok(script.includes('function scoreCard'),'Missing interactive tool search');
new vm.Script(script,{filename:'tools-hub-search.js'});
function classes(){
 const active=new Set();
 return {contains:n=>active.has(n),add:n=>active.add(n),toggle(n,state){if(state===undefined)state=!active.has(n);state?active.add(n):active.delete(n);}};
}
function fixture(spec=[['Root Zone Temperature','/fixture-temperature/'],['Root Zone','/fixture-exact/']]){
 const handlers=new Map(),events=new Map(),visited=[];
 const input={value:'',addEventListener(n,fn){handlers.set('input:'+n,fn);},focus(){this.focused=true;}};
 const status={textContent:''},empty={classList:classes()};
 const reset={addEventListener(n,fn){handlers.set('reset:'+n,fn);}};
 const card=(title,href)=>({textContent:title,classList:classes(),querySelector(s){
   if(s==='a[href]')return {getAttribute:n=>n==='href'?href:null};
   if(s==='strong')return {textContent:title};
   return null;
 }});
 const cards=spec.map(([title,href])=>card(title,href));
 const panel={appendChild(c){const i=cards.indexOf(c);if(i>=0)cards.splice(i,1);cards.push(c);}};
 const group={classList:classes(),open:false,querySelectorAll:s=>s==='.measure-panel article'?cards:[],querySelector:s=>s==='.measure-panel'?panel:null};
 const document={getElementById:id=>({toolSearch:input,toolSearchStatus:status,toolSearchEmpty:empty,toolSearchReset:reset})[id]||null,querySelectorAll:s=>s==='#expanded-tools .tool-group'?[group]:[],addEventListener(n,fn){events.set(n,fn);}};
 const window={location:{assign(url){visited.push(url);}}};
 vm.runInNewContext(script,{document,window});
 return {input,status,empty,reset,cards,handlers,events,visited,event(key){return {key,preventDefault(){this.prevented=true;}};}};
}
{
 const t=fixture();
 assert.equal(t.status.textContent,'2 tools shown');
 t.input.value='  root   zone  ';
 t.handlers.get('input:input')();
 assert.match(t.status.textContent,/best: Root Zone$/);
 const e=t.event('Enter');t.handlers.get('input:keydown')(e);
 assert.equal(e.prevented,true);
 assert.deepEqual(t.visited,['/fixture-exact/'],'Enter must choose the same top-ranked match as live filtering');
}
{
 const t=fixture();
 t.input.value='unmatched-query-xyz';
 t.handlers.get('input:input')();
 assert.equal(t.status.textContent,'No matching tools');
 assert.equal(t.empty.classList.contains('tool-hidden'),false);
 t.handlers.get('reset:click')();
 assert.equal(t.input.value,'');
 assert.equal(t.empty.classList.contains('tool-hidden'),true);
 assert.equal(t.status.textContent,'2 tools shown');
 t.input.value='root';
 const e=t.event('Escape');t.handlers.get('input:keydown')(e);
 assert.equal(t.input.value,'');
 assert.equal(e.prevented,true);
 const slash={...t.event('/'),target:{tagName:'DIV'},ctrlKey:false,metaKey:false,altKey:false,shiftKey:false};
 t.events.get('keydown')(slash);
 assert.equal(t.input.focused,true);
 assert.equal(slash.prevented,true);
}
console.log('Tools search inline script syntax and DOM interactions passed.');


// Core standalone routes must be discoverable through the primary tool chooser,
// not merely mentioned in the hero/quick links where search cannot see them.
const expanded=page.split('id="expanded-tools">')[1]?.split('</section>')[0] || '';
const coreRoutes=['/ph-meter/','/tds-meter/','/vpd-chart/','/terpene-atlas/','/science-labs/'];
const linkedCards=[...expanded.matchAll(/<article>\s*<strong>[^<]+<\/strong>[\s\S]*?<a[^>]+href="(\/[^"]+\/)"[^>]*>/g)].map(m=>m[1]);
for (const route of coreRoutes) {
 assert.equal(linkedCards.filter(link=>link===route).length,1,
   'Core tool must be searchable exactly once as a standalone card: '+route);
 assert.ok(script.includes("'"+route+"':"), 'Core route is missing searchable task aliases: '+route);
}
assert.equal(linkedCards.length,new Set(linkedCards).size,'Search results must not repeat the same tool route');
assert.doesNotMatch(page, /href="\/shop\/"/, 'Seed purchasing is on hold; tools hub must not advertise Shop');
console.log('Standalone core-tool discovery and sales-hold navigation checks passed.');

// Search should accept how growers actually enter units and combined measurements.
// Keep filtering and Enter navigation in agreement for slash, hyphen and subscript queries.
{
 const t=fixture([['pH Meter','/ph-meter/'],['TDS / EC Meter','/tds-meter/'],['PPFD / DLI Light Lab','/ppfd-chart/'],['Ventilation & CO₂','/co2-ventilation/']]);
 for(const [query,expected] of [['pH/EC','/ph-meter/'],['PPFD/DLI','/ppfd-chart/'],['CO₂','/co2-ventilation/'],['µS/cm','/tds-meter/']]){
   t.input.value=query;
   t.handlers.get('input:input')();
   assert.notEqual(t.status.textContent,'No matching tools','Search should match '+query);
   const before=t.visited.length;
   t.handlers.get('input:keydown')(t.event('Enter'));
   assert.equal(t.visited.length,before+1,'Enter should navigate for '+query);
   assert.equal(t.visited.at(-1),expected,'Wrong search destination for '+query);
 }
}
console.log('Scientific notation and compound-unit tool search checks passed.');


// Protocol-relative URLs start with "/" but navigate to another origin.
// Search Enter must never follow them, even when the unsafe result ranks first.
{
 const t=fixture([['Best Match','//attacker.example/'],['Secondary Match','/safe-tool/']]);
 t.input.value='Best Match';
 t.handlers.get('input:input')();
 t.handlers.get('input:keydown')(t.event('Enter'));
 assert.deepEqual(t.visited,[],'Enter must not navigate to a protocol-relative external URL');
 t.input.value='Secondary Match';
 t.handlers.get('input:input')();
 t.handlers.get('input:keydown')(t.event('Enter'));
 assert.deepEqual(t.visited,['/safe-tool/'],'Valid same-origin route must remain keyboard accessible');
}
console.log('Tools search same-origin keyboard navigation guard passed.');

{
// Browsers normalize backslashes in special-scheme URLs, so /\\evil.example/
// can become a network-path redirect. Reject these and control characters.
 const unsafe=['/\\\\attacker.example/','/safe\\\\attacker.example/','/safe\npath/','/safe\tpath/'];
 for(const href of unsafe){
   const t=fixture([['Unsafe Match',href]]);
   t.input.value='Unsafe Match';
   t.handlers.get('input:input')();
   t.handlers.get('input:keydown')(t.event('Enter'));
   assert.deepEqual(t.visited,[],'Unsafe URL must never navigate: '+JSON.stringify(href));
 }
 const t=fixture([['Safe Match','/vpd-chart/']]);
 t.input.value='Safe Match';
 t.handlers.get('input:input')();
 t.handlers.get('input:keydown')(t.event('Enter'));
 assert.deepEqual(t.visited,['/vpd-chart/']);
}
console.log('Tools search browser URL normalization and control-character guard passed.');


{
 // A stale or injected card must not reopen commerce routes while seed sales are held.
 for(const href of ['/shop/','/cart/','/checkout/','/my-account/','/CHECKOUT/?redirect=1']){
   const t=fixture([['Purchase Match',href]]);
   t.input.value='Purchase Match';
   t.handlers.get('input:input')();
   t.handlers.get('input:keydown')(t.event('Enter'));
   assert.deepEqual(t.visited,[],'Commerce route must remain inaccessible from search: '+href);
 }
 const t=fixture([['Science Match','/ph-meter/']]);
 t.input.value='Science Match';
 t.handlers.get('input:input')();
 t.handlers.get('input:keydown')(t.event('Enter'));
 assert.deepEqual(t.visited,['/ph-meter/'],'Educational navigation must remain available');
}
console.log('Tools search commerce-hold keyboard guard passed.');

{
 // Search status and visible cards must never recommend an unsafe destination.
 const t=fixture([['External Best','//attacker.example/'],['Local Best','/ph-meter/']]);
 assert.equal(t.status.textContent,'1 tools shown');
 t.input.value='External Best';
 t.handlers.get('input:input')();
 assert.equal(t.status.textContent,'No matching tools');
 assert.equal(t.empty.classList.contains('tool-hidden'),false);
 t.handlers.get('input:keydown')(t.event('Enter'));
 assert.deepEqual(t.visited,[]);
 t.input.value='Local Best';
 t.handlers.get('input:input')();
 assert.match(t.status.textContent,/best: Local Best$/);
 t.handlers.get('input:keydown')(t.event('Enter'));
 assert.deepEqual(t.visited,['/ph-meter/']);
}
console.log('Unsafe tool cards excluded from visible results and best-match status.');

// Unsafe cards must not remain visible when excluded from search inventory.
{
 const t=fixture([['External','//attacker.example/'],['Checkout','/checkout/'],['Safe','/vpd-chart/']]);
 assert.equal(t.status.textContent,'1 tools shown');
 assert.equal(t.cards[0].classList.contains('tool-hidden'),true);
 assert.equal(t.cards[1].classList.contains('tool-hidden'),true);
 assert.equal(t.cards[2].classList.contains('tool-hidden'),false);
 t.input.value='Safe';t.handlers.get('input:input')();
 assert.equal(t.cards[0].classList.contains('tool-hidden'),true);
 assert.equal(t.cards[1].classList.contains('tool-hidden'),true);
 t.handlers.get('reset:click')();
 assert.equal(t.cards[0].classList.contains('tool-hidden'),true);
 assert.equal(t.cards[1].classList.contains('tool-hidden'),true);
}
console.log('Rejected unsafe cards remain hidden after search and reset.');
