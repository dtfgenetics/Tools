import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalRouteInventoryErrors, isCompleteHtmlDocument, hasShopNavigation, isHtmlFallback, matchesAssetMime, mediaType } from './live-verifier-response.mjs';

test('detects HTML fallback for missing JS/CSS/SVG assets', () => {
  for (const html of [
    '<!doctype html><html lang="en">',
    '   <!DOCTYPE   html><title>Fallback</title>',
    '\n\t<html><head></head><body>not JS</body></html>',
    '<HTML class="fallback"><body></body></HTML>',
    '\uFEFF<!doctype html><html></html>',
    '<!-- CDN error response --><html><body>not found</body></html>',
    '<?xml version="1.0" encoding="UTF-8"?><html><body>error</body></html>',
    '<head><title>fallback</title></head>',
    '<body class="error">404</body>',
  ]) assert.equal(isHtmlFallback(html), true, html);
});

test('does not misclassify valid JavaScript, CSS or SVG', () => {
  for (const content of [
    'export function calculate() { return 42; }',
    '  .shell { display: grid; }',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>',
    '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>',
    '<!-- SVG asset --><svg xmlns="http://www.w3.org/2000/svg"></svg>',
    'const html = "<!doctype html>";',
    '/* comment */ const page = "<html>";',
    '',
  ]) assert.equal(isHtmlFallback(content), false, content);
});

test('normalizes parameterized and mixed-case media types', () => {
  assert.equal(mediaType(' TEXT/JAVASCRIPT ; charset=utf-8'), 'text/javascript');
  assert.equal(mediaType(null), '');
});

test('accepts recognized browser JavaScript, CSS, and SVG MIME types', () => {
  for (const mime of ['text/javascript', 'application/javascript', 'application/x-javascript', 'text/ecmascript', 'application/ecmascript']) {
    assert.equal(matchesAssetMime('/assets/example.mjs', mime + '; charset=UTF-8'), true, mime);
    assert.equal(matchesAssetMime('/assets/example.js', mime), true, mime);
  }
  assert.equal(matchesAssetMime('/assets/style.css', 'text/css; charset=utf-8'), true);
  assert.equal(matchesAssetMime('/atlas/icon.svg', 'image/svg+xml'), true);
});

test('rejects HTML fallbacks, swapped content types, and unknown assets', () => {
  assert.equal(matchesAssetMime('/assets/example.mjs', 'text/html'), false);
  assert.equal(matchesAssetMime('/assets/example.mjs', 'text/css'), false);
  assert.equal(matchesAssetMime('/assets/style.css', 'application/javascript'), false);
  assert.equal(matchesAssetMime('/assets/icon.svg', 'text/html'), false);
  assert.equal(matchesAssetMime('/assets/example.js', ''), false);
  assert.equal(matchesAssetMime('/assets/readme.txt', 'text/javascript'), false);
});

test('accepts asset URLs with cache-busting query strings and fragments', () => {
  assert.equal(matchesAssetMime('/assets/app.js?v=123', 'text/javascript'), true);
  assert.equal(matchesAssetMime('/assets/app.mjs#module', 'application/javascript'), true);
  assert.equal(matchesAssetMime('/assets/site.css?build=1', 'text/css'), true);
  assert.equal(matchesAssetMime('/assets/icon.svg?rev=2#mark', 'image/svg+xml'), true);
  assert.equal(matchesAssetMime('/assets/app.js?rev=2', 'text/html'), false);
  assert.equal(matchesAssetMime('/assets/readme.txt?file=.js', 'text/javascript'), false);
});

