// Shared HTTP-response classifier for fail-closed cultivation release checks.
// Inspect only the document prefix; an HTML error page may begin with a UTF-8 BOM,
// XML declaration, or an injected hosting-provider comment.
export function isHtmlFallback(body) {
  const prefix = String(body ?? '').slice(0, 4096);
  const lead = prefix.replace(/^\uFEFF/, '').replace(/^(?:\s|<!--[\s\S]*?-->|<\?xml\s[^>]*\?>)*/i, '');
  return /^(?:<!doctype\s+html\b|<html(?=[\s>])|<head(?=[\s>])|<body(?=[\s>]))/i.test(lead);
}

/**
 * Normalize response Content-Type, including optional charset parameters.
 * Empty/missing media types fail closed.
 */
export function mediaType(contentType) {
  return String(contentType ?? '').split(';', 1)[0].trim().toLowerCase();
}

export function matchesAssetMime(path, contentType) {
  const mime = mediaType(contentType);
  // URL query strings and fragments are not part of the asset extension.
  const pathname = String(path ?? '').split(/[?#]/, 1)[0].toLowerCase();
  if (pathname.endsWith('.svg')) return mime === 'image/svg+xml';
  if (pathname.endsWith('.css')) return mime === 'text/css';
  if (/\.(?:js|mjs)$/.test(pathname)) return [
    'text/javascript', 'application/javascript',
    'application/x-javascript', 'text/ecmascript', 'application/ecmascript',
  ].includes(mime);
  return false; // Unexpected file types are not assumed safe.
}

/** Prevent a green live check if a canonical public route was never requested. */
export function canonicalRouteInventoryErrors(manifestRoutes, verifiedPaths) {
  const errors = [];
  const valid = value => typeof value === 'string' && /^\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(value);
  if (!Array.isArray(manifestRoutes) || !Array.isArray(verifiedPaths)) return ['canonical route inventories must be arrays'];
  if (manifestRoutes.length === 0) errors.push('canonical manifest has no routes');
  if (verifiedPaths.length === 0) errors.push('live verifier has no routes');
  for (const [label, paths] of [['manifest', manifestRoutes], ['live verifier', verifiedPaths]]) {
    const seen = new Set();
    for (const p of paths) {
      if (!valid(p)) errors.push(label + ': invalid route ' + JSON.stringify(p));
      if (seen.has(p)) errors.push(label + ': duplicate route ' + p);
      seen.add(p);
    }
  }
  const wanted = new Set(manifestRoutes);
  const checked = new Set(verifiedPaths);
  for (const p of wanted) if (!checked.has(p)) errors.push('canonical route not checked live: ' + p);
  for (const p of checked) if (!wanted.has(p)) errors.push('unlisted canonical route in live checks: ' + p);
  return errors;
}


/** Fail a live educational-tool release when public HTML exposes a commerce destination. */
export function hasShopNavigation(html) {
  // Preserve the exported name for existing callers. The sales hold covers all
  // first-party purchasing entry points, including query strings and fragments.
  // Accept quoted and unquoted href values; ignore data-href and other attributes.
  // Keep the check anchored to first-party absolute paths, not external sites.
  const anchors = String(html ?? '').match(/<a\\b[^>]*>/gi) || [];
  for (const anchor of anchors) {
    const match = anchor.match(/(?:\\s)href\\s*=\\s*(?:(["'])(.*?)\\1|([^\\s>]+))/i);
    if (!match) continue;
    const href = match[2] ?? match[3];
    if (/^\\/(?:shop|cart|checkout|my-account)(?:[/?#]|$)/i.test(href)) return true;
  }
  return false;
}

/** Reject HTTP 200 text/fallback responses masquerading as complete HTML pages.
 * Use linear string scanning rather than a complex regular expression on remote HTML.
 */
export function isCompleteHtmlDocument(body) {
  const text = String(body ?? '');
  const lower = text.toLowerCase();
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  const skipSpace = () => { while (i < text.length && text.charCodeAt(i) <= 32) i++; };
  skipSpace();
  // Permit harmless leading HTML comments and a standard doctype.
  let seenDoctype = false;
  while (i < text.length) {
    if (lower.startsWith('<!--', i)) {
      const end = lower.indexOf('-->', i + 4);
      if (end < 0) return false;
      i = end + 3;
      skipSpace();
    } else if (!seenDoctype && lower.startsWith('<!doctype', i)) {
      const end = lower.indexOf('>', i + 9);
      if (end < 0 || lower.slice(i + 9, end).trim() !== 'html') return false;
      i = end + 1;
      seenDoctype = true;
      skipSpace();
    } else break;
  }
  if (!lower.startsWith('<html', i)) return false;
  const next = lower.charAt(i + 5);
  if (next !== '>' && next !== ' ' && next !== '\\t' && next !== '\\n' && next !== '\\r') return false;
  const openingEnd = lower.indexOf('>', i + 5);
  if (openingEnd < 0) return false;
  const closingStart = lower.lastIndexOf('</html');
  if (closingStart <= openingEnd) return false;
  let ending = closingStart + 6;
  while (ending < lower.length && lower.charCodeAt(ending) <= 32) ending++;
  if (lower.charAt(ending) !== '>') return false;
  ending++;
  while (ending < lower.length && lower.charCodeAt(ending) <= 32) ending++;
  return ending === lower.length;
}
