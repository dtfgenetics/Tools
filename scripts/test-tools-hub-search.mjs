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
function fixture(){
 const handlers=new Map(),events=new Map(),visited=[];
 const input={value:'',addEventListener(n,fn){handlers.set('input:'+n,fn);},focus(){this.focused=true;}};
 const status={textContent:''},empty={classList:classes()};
 const reset={addEventListener(n,fn){handlers.set('reset:'+n,fn);}};
 const card=(title,href)=>({textContent:title,classList:classes(),querySelector(s){
   if(s==='a[href]')return {getAttribute:n=>n==='href'?href:null};
   if(s==='strong')return {textContent:title};
   return null;
 }});
 const cards=[card('Root Zone Temperature','/root-zone-temperature/'),card('Root Zone','/root-zone/')];
 const panel={appendChild(c){const i=cards.indexOf(c);if(i>=0)cards.splice(i,1);cards.push(c);}};
 const group={classList:classes(),open:false,querySelectorAll:s=>s==='.measure-panel article'?cards:[],querySelector:s=>s==='.measure-panel'?panel:null};
 const document={getElementById:id=>({toolSearch:input,toolSearchStatus:status,toolSearchEmpty:empty,toolSearchReset:reset})[id]||null,querySelectorAll:s=>s==='#expanded-tools .tool-group'?[group]:[],addEventListener(n,fn){events.set(n,fn);}};
 const window={location:{assign(url){visited.push(url);}}};
 vm.runInNewContext(script,{document,window});
 return {input,status,empty,reset,handlers,events,visited,event(key){return {key,preventDefault(){this.prevented=true;}};}};
}
{
 const t=fixture();
 assert.equal(t.status.textContent,'2 tools shown');
 t.input.value='  root   zone  ';
 t.handlers.get('input:input')();
 assert.match(t.status.textContent,/best: Root Zone$/);
 const e=t.event('Enter');t.handlers.get('input:keydown')(e);
 assert.equal(e.prevented,true);
 assert.deepEqual(t.visited,['/root-zone/'],'Enter must choose the same top-ranked match as live filtering');
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