test('live route inventory must match the canonical manifest exactly', () => {
  const canonical = ['/tools/', '/vpd-chart/', '/science-labs/'];
  assert.deepEqual(canonicalRouteInventoryErrors(canonical, [...canonical].reverse()), []);
  assert.match(canonicalRouteInventoryErrors(canonical, ['/tools/', '/vpd-chart/']).join(' '), /not checked live: \/science-labs\//);
  assert.match(canonicalRouteInventoryErrors(canonical, [...canonical, '/unexpected/']).join(' '), /unlisted canonical route/);
  assert.match(canonicalRouteInventoryErrors(canonical, ['/tools/', '/tools/', '/science-labs/']).join(' '), /duplicate route/);
  assert.match(canonicalRouteInventoryErrors(canonical, ['/tools', '/vpd-chart/', '/science-labs/']).join(' '), /invalid route/);
  assert.deepEqual(canonicalRouteInventoryErrors(null, canonical), ['canonical route inventories must be arrays']);
});

test('empty canonical inventories cannot produce a green live verification', () => {
  assert.match(canonicalRouteInventoryErrors([], []).join(' '), /manifest has no routes/);
  assert.match(canonicalRouteInventoryErrors([], []).join(' '), /live verifier has no routes/);
  assert.match(canonicalRouteInventoryErrors(['/tools/'], []).join(' '), /live verifier has no routes/);
  assert.match(canonicalRouteInventoryErrors([], ['/tools/']).join(' '), /manifest has no routes/);
});


test('published educational pages must not link to Shop during sales hold', () => {
  for (const html of [
    '<nav><a href="/shop/">Shop</a></nav>',
    '<a class="menu-link" href = \'/shop/\'>Shop</a>',
    '<A HREF="/shop/" aria-label="Shopping">View</A>',
    '<a data-link="true" href="/shop/" target="_self">Buy</a>',
    '<a href="/cart/">Cart</a>',
    '<button class="button single_add_to_cart_button" data-product_id="42">Buy</button>',
    '<a class="button ajax_add_to_cart add_to_cart_button" data-product_id="42">Add</a>',
    '<input class="single_add_to_cart_button" type="submit" value="Add">',
    '<form><button type="submit" name="add-to-cart" value="42">Buy</button></form>',
    '<form action="/tools/"><input type="submit" name="ADD-TO-CART" value="42"></form>',
    '<a href=/cart/>Cart</a>',
    '<a href = /checkout/?pay=1>Pay</a>',
    '<a href=/my-account>Account</a>',
    '<a href="/checkout/?pay=1">Checkout</a>',
    '<a href="/my-account/#orders">Account</a>',
    '<a href="/SHOP">Shop</a>',
    '<a href="/checkout/order-pay/123">Pay</a>',
    '<a href="&#47;checkout/">Encoded slash checkout</a>',
    '<a href="&#x2f;cart/">Encoded slash cart</a>',
    '<a href="/ch&#101;ckout/">Encoded checkout text</a>',
    '<a href="&sol;checkout/">Named slash checkout</a>',
    '<a href="&sol;cart/">Named slash cart</a>',
    '<a href="https&colon;//dtfseeds.com/checkout/">Named colon checkout</a>',
    '<a href="/tools/&period;&period;/shop/">Named dot segments</a>',
    '<a href=&#47;my-account/>Encoded unquoted account</a>',
    '<a href="https://dtfseeds.com/checkout/">Same-origin checkout</a>',
    '<a href="//dtfseeds.com/cart/">Protocol-relative cart</a>',
    '<a href="/tools/../checkout/">Normalized checkout</a>',
    '<a href="https://dtfseeds.com/shop?filter=1">Same-origin shop</a>',
    '<a href="/%63heckout/">Percent-encoded checkout</a>',
    '<a href="/%2563heckout/">Double-encoded checkout</a>',
    '<a href="/cart%2Forder/">Encoded cart separator</a>',
    '<a href="https://dtfseeds.com/%73hop/">Encoded absolute shop</a>',
    '<a href="/?add-to-cart=123">Add product directly</a>',
    '<a href="/tools/?ADD-TO-CART=123">Add product from educational route</a>',
    '<form action="/?wc-ajax=add_to_cart" method="post">Add</form>',
    '<a href="https://dtfseeds.com/?wc-ajax=ADD_TO_CART">Ajax cart</a>',
    '<form method="post" action="/checkout/"><button>Pay</button></form>',
    '<form action="/?wc-ajax=checkout" method="post">Place order</form>',
    '<button type="submit" formaction="/checkout/">Pay</button>',
    '<input type="submit" formaction="/?add-to-cart=123" value="Buy">',
    '<button title="safe > info" formaction="/wp-json/wc/store/v1/checkout">Pay</button>',
    '<a href="/wp-json/wc/store/v1/cart/add-item">Cart API</a>',
    '<form action="/wp-json/wc/store/v1/checkout" method="post">Checkout API</form>',
    '<form action="/?rest_route=%2Fwc%2Fstore%2Fv1%2Fcart%2Fadd-item">REST query cart</form>',
    '<a href="/?rest_route=/wc/store/v1/checkout">REST query checkout</a>',
    '<FORM ACTION=https://dtfseeds.com/cart/ method=post><button>Add</button></FORM>',
    '<form data-action="/tools/" action="&#47;checkout/order-pay/">Pay</form>',
    '<form title="more > information" action="/shop/">Search shop</form>',
    '<a title="comparison > results" href="/checkout/">Checkout after quoted greater-than</a>',
    '<a aria-label="more > information" href=/cart/>Cart after quoted greater-than</a>',
  ]) assert.equal(hasShopNavigation(html), true, html);
  for (const html of [
    '<nav><a href="/tools/">Tools</a></nav>',
    '<button data-class="single_add_to_cart_button" class="education">Lesson</button>',
    '<button data-name="add-to-cart" name="lesson" type="submit">Lesson</button>',
    '<input name="add-to-cart-info" type="submit" value="Read">',
    '<a class="not_add_to_cart_button" href="/tools/">Documentation</a>',
    '<a title="class=add_to_cart_button" href="/tools/">Help</a>',
    '<a href="/tools/?topic=add-to-cart">Documentation topic</a>',
    '<a href="https://example.com/?add-to-cart=123">External cart is not ours</a>',
    '<a href="/tools/?wc-ajax=lookup">Non-purchasing ajax</a>',
    '<a href="/wp-json/wp/v2/posts">Public REST docs</a>',
    '<a href="/wp-json/wc/store/v1/products">Read-only product catalogue</a>',
    '<button type="submit" formaction="/tools/">Open guide</button>',
    '<input type="submit" formaction="https://example.com/checkout/" value="External">',
    '<button data-formaction="/checkout/" formaction="/tools/">Educational</button>',
    '<a href="/?rest_route=/wc/store/v1/products">Read-only product query</a>',
    '<a href="https://example.com/wp-json/wc/store/v1/checkout">External API</a>',
    '<a href="/shop-info/">Sales on hold</a>',
    '<a href="/shopping-guide/">Guide</a>',
    '<a href="/cartography/">Maps</a>',
    '<a data-href="/checkout/" href="/tools/">Tools</a>',
    '<a href=/checkout-info/>Information</a>',
    '<a href="/checkout-info/">Information</a>',
    '<a href="/my-account-help/">Help</a>',
    '<!-- <a href="/checkout/">Removed purchase link</a> -->',
    '<!-- <form action="/cart/"><button>Old checkout</button></form> -->',
    '<!-- abandoned <a href="/shop/">',
    '<p>Sales on hold. Learn about strains and genetics.</p>',
    '<a href="https://example.com/shop/">External</a>',
    '<a href="https://other.example/checkout/">External checkout</a>',
    '<a href="https://dtfseeds.com/checkout-info/">Educational information</a>',
    '<a href="/tools/checkout/">Nested educational route</a>',
    '<a href="/%63heckout-info/">Encoded educational lookalike</a>',
    '<a href="/tools/%63heckout/">Nested encoded educational route</a>',
    '<form action="/tools/" data-action="/checkout/">Educational search</form>',
    '<form action="https://example.com/checkout/">External form</form>',
    '<form title="action=/checkout/" action="/vpd-chart/">Educational form</form>',
    '<a title="href=/checkout/" href="/tools/">Quoted title is not a destination</a>',
    '<a aria-label="href=/cart/ > details" href="/vpd-chart/">Quoted label is not a destination</a>',
    '',
    null,
  ]) assert.equal(hasShopNavigation(html), false, String(html));
});

test('live HTML pages must contain a complete HTML document', () => {
  assert.equal(isCompleteHtmlDocument('<!doctype html><html lang="en"><body>OK</body></html>'), true);
  assert.equal(isCompleteHtmlDocument('\uFEFF<html><body>OK</body></html>'), true);
  assert.equal(isCompleteHtmlDocument('<!-- CDN banner -->\n<!DOCTYPE html>\n<html lang="en"><body>OK</body></html>'), true);
  for (const bad of ['OK', '<h1>Tools</h1>', '<html><body>partial', '<html><body>broken</body></html><script>injected</script>', '<!-- <html> --><h1>Not a document</h1></html>', '']) {
    assert.equal(isCompleteHtmlDocument(bad), false, bad);
  }
});
