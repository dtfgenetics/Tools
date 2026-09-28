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
  'atlas-v4.css',
  'atlas-site-shell-v5.css',
  'atlas-anatomy-index-v1.css',
  'atlas-anatomy-index-v1.js',
  'atlas-guided-tour-v1.js',
  'module.js',
  'data/systems.json',
  'data/hotspots-v4.json',
  'data/anatomy-registry-v1.json',
  'models/model-manifest-v4.json',
  'models/README.md'
]) {
  ok(fs.existsSync(path.join(atlasRoot, relative)), `Missing canonical Atlas file: ${relative}`);
}

const index = read('index.html');
for (const token of [
  '/atlas/atlas-v4.css',
  '/atlas/atlas-site-shell-v5.css',
  '/atlas/atlas-anatomy-index-v1.js',
  '/atlas/atlas-3d-bootstrap.js',
  'data-anatomy-index',
  'data-atlas-tour',
  '/atlas/atlas-guided-tour-v1.js',
  'id="compare-systems"',
  'data-compare-system-a',
  'data-compare-system-b',
  'data-system-compare',
  '/terpene-atlas/'
]) ok(index.includes(token), `Atlas index missing current wiring: ${token}`);

const tourRuntime = read('atlas-guided-tour-v1.js');
for (const token of ['root-system','stem-vascular','nodes-branching','leaf-module','flower-anatomy','trichomes-resin','plant-atlas:focus','data-tour-answer','Correct.']) ok(tourRuntime.includes(token), `Atlas guided tour missing contract: ${token}`);

const atlasRuntime = read('atlas-v3.js');
for (const token of ['populateCompare','renderCompare','compareCard','compareA','compareB','compareA','compareB','systemLabel']) ok(atlasRuntime.includes(token), `Atlas system comparison runtime missing contract: ${token}`);

const atlasCss = read('atlas-v4.css');
for (const token of ['atlas-compare-controls','atlas-compare-grid','atlas-compare-card','atlas-guided-tour','atlas-tour-controls']) ok(atlasCss.includes(token), `Atlas comparison CSS missing contract: ${token}`);

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
    for (const tool of system.connectedTools || []) {
      ok(typeof tool.label === 'string' && tool.label.length > 0, `System ${system.id} connected tool needs a label`);
      ok(canonicalToolRoutes.has(tool.route), `System ${system.id} connected tool route is not canonical in Tools: ${tool.route}`);
      ok(typeof tool.note === 'string' && tool.note.length > 20, `System ${system.id} connected tool needs contextual guidance: ${tool.route}`);
    }
    const relative = (system.route || '').replace(/^\/atlas\//, '').replace(/\/$/, '');
    ok(fs.existsSync(path.join(atlasRoot, relative, 'index.html')), `Missing Atlas system page: ${system.route}`);
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
