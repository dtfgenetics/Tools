import fs from 'node:fs';

const html=fs.readFileSync('site/public-route-patch/breeder-pedigree/index.html','utf8');
const graph=fs.readFileSync('site/public-route-patch/assets/breeder-pedigree-graph-v1.js','utf8');
const vendor=fs.readFileSync('site/public-route-patch/assets/vendor/cytoscape-3.34.3.min.js','utf8');
const license=fs.readFileSync('site/public-route-patch/assets/vendor/cytoscape-3.34.3.LICENSE.txt','utf8');

function ok(value,message){ if(!value) throw new Error(message); }

for(const marker of [
  '/assets/vendor/cytoscape-3.34.3.min.js',
  '/assets/breeder-pedigree-graph-v1.js',
  'id="pedigreeGraph"',
  'Interactive lineage network',
  'Fit graph',
  'dtf:pedigree-focus',
  'Pedigree validation',
  'collectAncestors',
  'collectDescendants',
  'wouldCreateCycle',
  'pedigreeIssues',
  'circular ancestry',
  'auditPedigree',
  'Import lineage CSV',
  'papaparse-5.7.0.min.js',
  'importedBreederRecord',
  'exactPedigreeDuplicate',
  'Import rejected: the merged lineage would contain self-parenting, circular ancestry or conflicting parentage.',
  'Existing records were preserved.',
  'external_reference_url',
  'breederSource',
  'generationNotes',
  'selectionTraits',
  'validExternalUrl',
  'Generation / testing notes',
  'Selection criteria / observed traits',
  'External reference URL',
  'Breeder / source attribution',
  'lineStatus'
]) ok(html.includes(marker),`breeder page missing ${marker}`);

for(const marker of [
  "version:'dtf-breeder-graph-v1'",
  "layout:{name:'breadthfirst'",
  "predecessors().nodes()",
  "successors().nodes()",
  "cy.on('tap','node'",
  "Interactive pedigree graph unavailable"
]) ok(graph.includes(marker),`graph adapter missing ${marker}`);

for(const marker of [
  'ensurePedigreeGraphRuntime',
  "script.src='/assets/vendor/cytoscape-3.34.3.min.js'",
  "script.dataset.dtfLazyRuntime='pedigree-cytoscape'",
  "'IntersectionObserver' in globalThis",
  "rootMargin:'320px 0px'",
  'renderPedigreeGraph',
  'Interactive pedigree graph loads when this section enters the viewport.',
  'Interactive pedigree graph unavailable. The text relationship explorer remains available.'
]) ok(html.includes(marker),`breeder lazy graph contract missing ${marker}`);

ok(!html.includes('<script src="/assets/vendor/cytoscape-3.34.3.min.js"></script>'),'Cytoscape must not be eagerly loaded by the breeder page');

ok(vendor.includes('The Cytoscape Consortium'),'vendored Cytoscape copyright marker missing');
ok(license.includes('Cytoscape.js 3.34.3'),'Cytoscape version provenance missing');
ok(license.includes('Permission is hereby granted'),'Cytoscape MIT license text missing');
ok(html.includes('@media(max-width:680px)'), 'pedigree graph mobile sizing missing');

console.log('Breeder pedigree Cytoscape integration contract passed.');
