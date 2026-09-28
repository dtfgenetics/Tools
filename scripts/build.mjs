import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const apps=path.join(root,'apps');
const dist=path.join(root,'dist');
fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});

if(fs.existsSync(apps)){
  for(const name of fs.readdirSync(apps)){
    const src=path.join(apps,name);
    if(!fs.statSync(src).isDirectory())continue;
    fs.cpSync(src,path.join(dist,name),{recursive:true});
  }
}
console.log('Build complete:',dist);
