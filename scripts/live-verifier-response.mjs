// Shared HTTP-response classifier for fail-closed cultivation release checks.
export function isHtmlFallback(body) {
  return /^\s*<!doctype\s+html|^\s*<html[\s>]/i.test(String(body));
}
