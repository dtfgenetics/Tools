#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const atlasRoot = path.join(root, 'site/public-route-patch/atlas');
const errors = [];
const ok = (condition, message) => { if (!condition) errors.push(message); };
const read = (relative) => {
  const file = path.join(atlasRoot, relative);
  try { return fs.readFileSync(file, 'utf8'); }
  catch (error) { errors.push(`Cannot read ${path.relative(root, file)}: ${error.message}`); return ''; }
};

for (const relative of [
  'index.html',
  'atlas-3d-v4.js',
  'atlas-3d-bootstrap.js',
  'atlas-v5.css',
  'atlas-module-v1.css',
  'atlas-anatomy-index-v1.js',
  'atlas-guided-tour-v1.js',
  'atlas-study-progress-v1.js',
  'atlas-evidence-v1.mjs',
  'study/index.html',
  'study/study.js',
  'data/study-paths-v1.json',
  'notebook/index.html',
  'notebook/notebook.js',
  'notebook/compare/index.html',
  'notebook/compare/compare.js',
  'module.js',
  'data/systems.json',
  'data/hotspots-v4.json',
  'data/anatomy-registry-v1.json',
  'data/evidence-map-v1.json',
  'models/model-manifest-v4.json',
  'models/README.md'
]) {
  ok(fs.existsSync(path.join(atlasRoot, relative)), `Missing canonical Atlas file: ${relative}`);
}

const moduleStyles = read('atlas-module-v1.css');
ok(moduleStyles.includes('THC Living Plant Atlas — Shared Module Design System'), 'Shared Atlas module stylesheet missing release marker');
ok(moduleStyles.includes('var(--dtf-global-header-height, var(--site-header-fallback))'), 'Shared Atlas module stylesheet must respect the global header height contract');
ok(moduleStyles.includes('--accent:   #9fe870'), 'Shared Atlas module stylesheet missing V5 lime accent token');

for (const moduleRoute of [
  'diagnostics',
  'root-system',
  'leaf-module',
  'nodes-branching',
  'stem-vascular',
  'trichomes-resin',
  'seed-germination',
  'environmental-physiology',
  'flowers'
]) {
  const modulePage = read(`${moduleRoute}/index.html`);
  ok(modulePage.includes('href="/atlas/atlas-module-v1.css"'), `Atlas module ${moduleRoute} must load the shared V5 module stylesheet`);
  ok(/<meta name="viewport"[^>]*width=device-width/i.test(modulePage), `Atlas module ${moduleRoute} missing responsive viewport metadata`);
  ok(/<h1(?:\s|>)/i.test(modulePage), `Atlas module ${moduleRoute} missing primary H1`);
  ok(modulePage.includes('class="topbar"'), `Atlas module ${moduleRoute} missing shared topbar shell`);
  ok(!modulePage.toLowerCase().includes('#f5f3e9'), `Atlas module ${moduleRoute} regressed to retired cream theme`);
}

const index = read('index.html');
for (const token of [
  '/atlas/atlas-v5.css',
  '/atlas/atlas-anatomy-index-v1.js',
  '/atlas/atlas-3d-bootstrap.js',
  'data-anatomy-index',
  'data-atlas-tour',
  '/atlas/atlas-guided-tour-v1.js',
  'id="system-tree"',
  'data-system-tree',
  'data-tree-expand',
  'data-tree-collapse',
  'id="accessible-anatomy"',
  'aria-label="Plant Atlas system navigation"',
  'atlas-tree-group',
  'id="scientific-media"',
  'atlas-media-grid',
  'Systems still awaiting a dedicated scientific visual',
  'id="compare-systems"',
  'data-compare-system-a',
  'data-compare-system-b',
  'data-system-compare',
  '/atlas/study/',
  '/atlas/notebook/',
  '/terpene-atlas/'
]) ok(index.includes(token), `Atlas index missing current wiring: ${token}`);


