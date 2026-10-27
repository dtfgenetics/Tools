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
  if (path.endsWith('.svg')) return mime === 'image/svg+xml';
  if (path.endsWith('.css')) return mime === 'text/css';
  if (/\.(?:js|mjs)$/.test(path)) return [
    'text/javascript', 'application/javascript',
    'application/x-javascript', 'text/ecmascript', 'application/ecmascript',
  ].includes(mime);
  return false; // Unexpected file types are not assumed safe.
}
