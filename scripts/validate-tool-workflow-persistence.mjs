import fs from 'node:fs';
const read=slug=>fs.readFileSync('site/public-route-patch/'+slug+'/index.html','utf8');
const errors=[];const ok=(v,m)=>{if(!v)errors.push(m)};
const hub=read('tools');
for(const token of ['id="toolSearch"','tool-search-status','matching tool','tool-hidden']) ok(hub.includes(token),'Tools hub search missing '+token);
const breeder=read('breeder-pedigree');
for(const token of ['Backup JSON','Restore JSON','data-edit','data-delete','Unsupported pedigree backup format','const esc=']) ok(breeder.includes(token),'Breeder workflow missing '+token);
const env=read('environment-control');
for(const token of ['Export CSV','Backup JSON','Restore JSON','thc-environment-history-backup.json','environment-history.csv','Unsupported environment backup format']) ok(env.includes(token),'Environment persistence missing '+token);
const ipm=read('ipm-scout');
for(const token of ['Backup JSON','Restore JSON','data-delete-index','thc-ipm-scout-backup.json','Unsupported IPM backup format']) ok(ipm.includes(token),'IPM persistence missing '+token);
const fert=read('fertigation-lab');
for(const token of ['Save recipe locally','Saved recipe library','thc-fertigation-recipes-v1','data-load-recipe','data-delete-recipe','thc-fertigation-recipes-backup.json']) ok(fert.includes(token),'Fertigation recipe library missing '+token);
if(errors.length){console.error('Tool workflow persistence validation failed:');for(const e of errors)console.error(' - '+e);process.exit(1)}
console.log('Tool workflow persistence validation passed.');
