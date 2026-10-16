import fs from 'node:fs';import assert from 'node:assert/strict';import path from 'node:path';
const root=process.cwd(),base=path.join(root,'site/public-route-patch/science-labs');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const html=read('index.html'),deep=read('science-deep-dive.js'),q=read('quantitative-labs.js'),diag=read('diagnostic-lab.js');
for(const f of ['index.html','science-deep-dive.js','quantitative-labs.js','diagnostic-lab.js','evidence.json','tests/science-labs.test.mjs'])assert.ok(fs.existsSync(path.join(base,f)),f+' missing');
assert.match(html,/<link rel="canonical" href="https:\/\/dtfseeds\.com\/science-labs\/"/);
for(const script of ['science-deep-dive.js','quantitative-labs.js','diagnostic-lab.js'])assert.ok(html.includes('/science-labs/'+script),script+' not linked');
for(const key of ['anatomy','rhizosphere','diagnostics','vpd','trichomes','lifecycle','genetics','lighting','transport','academy'])assert.ok(html.includes('["'+key+'"'),key+' not registered');
for(const script of [deep,q,diag])assert.ok(script.includes("thc:lab-change"),'module missing shared navigation event');
for(const [file,content] of [['science-deep-dive.js',deep],['quantitative-labs.js',q],['diagnostic-lab.js',diag]]){try{new Function(content)}catch(e){throw new Error(file+' syntax error: '+e.message)}}
JSON.parse(read('evidence.json'));
const manifest=JSON.parse(fs.readFileSync('migration/manifest.json','utf8'));assert.ok(manifest.publicRoutes.includes('/science-labs/'));
const registry=JSON.parse(fs.readFileSync('data/tool-data-requirements-v1.json','utf8'));assert.ok(registry.tools.some(t=>t.id==='science-labs'&&t.dataMode==='reference-only'));
console.log('science-labs canonical integration verified');