const notebookHtml = read('notebook/index.html');
for (const token of [
  'Atlas Observation Notebook',
  'data-form',
  'data-entries',
  'data-export',
  'data-import',
  '/atlas/diagnostics/',
  '/growlens/',
  '/atlas/notebook/notebook.js',
  '/atlas/notebook/compare/',
  'Optional plant-growth measurements',
  'name="heightCm"',
  'name="widthCm"',
  'name="stemDiameterMm"',
  'name="leafCount"',
  'name="nodeCount"',
  'name="internodeLengthCm"',
  'name="branchCount"',
  'name="flowerDays"',
  'data-clear-all'
]) ok(notebookHtml.includes(token), `Atlas notebook HTML missing contract: ${token}`);

const notebookRuntime = read('notebook/notebook.js');
for (const token of [
  'dtf.atlas.observation-notebook.v1',
  'localStorage',
  'MAX=250',
  'workingDifferential',
  'nextCheck',
  '[data-export]',
  '[data-import]',
  '[data-clear-all]',
  'growthMetrics',
  "type:'plant-observation'",
  "type:'plant-growth'",
  "toolId:'plant-atlas'",
  'possibleCauses',
  'measuredGrowth',
  'All Atlas observations cleared.'
]) ok(notebookRuntime.includes(token), `Atlas notebook runtime missing contract: ${token}`);


const compareHtml = read('notebook/compare/index.html');
for (const token of [
  'Compare Atlas Observations',
  'data-app',
  '/atlas/notebook/',
  '/atlas/notebook/compare/compare.js'
]) ok(compareHtml.includes(token), `Atlas observation comparison HTML missing contract: ${token}`);

const compareRuntime = read('notebook/compare/compare.js');
for (const token of [
  'dtf.atlas.observation-notebook.v1',
  'localStorage',
  'baselineId',
  'followupId',
  'Working differential',
  'Next discriminating check'
]) ok(compareRuntime.includes(token), `Atlas observation comparison runtime missing contract: ${token}`);


const studyRuntime = read('atlas-study-progress-v1.js');
for (const token of [
  'dtf.atlas.study-progress.v1',
  'visited',
  'completed',
  'Mark system complete',
  '/atlas/study/',
  'localStorage'
]) ok(studyRuntime.includes(token), `Atlas study progress runtime missing contract: ${token}`);

const studyHtml = read('study/index.html');
for (const token of [
  'Atlas Study Dashboard',
  'data-visited',
  'data-completed',
  'data-paths',
  'data-paths-root',
  '/atlas/study/study.js',
  'Progress is not a credential'
]) ok(studyHtml.includes(token), `Atlas study dashboard HTML missing contract: ${token}`);

const studyJs = read('study/study.js');
for (const token of [
  'dtf.atlas.study-progress.v1',
  '/atlas/data/systems.json',
  '/atlas/data/study-paths-v1.json',
  '[data-export]',
  '[data-reset]'
]) ok(studyJs.includes(token), `Atlas study dashboard runtime missing contract: ${token}`);

let studyPaths;
try { studyPaths = JSON.parse(read('data/study-paths-v1.json')); }
catch (error) { errors.push(`Invalid study-paths-v1.json: ${error.message}`); }

const tourRuntime = read('atlas-guided-tour-v1.js');
for (const token of ['root-system','stem-vascular','nodes-branching','leaf-module','flower-anatomy','trichomes-resin','plant-atlas:focus','data-tour-answer','Correct.']) ok(tourRuntime.includes(token), `Atlas guided tour missing contract: ${token}`);

const atlasRuntime = read('atlas-v3.js');
for (const token of ['renderSystemTree','atlas-tree-category','atlas-tree-item','data-tree-expand','data-tree-collapse','populateCompare','renderCompare','compareCard','compareA','compareB','compareA','compareB','systemLabel']) ok(atlasRuntime.includes(token), `Atlas system comparison runtime missing contract: ${token}`);

