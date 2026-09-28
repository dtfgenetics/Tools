import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const registry=JSON.parse(fs.readFileSync(path.join(root,'data/tool-registry.json'),'utf8'));
const errors=[];
const ok=(v,m)=>{if(!v)errors.push(m)};

for(const tool of registry.tools||[]){
  const appPath=path.join(root,'apps',tool.slug);
  if(fs.existsSync(appPath)){
    const entry=path.join(appPath,'index.html');
    ok(fs.existsSync(entry),tool.slug+' migrated app is missing index.html');
    if(fs.existsSync(entry)){
      const html=fs.readFileSync(entry,'utf8');
      for(const marker of tool.validationMarkers||[])ok(html.toLowerCase().includes(String(marker).toLowerCase()),tool.slug+' missing marker: '+marker);
    }
  }
}

if(errors.length){console.error('Tool validation failed:');for(const e of errors)console.error(' - '+e);process.exit(1)}
console.log('Tool validation passed for all currently migrated app folders.');
