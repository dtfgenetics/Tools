import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const patchRoot = path.join(root, 'site/public-route-patch');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'migration/manifest.json'), 'utf8'));
const ownedSlugs = new Set(manifest.canonicalToolSlugs);
const errors = [];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function normalizeRef(ref, htmlFile) {
  if (!ref || /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(ref)) return null;
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return null;

  let relative;
  if (clean.startsWith('/')) {
    const first = clean.split('/').filter(Boolean)[0] || '';
    if (first !== 'assets' && !ownedSlugs.has(first)) return null;
    relative = clean.slice(1);
  } else {
    const fromDir = path.dirname(path.relative(patchRoot, htmlFile));
    relative = path.normalize(path.join(fromDir, clean));
  }

  if (relative.endsWith('/')) relative = path.join(relative, 'index.html');
  return relative.replaceAll('\\', '/');
}

for (const htmlFile of walk(patchRoot).filter(file => file.endsWith('.html'))) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const refs = [...html.matchAll(/(?:src|href)=["']([^"'#]+)["']/gi)].map(match => match[1]);

  for (const ref of refs) {
    const relative = normalizeRef(ref, htmlFile);
    if (!relative) continue;
    const target = path.join(patchRoot, relative);
    if (!fs.existsSync(target)) {
      errors.push(`${path.relative(root, htmlFile)} -> missing owned reference: ${ref} (expected ${path.relative(root, target)})`);
    }
  }
}

if (errors.length) {
  console.error('Owned reference validation failed:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('Owned HTML references valid: canonical routes resolve their local tool assets and owned route links.');
