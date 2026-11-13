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
