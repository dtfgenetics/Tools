import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const ok = (value, message) => { if (!value) errors.push(message); };
const manifestPath = path.join(root, 'migration/manifest.json');
ok(fs.existsSync(manifestPath), 'missing migration/manifest.json');

let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  errors.push(`invalid migration manifest: ${error.message}`);
}

const slugs = Array.isArray(manifest.canonicalToolSlugs) ? manifest.canonicalToolSlugs : [];
const publicRoutes = Array.isArray(manifest.publicRoutes) ? manifest.publicRoutes : [];

ok(manifest.schemaVersion >= 2, 'migration manifest schemaVersion must be >= 2');
ok(manifest.sourceOfTruth === 'dtfgenetics/Tools', 'migration manifest must name dtfgenetics/Tools as source of truth');
ok(manifest.integrationRepository === 'dtfgenetics/Thc', 'migration manifest integration repository mismatch');
ok(slugs.length > 0, 'migration manifest canonicalToolSlugs must not be empty');
ok(new Set(slugs).size === slugs.length, 'migration manifest contains duplicate canonicalToolSlugs');
ok(new Set(publicRoutes).size === publicRoutes.length, 'migration manifest contains duplicate publicRoutes');

for (const slug of slugs) {
  const expectedRoute = `/${slug}/`;
  ok(publicRoutes.includes(expectedRoute), `migration manifest missing ${expectedRoute}`);
  const file = path.join(root, 'site/public-route-patch', slug, 'index.html');
  ok(fs.existsSync(file), `missing canonical route file: ${slug}/index.html`);
  if (fs.existsSync(file)) {
    ok(fs.statSync(file).size > 200, `canonical route file is unexpectedly small: ${slug}/index.html`);
  }
}

for (const route of publicRoutes) {
  ok(/^\/[a-z0-9-]+\/$/.test(route), `invalid canonical public route format: ${route}`);
  const slug = route.replace(/^\//, '').replace(/\/$/, '');
  ok(slugs.includes(slug), `public route has no canonicalToolSlugs entry: ${route}`);
}

for (const asset of [
  'site/public-route-patch/assets/thc-cultivation-math-v1.mjs',
  'site/public-route-patch/assets/thc-tool-suite-v1.css',
  'site/public-route-patch/assets/thc-tool-suite-v1.js',
  'site/public-route-patch/assets/breeder-pedigree-graph-v1.js',
  'site/public-route-patch/assets/vendor/cytoscape-3.34.3.min.js',
  'site/public-route-patch/assets/vendor/cytoscape-3.34.3.LICENSE.txt',
  'site/public-route-patch/assets/vendor/uplot-1.6.32.min.js',
  'site/public-route-patch/assets/vendor/uplot-1.6.32.min.css',
  'site/public-route-patch/assets/vendor/papaparse-5.7.0.min.js'
]) {
  ok(fs.existsSync(path.join(root, asset)), `missing shared dependency: ${asset}`);
}

const hubPath = path.join(root, 'site/public-route-patch/tools/index.html');
if (fs.existsSync(hubPath)) {
  const hub = fs.readFileSync(hubPath, 'utf8');
  for (const slug of slugs.filter(slug => slug !== 'tools')) {
    ok(hub.includes(`/${slug}/`), `Tools hub missing route /${slug}/`);
  }

  const expandedToolsSection = hub.match(/<section class="section" id="expanded-tools">([\s\S]*?)<\/section>/)?.[1] || '';
  const searchableToolRoutes = [...expandedToolsSection.matchAll(/<article>[\s\S]*?<a class="text-link" href="([^"]+)"/g)]
    .map((match) => match[1]);
  const aliasBlock = hub.match(/const searchAliases=\{([\s\S]*?)\};/)?.[1] || '';
  const searchAliasRoutes = [...aliasBlock.matchAll(/'([^']+)'\s*:/g)].map((match) => match[1]);

  ok(searchableToolRoutes.length > 0, 'Tools hub searchable catalog must contain tool cards');
  ok(new Set(searchableToolRoutes).size === searchableToolRoutes.length, 'Tools hub searchable catalog contains duplicate routes');
  ok(new Set(searchAliasRoutes).size === searchAliasRoutes.length, 'Tools hub searchAliases contains duplicate routes');
  for (const route of searchableToolRoutes) {
    ok(searchAliasRoutes.includes(route), `Tools hub searchable route missing search alias: ${route}`);
  }
  for (const route of searchAliasRoutes) {
    ok(searchableToolRoutes.includes(route), `Tools hub search alias has no searchable card: ${route}`);
  }

  const initialStatus = hub.match(/id="toolSearchStatus"[^>]*>([^<]*)<\/div>/)?.[1]?.trim() || '';
  ok(!/^\d+\s+tools?\s+shown$/i.test(initialStatus), 'Tools hub must not hardcode a numeric pre-JavaScript tool count');
  ok(hub.includes("status.textContent=cards.length+' tools shown'"), 'Tools hub must derive the unfiltered tool count from rendered cards');
}

const packageJsonPath = path.join(root, 'package.json');
ok(fs.existsSync(packageJsonPath), 'missing package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const testScript = pkg?.scripts?.test || '';
    for (const requiredScript of [
      'validate-tools-repo.mjs',
      'validate-repo-boundaries.mjs',
      'validate-owned-references.mjs',
      'validate-plant-atlas-v4.mjs',
      'run-cultivation-math-release-checks.mjs',
      'validate-tool-workflow-persistence.mjs'
    ]) {
      ok(testScript.includes(requiredScript), `package.json test script missing required guard: ${requiredScript}`);
    }
  } catch (error) {
    errors.push(`invalid package.json: ${error.message}`);
  }
}

const workflow = fs.readFileSync(path.join(root, '.github/workflows/complete-tool-migration.yml'), 'utf8');
ok(!workflow.includes('Clone THC integration source'), 'migration workflow must not contain the legacy reverse-migration clone step');

if (errors.length) {
  console.error('Canonical Tools repository validation failed:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log(`Canonical Tools repository valid: ${slugs.length} public routes and required shared dependencies are owned here.`);
