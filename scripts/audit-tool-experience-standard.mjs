import fs from 'node:fs';
import path from 'node:path';

const root='site/public-route-patch';
const entries=fs.readdirSync(root,{withFileTypes:true})
  .filter(entry=>entry.isDirectory()&&fs.existsSync(path.join(root,entry.name,'index.html')))
  .map(entry=>entry.name)
  .sort();

const count=(text,re)=>(text.match(re)||[]).length;
const has=(text,re)=>re.test(text);
const rows=[];
const structuralErrors=[];
const warnings=[];

for(const route of entries){
  const file=path.join(root,route,'index.html');
  const html=fs.readFileSync(file,'utf8');
  const structural={
    lang:has(html,/<html[^>]+lang=["'][^"']+["']/i),
    title:has(html,/<title>[^<]{3,}<\/title>/i),
    viewport:has(html,/<meta[^>]+name=["']viewport["']/i),
    description:has(html,/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}["']/i)||has(html,/<meta[^>]+content=["'][^"']{20,}["'][^>]+name=["']description["']/i),
    canonical:has(html,/<link[^>]+rel=["']canonical["']/i),
    h1:has(html,/<h1\b/i),
    main:has(html,/<main\b/i)
  };
  const missing=Object.entries(structural).filter(([,ok])=>!ok).map(([key])=>key);
  if(missing.length)structuralErrors.push(route+': missing '+missing.join(', '));

  const signals={
    ariaLive:count(html,/aria-live=/gi),
    labelledTables:count(html,/aria-label=/gi),
    forms:count(html,/<(?:input|select|textarea)\b/gi),
    labels:count(html,/<label\b/gi),
    interactiveVisuals:count(html,/<(?:canvas|svg|img)\b|uplot|heatmap|chart|3d|cytoscape/gi),
    education:has(html,/Teaching Healthy Cultivation|evidence-aware|research|measurement protocol|scouting principles|educational decision-support/i),
    limitations:has(html,/not universal|does not|cannot|limitation|boundary|decision-support|not a diagnosis|not proof/i),
    persistence:has(html,/localStorage|THC\.save|Backup JSON|Save survey|Save reading|saved mixes|history/i),
    export:has(html,/Export (?:CSV|JSON)|backup JSON|print \/ save|download/i),
    growLens:has(html,/GrowLens/i),
    sharedCss:has(html,/\/assets\/thc-tool-suite-v1\.css/i)
  };

  if(signals.forms>0&&signals.labels===0)warnings.push(route+': form controls found without label elements');
  if(signals.forms>=4&&signals.ariaLive===0)warnings.push(route+': interactive form has no aria-live feedback signal');
  if(signals.interactiveVisuals===0&&!['tools','unit-converter','dilution-calculator'].includes(route))warnings.push(route+': no obvious visual/chart/diagram signal');
  if(!signals.education&&!['tools','unit-converter'].includes(route))warnings.push(route+': weak/no explicit educational signal');
  if(!signals.limitations&&!['tools','unit-converter'].includes(route))warnings.push(route+': no explicit scope/limitation signal');

  rows.push({route,...structural,...signals});
}

console.log('Tool experience audit: '+rows.length+' canonical routes');
for(const row of rows){
  console.log([
    row.route.padEnd(26),
    'meta '+(row.lang&&row.title&&row.viewport&&row.description&&row.canonical?'ok':'gap'),
    'a11y-live '+row.ariaLive,
    'visual '+row.interactiveVisuals,
    'education '+(row.education?'yes':'no'),
    'limits '+(row.limitations?'yes':'no'),
    'persist '+(row.persistence?'yes':'no'),
    'export '+(row.export?'yes':'no')
  ].join(' | '));
}
if(warnings.length){
  console.log('\nExperience warnings (quality backlog, non-blocking):');
  for(const warning of warnings)console.log(' - '+warning);
}
if(structuralErrors.length){
  console.error('\nStructural experience gate failed:');
  for(const error of structuralErrors)console.error(' - '+error);
  process.exit(1);
}
console.log('\nStructural experience gate passed. Warnings identify the next visual/content UX backlog.');
