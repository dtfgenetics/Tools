import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'migration/manifest.json'), 'utf8'));
const patchRoot = path.join(root, 'site/public-route-patch');
const allowedTopLevel = new Set(['assets', ...manifest.canonicalToolSlugs]);
const forbiddenTopLevel = new Set([
  'games',
  'academy',
  'courses',
  'certification',
  'blog',
  'shop',
  'strain-library',
  'growlens',
  'grow-doc'
]);

const errors = [];
for (const entry of fs.readdirSync(patchRoot, { withFileTypes: true })) {
  if (!allowedTopLevel.has(entry.name)) {
    errors.push(`non-tool content found in canonical public patch: ${entry.name}`);
  }
  if (forbiddenTopLevel.has(entry.name)) {
    errors.push(`integration-only product area must not live in Tools: ${entry.name}`);
  }
}

const runtimeExtensions=new Set(['.html','.js','.mjs','.css','.json']);
function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
for(const file of walk(patchRoot)){
  if(!runtimeExtensions.has(path.extname(file)))continue;
  const source=fs.readFileSync(file,'utf8');
  for(const forbidden of ['apps/growlens-web','dtfgenetics/Thc','raw.githubusercontent.com/dtfgenetics/Thc']){
    if(source.includes(forbidden))errors.push(`forbidden runtime reference ${forbidden} in ${path.relative(root,file)}`);
  }
}

const rootEntries = fs.readdirSync(root, { withFileTypes: true }).map(entry => entry.name);
for (const forbidden of ['node_modules', '.DS_Store', 'dist', 'coverage', 'tmp', 'temp']) {
  if (rootEntries.includes(forbidden)) {
    errors.push(`generated/local artifact must not be committed at repository root: ${forbidden}`);
  }
}

if (errors.length) {
  console.error('Tools repository boundary validation failed:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log(`Tools repository boundaries valid: only shared assets and ${manifest.canonicalToolSlugs.length} canonical tool routes are present.`);
