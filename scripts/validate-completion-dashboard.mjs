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

const requiredCategories=new Set(['encyclopedia','tools','academy','games','security','backup','release']);
const presentCategories=new Set(data.records.map(row=>row.category));
for(const category of requiredCategories)assert(presentCategories.has(category),'missing required ownership lane '+category);
for(const row of data.records){
  assert(/^THC-[A-Z]+-\\d{3}$/.test(row.id),row.id+': malformed stable ID');
  assert(['P0','P1','P2','P3'].includes(row.priority),row.id+': invalid priority');
  assert(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$/.test(row.last_verified_utc),row.id+': timestamp must be UTC');
  if(row.pr_url!==null&&row.pr_url!==undefined)assert(/^https:\\/\\/github\\.com\\/dtfgenetics\\/[^/]+\\/pull\\/\\d+$/.test(row.pr_url),row.id+': malformed PR URL');
  if(row.commit_sha!==null&&row.commit_sha!==undefined)assert(/^[a-f0-9]{40}$/.test(row.commit_sha),row.id+': invalid commit SHA');
  if(row.status==='LIVE_VERIFIED'){
    assert(/^https:\\/\\//.test(row.deployed_url),row.id+': missing deployed HTTPS URL');
    assert(row.deployed_build_evidence!=='UNKNOWN'&&row.deployed_build_evidence,row.id+': missing deployed build proof');
    assert(row.test_status!=='UNKNOWN'&&row.test_evidence,row.id+': missing functional test proof');
  }
}
assert(data.records.some(row=>/sales.hold|checkout|purchas/i.test(row.acceptance_criteria+' '+row.blockers)),'seed purchasing hold not tracked');
const statusCounts=Object.fromEntries([...allowed].map(s=>[s,data.records.filter(row=>row.status===s).length]));
console.log('Lifecycle counts:',JSON.stringify(statusCounts));

console.log('Dashboard schema and accessible view: PASS ('+seen.size+' unique features)');