const atlasCss = read('atlas-v5.css');
for (const legacyStylesheet of [
  '/atlas/atlas-v3.css',
  '/atlas/atlas-v4.css',
  '/atlas/atlas-core-v4.css',
  '/atlas/atlas-site-shell-v5.css',
  '/atlas/atlas-anatomy-index-v1.css'
]) ok(!index.includes(legacyStylesheet), `Atlas index must not load legacy stylesheet: ${legacyStylesheet}`);
ok(index.includes('/atlas/atlas-v5.css'), 'Atlas index must load the V5 single-source stylesheet');
ok(atlasCss.includes('THC Living Plant Atlas V5'), 'Atlas V5 stylesheet missing release marker');
ok(atlasCss.includes('--atlas-accent'), 'Atlas V5 stylesheet missing canonical design tokens');
ok(atlasCss.includes('@media(max-width:820px)'), 'Atlas V5 stylesheet missing mobile layout contract');
for (const token of ['atlas-system-tree','atlas-tree-category','atlas-tree-item','atlas-tree-columns','atlas-compare-controls','atlas-compare-grid','atlas-compare-card','atlas-guided-tour','atlas-tour-controls']) ok(atlasCss.includes(token), `Atlas comparison CSS missing contract: ${token}`);

const bootstrap = read('atlas-3d-bootstrap.js');
for (const token of [
  "import('/atlas/atlas-3d-v4.js')",
  'bootPlantAtlasV4',
  "import('/atlas/atlas-3d.js')",
  'shouldUseStaticAuditMode'
]) ok(bootstrap.includes(token), `Atlas bootstrap missing contract: ${token}`);

const renderer = read('atlas-3d-v4.js');
for (const token of [
  'GLTFLoader',
  'RoomEnvironment',
  'MODEL_MANIFEST_URL',
  'buildProceduralSpecimen',
  'procedural-pbr',
  'webglcontextlost',
  'IntersectionObserver',
  'ResizeObserver',
  'plant-atlas:focus'
]) ok(renderer.includes(token), `Atlas V4 renderer missing contract: ${token}`);


const moduleRuntime = read('module.js');
for (const token of [
  '/atlas/atlas-study-progress-v1.js',
  'data-atlas-study-runtime',
  "import('/atlas/atlas-evidence-v1.mjs')",
  "evidenceCard.dataset.atlasEvidence=''"
]) ok(moduleRuntime.includes(token), `Atlas module runtime missing study-progress wiring: ${token}`);

for (const customHub of ['root-system/index.html','leaf-module/index.html']) {
  ok(read(customHub).includes('/atlas/atlas-study-progress-v1.js'), `Custom Atlas hub missing study-progress runtime: ${customHub}`);
}

let hotspots;
try { hotspots = JSON.parse(read('data/hotspots-v4.json')); }
catch (error) { errors.push(`Invalid hotspots-v4.json: ${error.message}`); }

if (hotspots) {
  ok(hotspots.schemaVersion === 4, 'hotspots-v4.json must use schemaVersion 4');
  const entries = Array.isArray(hotspots.hotspots) ? hotspots.hotspots : [];
  ok(entries.length >= 32, `Expected at least 32 hotspots; found ${entries.length}`);
  const ids = new Set();
  for (const item of entries) {
    ok(typeof item.id === 'string' && item.id.length > 0, 'Every hotspot needs an id');
    ok(!ids.has(item.id), `Duplicate hotspot id: ${item.id}`);
    ids.add(item.id);
    ok(typeof item.route === 'string' && item.route.startsWith('/atlas/'), `Hotspot ${item.id} needs a canonical Atlas route`);
    ok(Array.isArray(item.anchors) && item.anchors.length > 0, `Hotspot ${item.id} needs at least one anchor`);
  }
}

let toolManifest;
try { toolManifest = JSON.parse(fs.readFileSync(path.join(root, 'migration/manifest.json'), 'utf8')); }
catch (error) { errors.push(`Invalid migration/manifest.json: ${error.message}`); }
const canonicalToolRoutes = new Set(toolManifest?.publicRoutes || []);

let systems;
try { systems = JSON.parse(read('data/systems.json')); }
catch (error) { errors.push(`Invalid systems.json: ${error.message}`); }

