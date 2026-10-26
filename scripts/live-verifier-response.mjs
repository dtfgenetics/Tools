// Shared HTTP-response classifier for fail-closed cultivation release checks.
// Inspect only the document prefix; an HTML error page may begin with a UTF-8 BOM,
// XML declaration, or an injected hosting-provider comment.
export function isHtmlFallback(body) {
  const prefix = String(body ?? '').slice(0, 4096);
  const lead = prefix.replace(/^\uFEFF/, '').replace(/^(?:\s|<!--[\s\S]*?-->|<\?xml\s[^>]*\?>)*/i, '');
  return /^(?:<!doctype\s+html\b|<html(?=[\s>])|<head(?=[\s>])|<body(?=[\s>]))/i.test(lead);
}
