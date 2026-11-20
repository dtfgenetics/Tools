import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(readFileSync(new URL('../docs/completion-dashboard/features.json',import.meta.url),'utf8'));
const required=['id','category','owner','source_repo_path','priority','acceptance_criteria','status','test_status','scientific_visual_rights_status','deployed_build_evidence','blockers','last_verified_utc','next_executable_action'];
const allowed=new Set(['NOT_STARTED','IN_PROGRESS','REVIEW','MERGED','LIVE_VERIFIED','BLOCKED']);
assert.equal(data.schema_version,1);assert(Array.isArray(data.records));const seen=new Set();
for(const row of data.records){for(const key of required)assert(typeof row[key]==='string'&&row[key].trim(),row.id+': missing '+key);
assert(allowed.has(row.status),row.id+': invalid lifecycle');assert(!seen.has(row.id),'duplicate '+row.id);seen.add(row.id);
assert(!Number.isNaN(Date.parse(row.last_verified_utc)),row.id+': invalid timestamp');
if(row.status==='LIVE_VERIFIED'){assert(row.deployed_url&&row.deployed_build_evidence!=='UNKNOWN',row.id+': missing deployment evidence');assert(row.test_evidence&&row.test_status!=='UNKNOWN',row.id+': missing test evidence')}}
const html=readFileSync(new URL('../docs/completion-dashboard/index.html',import.meta.url),'utf8');
for(const token of ['<html lang="en">','<table>','<caption>','<th scope="col">','id="status"','id="category"','id="search"','features.json'])assert(html.includes(token),'missing accessible dashboard token '+token);
console.log('Dashboard schema and accessible view: PASS ('+seen.size+' unique features)');