if (systems) {
  ok(systems.schemaVersion === 4, 'systems.json must use schemaVersion 4');
  const entries = Array.isArray(systems.systems) ? systems.systems : [];
  ok(entries.length === 16, `Expected exactly 16 Atlas systems; found ${entries.length}`);
  for (const system of entries) {
    ok(typeof system.id === 'string' && system.id.length > 0, 'Every Atlas system needs an id');
    ok(/^\/atlas\/.+\/$/.test(system.route || ''), `System ${system.id} needs a canonical Atlas route`);
    for (const field of ['concepts','measurements','evidenceQuestions','cautions','related']) ok(Array.isArray(system[field]) && system[field].length > 0, `System ${system.id} comparison field ${field} must be populated`);
    ok(Array.isArray(system.connectedTools) && system.connectedTools.length > 0, `System ${system.id} needs at least one connected canonical tool`);
    ok(read('index.html').includes(system.route), `Atlas text navigator missing system route: ${system.route}`);
    for (const visual of system.referenceVisuals || []) ok(read('index.html').includes(visual.src), `Atlas media library missing referenced visual: ${visual.src}`);
    for (const tool of system.connectedTools || []) {
      ok(typeof tool.label === 'string' && tool.label.length > 0, `System ${system.id} connected tool needs a label`);
      ok(canonicalToolRoutes.has(tool.route), `System ${system.id} connected tool route is not canonical in Tools: ${tool.route}`);
      ok(typeof tool.note === 'string' && tool.note.length > 20, `System ${system.id} connected tool needs contextual guidance: ${tool.route}`);
    }
    const relative = (system.route || '').replace(/^\/atlas\//, '').replace(/\/$/, '');
    ok(fs.existsSync(path.join(atlasRoot, relative, 'index.html')), `Missing Atlas system page: ${system.route}`);
  }

  if (studyPaths) {
    ok(studyPaths.schemaVersion === 1, 'study paths must use schemaVersion 1');
    ok(studyPaths.storageKey === 'dtf.atlas.study-progress.v1', 'study paths storage key mismatch');
    const paths = Array.isArray(studyPaths.paths) ? studyPaths.paths : [];
    ok(paths.length === 6, `Expected exactly 6 Atlas guided study paths; found ${paths.length}`);
    const systemIds = new Set(entries.map((system) => system.id));
    const pathIds = new Set();
    for (const studyPath of paths) {
      ok(typeof studyPath.id === 'string' && studyPath.id.length > 0, 'Every study path needs an id');
      ok(!pathIds.has(studyPath.id), `Duplicate study path id: ${studyPath.id}`);
      pathIds.add(studyPath.id);
      ok(Array.isArray(studyPath.systems) && studyPath.systems.length >= 5, `Study path ${studyPath.id} needs at least 5 canonical systems`);
      for (const id of studyPath.systems || []) ok(systemIds.has(id), `Study path ${studyPath.id} references unknown system: ${id}`);
      ok(typeof studyPath.outcome === 'string' && studyPath.outcome.length > 30, `Study path ${studyPath.id} needs a meaningful outcome`);
    }
  }
}

let registry;
try { registry = JSON.parse(read('data/anatomy-registry-v1.json')); }
catch (error) { errors.push(`Invalid anatomy-registry-v1.json: ${error.message}`); }

if (registry) {
  ok(registry.schemaVersion === 1, 'anatomy registry must use schemaVersion 1');
  const entries = Array.isArray(registry.structures) ? registry.structures : [];
  ok(entries.length === 32, `Expected exactly 32 anatomy structures; found ${entries.length}`);
}

let manifest;
try { manifest = JSON.parse(read('models/model-manifest-v4.json')); }
catch (error) { errors.push(`Invalid model-manifest-v4.json: ${error.message}`); }

if (manifest) {
  ok(manifest.schemaVersion === 1, 'model manifest must use schemaVersion 1');
  ok(manifest?.fallback?.mode === 'procedural-pbr', 'Atlas fallback must remain procedural-pbr');
  ok(manifest?.fallback?.requiresExternalAsset === false, 'Atlas fallback must not require an external model');
  const preferred = manifest?.preferredModel || {};
  if (preferred.enabled === true) {
    const model = path.join(atlasRoot, 'models/cannabis-specimen-v1.glb');
    ok(preferred.license && preferred.license !== 'pending-approved-asset', 'Enabled GLB needs an approved license');
    ok(fs.existsSync(model), 'Enabled GLB is missing from canonical Tools');
  }
}

if (errors.length) {
  console.error(`Canonical Plant Atlas validation failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('Canonical Plant Atlas valid: route/data/runtime contracts are internally consistent in dtfgenetics/Tools.');
