# THC Tools release completion register

Updated: 2026-11-18. This register records **verified evidence**, not a claim of production readiness. Canonical implementation: `dtfgenetics/Tools`; integration/deployment mirror: `dtfgenetics/Thc`.

| Priority | Owner | Work item | Status / evidence | Acceptance criteria | Next action |
| --- | --- | --- | --- | --- | --- |
| P0 | Tools | PPFD/DLI whitespace-only numeric inputs | [PR #266](https://github.com/dtfgenetics/Tools/pull/266) **merged**, squash commit `7df16bb752451ccc01407a8e448beffde1ea6b1f`. Final PR head `954036f49cdb0a4a588e1372707fec56b8628ba0` passed [numeric-input regression](https://github.com/dtfgenetics/Tools/actions/runs/44558250740), [PPFD math acceptance](https://github.com/dtfgenetics/Tools/actions/runs/44558250803), [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44558250823), [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44558251020), [Guided Tool Chapters](https://github.com/dtfgenetics/Tools/actions/runs/44558250524). Direct main-source inspection confirms whitespace trim fix. Full `npm test`, postmerge main checks, and deployed site parity unverified. | Numeric parser correctly treats blank/whitespace as missing; regression and focused CI pass; merge to main complete; production matches source | Verify deployed PPFD route against merged SHA and full repository suite; do not claim site release without parity |
| P0 | Tools | VPD logger fallback CSV quote integrity | [PR #265](https://github.com/dtfgenetics/Tools/pull/265) **merged** 2026-11-18, squash commit `a76a7f553191726afca1230b8d7c0fb00baff682`; direct `main` inspection confirms malformed-quote rejection present. Exact PR head `1e1b20143a475e496dfa5de3b5443895868f231b` passed [Chrome + cultivation reference validator](https://github.com/dtfgenetics/Tools/actions/runs/44423861511), [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44423861490), [VPD lesson](https://github.com/dtfgenetics/Tools/actions/runs/44423861500), [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44423861663). Full `npm test`, main-postmerge checks, and deployed SHA not verified. | CSV parser rejects malformed quoted fields; Chrome fallback and focused validator pass; reviewed merge to main complete; production matches merged source | Verify main CI and Tools-to-Thc deployment synchronization; browser-check production CSV fallback; run full suite; do not mark production released without deployed SHA |
| P0 | Tools | Live asset MIME checks | PR [#243](https://github.com/dtfgenetics/Tools/pull/243) **merged 2026-11-13** at merge commit `54d26063ca5cfb75145ee84da961f21fea8789ab`; cache-busted asset MIME fix and focused regression tests are present on `main`; focused and full test execution results not independently verified in this run | Exact-head tests pass; cache-busted JS/CSS/SVG pass, HTML fallback fails; reviewed PR merged | Run `npm run test:live-verifier` and `npm test` on current `main`; verify live asset responses and deployment SHA |
| P0 | Tools | Manifest-to-live route coverage | [PR #247](https://github.com/dtfgenetics/Tools/pull/247) **closed** by 2026-11-16, head `ddab96ba86a9d4c3261febdbd323fc7cad87c08f`. The implementation and empty-inventory regression tests are present on `main` (direct file inspection). Exact-head [Live verifier regression](https://github.com/dtfgenetics/Tools/actions/runs/43731784199), canonical ownership guard and CodeQL all **completed successfully**. Closure does not independently establish a production deployment SHA or live route parity | Exact-head tests and security pass; missing/empty route inventories fail closed; live deployed route inventory matches canonical manifest | Run `npm run verify:live` against production with documented SHA, confirm all route/asset HTTP statuses and browser interactions; do not infer deployment from PR closure |
| P0 | Tools | PPFD/DLI browser acceptance | PR [#248](https://github.com/dtfgenetics/Tools/pull/248) merged 2026-11-14; adds Chrome browser tests for DLI calculations, invalid schedules, canopy grid and responsive behavior; exact-head test results and production deployment not independently verified in this run | Browser acceptance passes on exact merged SHA and live release | Collect Actions evidence, run against production release after controlled sync |
| P0 | Thc | Atlas image and canonical metadata preservation during synchronization | [Thc PR #2567](https://github.com/dtfgenetics/Thc/pull/2567) open at `7ccd31c236ef32fab40ecf029f32b981d7705b0d`; fixes false `<img>` counts in comments/scripts, rejects insecure or malformed HTTPS canonical URLs, and includes regression tests. Atlas Preservation Guard Tests, responsive layout, publishability and release hardening passed on exact head; CodeQL passed on exact head. Earlier CodeQL inline findings are resolved/outdated, but no approval or merge recorded | Canonical sync preserves substantive lessons and illustrations; metadata uses correct HTTPS canonical links; exact-head security and validation checks pass, reviewed PR merged | Confirm final CodeQL result, obtain approval, then merge and rerun full Tools→Thc mirror/production checks |
| P0 | Thc | Responsive image asset verification | [Thc PR #2568](https://github.com/dtfgenetics/Thc/pull/2568) open at head `72579227f7cdcfe84b8e310f74a159f6e1decc24`; public route-health audit now discovers first-party responsive candidates and ignores image-looking markup in comments/scripts/styles/templates. Regression tests added, new-head CI in progress; release-hardening, publishability and responsive layout passed at last check. Earlier head's deterministic audit passed; Lighthouse failed due to HTTP 403 (not proof of a performance regression) | No missed real mobile/desktop image assets or false findings from nonrendered markup; exact-head tests/security pass; reviewed PR merged and live verified | Confirm focused test step and CodeQL on latest head; keep Lighthouse WAF blocker visible and resolve access safely |
| P0 | Thc | Public route offsite redirect integrity | [Thc PR #2582](https://github.com/dtfgenetics/Thc/pull/2582) open at `a0d599dfba845e7358b16f6fed15d9ca0cff926e`; fixes public route health accepting HTTP 200 after offsite redirects, adds route-origin regression tests and Web Quality CI integration; CI running at last check | Every public canonical route remains on HTTPS dtfseeds.com after redirects; deterministic tests and relevant security gates pass; reviewed PR merged and deployed SHA verified | Collect exact-head test and CodeQL results, review and merge when approved, verify production navigations without weakening WAF |
| P0 | Thc | Production browser/Lighthouse verification | [Thc PR #2566](https://github.com/dtfgenetics/Thc/pull/2566) open at `3a2b99ddc6ae5fbc3232629166fe3bf9a387d59c`; canonical mirror guard succeeded, but [Web quality run 43565967794](https://github.com/dtfgenetics/Thc/actions/runs/43565967794) failed: headless Chrome homepage navigation returned HTTP 403 from `hcdn`; zero measured routes | Browser can access publicly deployed build; Lighthouse emits usable metrics on exact deployed revision and reviewed gate passes | Investigate hosting/WAF challenge for CI runner; secure an approved origin/staging test path without weakening protections; keep gate blocking until trustworthy evidence is available |
| P0 | Tools + Thc | Canonical Atlas mirror parity | [#155](https://github.com/dtfgenetics/Tools/issues/155) reports 27 drifted pages and risk of overwriting richer educational content | Review and preserve substantive lessons; repair canonical and og:url metadata; exact byte parity after controlled upstream sync | Compare each drifted page, upstream validated improvements, then verify mirror before merge |
| P0 | Tools | VPD unit-toggle blank-input preservation | **Superseded implementation / release verification pending (2026-11-18).** [PR #253](https://github.com/dtfgenetics/Tools/pull/253) is **closed without merge** (head `cec5cc53b1bf2b817b0d4d142c67860f7085d65a`). Independent implementation is present on `main` in `site/public-route-patch/vpd-chart/index.html` as `convertVpdTemperatureInput` (blob `774a6cd4f3c25f9a801d327ed35fc75e40a861d1`); `scripts/validate-cultivation-reference-tools.mjs` already runs extracted helper checks for blank, invalid, Celsius/Fahrenheit and offset values. Live [VPD page](https://dtfseeds.com/vpd-chart/) returned HTML on 2026-11-18 and shows calculator, heatmap, logger, but static HTTP retrieval cannot verify browser interaction or deployed SHA. Do not reopen/duplicate #253 | Run exact-main deterministic validator, full tests and security CI; browser test blank input across unit toggles, responsive and keyboard controls; correlate live deployment to source SHA | Gather exact-main CI and browser evidence; verify production bundle, then close this acceptance item only after live behavior passes |
| P0 | Tools | End-to-end tools release | [#210](https://github.com/dtfgenetics/Tools/issues/210) open | Every manifest route and asset validated; known-answer science tests, keyboard/mobile browser tests, production smoke on deployed SHA | Collect exact-head unit, experience, browser and live evidence |
| P0 | Tools + Thc | Event-driven sync | [#90](https://github.com/dtfgenetics/Tools/issues/90) open; scheduled fallback exists | Least-privilege dispatch works without exposing token; pinned SHA and fallback preserved | Configure controlled dispatch credential and test end-to-end |
| P0 | Thc | Seed sales checkout enforcement | [Thc PR #2571](https://github.com/dtfgenetics/Thc/pull/2571) open at `6681df2744edee0d9caed57b84552983af44b845`; Store API cart mutation and checkout guards with passing Seed Sales Hold Transaction Guard CI at last check. Public `/seeds/` HTML currently states sales are on hold, displays genetics and says purchasing is unavailable; server-side production checkout is not independently verified | All cart and checkout mutation routes deny sale server-side; documented breeding information remains visible; exact deployed SHA and tests verified | Complete security/review for #2571 and test actual production Store API checkout denial without creating an order |
| P0 | Thc | Seed purchasing disabled | Not verified in this register | No public purchase or checkout entry points while strain descriptions remain visible | Inspect public routes and server-side commerce controls; record evidence |
| P1 | Thc-learning-courses- + Thc | Academy learner pilot | Not assessed in this run | Persisted progress, secure timed assessments, grading, verifiable certificates and accessible mobile flow | Inspect current code and tests before selecting implementation |
| P1 | Thc + Tools | Encyclopedia and educational figures | Not assessed in this run | Searchable permanent lessons with evidence citations and functional cross-links | Coordinate with separate educational-content automation; do not duplicate bulk visual production |
| P2 | Thc | Existing educational games | Not assessed in this run | Playable, accessible, responsive core loop, saved state and tests | Inspect one game at a time after P0 gates |

## Evidence rules

1. **Open PR is not a deployed fix.** Record commit SHA, test command, result, review, merge and live verification separately.
2. Do not treat HTTP 200 or static content checks as proof that interactive controls work.
3. Do not weaken security, bypass required reviews, or overwrite expanded Atlas lessons to force mirror parity.
4. On every run, update only rows for which new repository or deployment evidence exists. Record links to test runs, PRs, deployed SHA and concrete blockers.
5. Do not claim production performance targets (LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at p75) without field or appropriately scoped lab measurements.

### Production synchronization verification — 2026-11-19

- Canonical Tools main contains merged VPD fix `a76a7f553191726afca1230b8d7c0fb00baff682` and PPFD fix `7df16bb752451ccc01407a8e448beffde1ea6b1f`.
- Direct `dtfgenetics/Thc` main inspection of `site/public-route-patch/assets/release-source-revisions/tools.txt` reports pinned canonical SHA **`ba6b93ae1eb9a50a4b9ea7f431ad08c8b2f7f83f`**. This differs from both recent merge commits; the integration mirror is not proven current. Do not infer production parity from public HTTP 200 pages.
- `dtfgenetics/Thc/.github/workflows/sync-canonical-tools.yml` includes a **five-minute scheduled fallback** plus `repository_dispatch` and `workflow_dispatch`; GitHub issue [Tools #90](https://github.com/dtfgenetics/Tools/issues/90) records missing `DTF_THC_SYNC_TOKEN` for immediate dispatch. Inspect sync workflow runs/failures, preserve Atlas guard, and verify pinned SHA advances to current Tools main before release.
- Spot-check of two formerly drifted Atlas pages (`atlas/leaf-module/chlorosis/index.html` and `atlas/leaf-module/leaf-curl/index.html`) shows **identical Git blob SHAs** in current Tools and Thc main (`5bb82c170e6e260b137d84508c8a4496cc42229b`, `08a30137ba089a7d38555555859c12356120c996`) and corrected `https://` canonical URLs. This is positive **two-file parity evidence**, not proof of full tree parity; the pinned revision still requires reconciliation.
- Public `/vpd-chart/` and `/ppfd-chart/` return readable pages, but runtime behavior and exact deployed JS SHA are not established by this static inspection.
- Release PR [Thc #2566](https://github.com/dtfgenetics/Thc/pull/2566) is a reviewed canonical mirror at older Tools SHA `3dd9d2090cad6288ee14079c03976f566d84ee19`. Exact-head checks: 9 passed (release hardening, responsive, project safety, publishability, Project OS, canonical mirror, WordPress parity, CodeQL, Public Suite); **Web quality system failed**. Do not merge while failed, and even after repair rebase/update canonical source to include newer Tools fixes. Automation PR [#2561](https://github.com/dtfgenetics/Thc/pull/2561) has 10 `action_required` workflow conclusions, not passing checks. Neither is release-ready.

### Live tools commerce-navigation release guard — 2026-11-20

- **Owner:** canonical Tools [PR #276](https://github.com/dtfgenetics/Tools/pull/276), implementation/test head `b4832ccbc01fae93c334a485a7df4d07f2b96cbc`.
- **Before:** `hasShopNavigation` rejected only a literal `/shop/` anchor, leaving cart, checkout, account, nested payment routes and query variants unflagged by the live HTML verifier.
- **After (source):** shared live-response classifier flags first-party `/shop`, `/cart`, `/checkout`, and `/my-account` anchor routes with nested paths, queries or fragments; educational lookalike routes remain allowed. Regression cases added in `scripts/live-verifier-response.test.mjs`.
- **Acceptance:** `npm run test:live-verifier`, full `npm test`, ownership and CodeQL on exact PR head, independent Release Gate approval. CI status pending at this recording. Server-side WooCommerce Store API/cart/checkout denial and live deployed SHA are **not** verified by static HTML checks. No merge/deploy claimed.

### Commerce navigation verifier: unquoted href coverage — 2026-11-20

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276). Source commit `9379c377c786e375869c3c66415c5cc93d7c2260` (after test commit `2bdb1475851d9fe7475ebafde860d1d17c88d0e3`).
- **Before:** `hasShopNavigation` matched quoted commerce anchors but missed HTML-valid unquoted `href=/cart/` and `href=/checkout/`; the check also needed to distinguish `data-href` from real navigation.
- **After:** inspect anchor href attributes, including unquoted values, and reject first-party shop/cart/checkout/my-account paths while ignoring unrelated routes and `data-href`. Regression cases added for unquoted links and a non-commerce href with a commerce `data-href`.
- **Changed:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, this completion register.
- **Evidence status:** exact-head CI must be checked after this documentation commit. Previous PR head `7f510adc0db73156524240673c892eee8d61f319` had successful ownership, CodeQL, and live-verifier workflows (44735416977, 44735417025, 44735416654), but those do not validate this revision.
- **Release:** PR remains subject to independent Release Gate. No merge, deployment, browser parity, or server-side WooCommerce checkout denial is claimed.

### Commerce navigation HTML-entity bypass regression — 2026-11-20

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276), source commit `5a2bef6654c2f52245c843db302005a2f40a32ce`, test commit `ed3205b2034e2ad3fc8d2297ff2ca51bd83f98ba`.
- **Before:** HTML-valid numeric character references in anchor href attributes (for example `&#47;checkout/` or `/ch&#101;ckout/`) bypassed the raw-text commerce-link guard although browsers decode these references before navigation.
- **After:** `hasShopNavigation` decodes valid decimal/hex numeric character references in extracted anchor href values before checking first-party commerce routes. Regression cases cover encoded checkout/cart/account links and an unquoted encoded href; existing negative tests preserve educational routes.
- **Paths:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, this register.
- **Verification:** Previous exact-head `0242d2853e329f12f29024efe1251034221615d9` passed CodeQL, live-verifier regression and ownership workflows (44743438883, 44743438753, 44743438771). These prior results **do not** verify the new code. Await exact-head focused and repository CI, then independent Release Gate review. Server-side WooCommerce Store API/cart/checkout denial, live browser and deployed SHA are unverified. Not merged or deployed.

### Same-origin commerce URL navigation guard — 2026-11-20

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276). Source `51da3abb7a7d59c410614062ef94f801a24334e0`, tests `ab420f34f2839727a367d18ba717f8341c7d6550`.
- **Before:** static verifier rejected root-relative commerce hrefs but missed `https://dtfseeds.com/checkout/`, `//dtfseeds.com/cart/` and dot-segment `/tools/../checkout/` links, all of which navigate to first-party purchasing routes.
- **After:** URL parser normalizes hrefs against first-party tools base; first-party shop/cart/checkout/my-account paths are denied, external domains and educational lookalikes remain allowed. Added positive and negative deterministic tests.
- **Changed:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, completion register.
- **Evidence:** prior head `50b8d0f96d597dd1b789e87a5d8fc93831e1d882` passed live verifier run 44753695823, ownership 44753695517 and CodeQL 44753695629. Those checks **do not** verify these new commits. Await exact-head regression, npm test, ownership and CodeQL; independent Release Gate required.
- **Release:** not merged or deployed. Static HTML detection does not prove server-side WooCommerce checkout/Store API denial or live deployed SHA.

### Live verifier named HTML entity purchasing-link guard — 2026-11-20

- **Owner:** canonical Tools [PR #276](https://github.com/dtfgenetics/Tools/pull/276). Before: `hasShopNavigation` decoded numeric HTML entities, but `href="&sol;checkout/"` and `href="https&colon;//dtfseeds.com/checkout/"` could evade first-party commerce detection even though browsers decode named entities.
- **After (source):** `scripts/live-verifier-response.mjs` additionally decodes navigation-significant named HTML entities before URL parsing; `scripts/live-verifier-response.test.mjs` adds named-slash, named-colon and named-dot-segment regression cases. Functional/test head `3a1a5ce800f0cab6f5bb984e5c7e46f5c9ebdebb`.
- **Verification:** previous head `54e61a565f6b0f1dc6594743362674a48b9845b4` passed live-verifier regression, canonical ownership and CodeQL (runs 44762077459, 44762077385, 44762077538). Those results do not verify this change. Exact-head workflows for the new revision were not yet returned at time of recording; run `npm run test:live-verifier`, `npm test`, ownership and CodeQL on exact head.
- **Release:** open PR, not merged/deployed. This only detects purchase navigation in verified static HTML; JavaScript-generated links and server-side WooCommerce cart/checkout/Store API denial require separate controls and production verification. Preserve seed catalogue visibility and sales hold.

### Percent-encoded commerce navigation release guard — 2026-11-20

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276); functional commit `f1330ad8962cf26ad9e4606858ab126cbdaff053`, regression commit `232f5e8ba2e667835a9cb4d2b430e3fe5b4e4ab5`.
- **Before:** URL.pathname retains percent escapes, allowing links such as `/%63heckout/`, `/%2563heckout/`, or `/cart%2Forder/` to evade the first-party sales-hold navigation verifier even when server routing decodes them.
- **After:** `hasShopNavigation` checks the normalized pathname and up to three decoding stages, safely stopping on malformed escapes. Regression cases include encoded and double-encoded purchasing paths plus educational lookalikes that must remain allowed.
- **Changed:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, `docs/RELEASE_COMPLETION_REGISTER.md`.
- **Prior exact-head evidence:** `128048d132ee7f12da8958dfa0a68da630eaeb0f` passed ownership run 44773272403, live-verifier regression run 44773271936 and CodeQL run 44773272007; those checks do not verify these new changes. Await exact-head CI for the new commit before Release Gate review.
- **Release status:** PR open, not merged or deployed. Server-side WooCommerce cart/checkout/Store API denial and live deployed SHA remain unverified. Static link detection is not a substitute for transaction prevention.

### Live verifier anchor attribute parsing — 2026-11-20

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276), implementation/test head `c5d851b397f89479927a7b674d0daf3c7124ddad`.
- **Before:** regular-expression anchor extraction stopped at `>` inside a quoted attribute, potentially skipping an actual later `href=/checkout/`; a quoted `title="href=/checkout/"` could also be mistaken for a genuine commerce link. These are opposite false-negative and false-positive release-gate defects.
- **After:** quote-aware anchor boundary scanning and attribute parsing distinguish actual `href` from other attribute values, while retaining URL normalization and commerce classification. Deterministic regression cases cover quoted greater-than and spoofed title/label text.
- **Changed:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, this register.
- **Verification:** previous PR head `08df06a36f04d563296defa050e7a09a3e321c92` passed Live verifier regression, ownership and CodeQL (runs 44783286991, 44783286744, 44783286783). Those outcomes **do not validate this revision**. Await exact-head CI, inspect job steps, repair failures, and hand off independent Release Gate. No merge/deploy or server-side WooCommerce denial established.

### 2026-11-20 — PR #276 live-verifier CI syntax repair

- **Before:** exact-head `7170d6e174daa127767c13e8818eb31c8fb34d7e` failed [focused regression](https://github.com/dtfgenetics/Tools/actions/runs/44792450719) and [canonical ownership](https://github.com/dtfgenetics/Tools/actions/runs/44792450710) because malformed JavaScript regex ` /\\s|\\// ` raised `SyntaxError: Unexpected token '.'` at `scripts/live-verifier-response.mjs:69`. CodeQL passed on that prior head but does not validate runtime syntax.
- **After (implementation):** repaired anchor-scanner whitespace regex, malformed double-escaped regular expressions and whitespace character checks in `scripts/live-verifier-response.mjs` on the existing PR #276 branch. Current implementation commit `99ea7715d112e942ed2fa06d43d52685b15d181f`. No production deployment or server-side checkout enforcement claimed.
- **Acceptance:** `npm run test:live-verifier`, full `npm test`, ownership and CodeQL must pass on the exact new head; then independent Release Gate review and verified production Store API/cart/checkout denial. **CI status: pending independent check; do not treat the prior head's green CodeQL as proof for the new head.**

### 2026-11-20 — Tools PR #276 commerce form-action coverage

- **Before:** Live verifier classified first-party purchasing anchor `href` destinations, but did not inspect HTML `<form action>` destinations. An educational page could expose a direct checkout form while the navigation check remained green.
- **After:** `scripts/live-verifier-response.mjs` now classifies both anchor `href` and form `action` destinations through the existing same-origin, HTML-entity and percent-decoding logic. `scripts/live-verifier-response.test.mjs` covers first-party checkout/cart/shop form actions and external/educational forms.
- **Implementation head before register update:** `c018b0b14354938401822082b6e08b045b34fc92`; final head and exact-head CI must be verified separately. Prior head `9fbfe58b05cff2a5ae4e5b5f3ca33c73c8facfce` passed ownership [44801353607](https://github.com/dtfgenetics/Tools/actions/runs/44801353607), live-verifier regression [44801353666](https://github.com/dtfgenetics/Tools/actions/runs/44801353666), CodeQL [44801353638](https://github.com/dtfgenetics/Tools/actions/runs/44801353638); these do **not** validate the new head.
- **Remaining P0:** This is detection only. Require independent Release Gate approval, merge, controlled Tools→Thc sync, deployed revision proof, and server-side WooCommerce Store API/cart/checkout mutation denial verification. Do not claim live sales hold enforced from static checks.

### 2026-11-20 — Direct WooCommerce query entry points (Tools PR #276)
Before: the static public HTML verifier rejected commerce paths but could allow first-party `/?add-to-cart=123` links and `?wc-ajax=add_to_cart` forms. After: `hasShopNavigation` rejects these query-driven cart mutations on any first-party route, while allowing documentation query values, unrelated AJAX actions, and external URLs. Changed: `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`. Implementation head: `460a00e4a3dd7ea1559178724c9fc5117c5c8a04`. Previous head `43677063870225b5aa4cf369a1109e36f1d8976d` passed live-verifier, ownership, and CodeQL workflows (44810980256, 44810980251, 44810979963). **New exact-head CI not yet established; full npm test not established.** Independent Release Gate review required. This remains detection only: server-side WooCommerce transaction denial and production parity are unverified.

### 2026-11-20 — AJAX checkout and Store API entry-point guard (Tools PR #276)

- **Before:** static live verification caught cart links and `wc-ajax=add_to_cart`, but could accept first-party `?wc-ajax=checkout`, `/wp-json/wc/store/v1/cart/add-item`, `/wp-json/wc/store/v1/checkout`, and `?rest_route=/wc/store/v1/checkout` form actions. Those are purchase mutations despite lacking the normal checkout pathname.
- **After:** `scripts/live-verifier-response.mjs` rejects these first-party AJAX and Store API cart/checkout entry points, including percent-encoded REST query paths. `scripts/live-verifier-response.test.mjs` adds negative and positive cases; read-only product catalogue and external endpoints remain allowed.
- **Source implementation:** `7542c8f736479206b8a4cca6a43b2bd1d7c25f60` (tests), preceded by `15f3d4e637ed534e33d68915590e3c697bdad8e9` (logic). Prior head `f03ddd8d91043ceea961da4684091245d36db446` passed [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44819854397), [live-verifier regression](https://github.com/dtfgenetics/Tools/actions/runs/44819854382) and [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44819854421). These prior checks **do not validate this new head**.
- **Outstanding:** exact-head regression, ownership, CodeQL and full `npm test`; independent Release Gate approval; reviewed merge, controlled mirror sync and production transaction-denial verification. Static link/form scanning is not server-side enforcement.

### 2026-11-20 — Submit-control formaction sales-hold guard (Tools PR #276)

- **Before:** The canonical live verifier checked anchor href and form action but not per-submit `button`/`input` `formaction`, which can override a safe form action and submit directly to checkout or add-to-cart.
- **After:** `scripts/live-verifier-response.mjs` classifies `button` and `input` `formaction` with the same first-party URL and commerce endpoint rules. `scripts/live-verifier-response.test.mjs` adds unsafe checkout/Store API/add-to-cart cases and safe external/educational/data-attribute cases.
- **Implementation commits:** `db77cd0bf56c56c8a5f5ae2408f44aff6033abc6` (logic), `5badf584d6537f605e8ee99667d8f4ee01d5e1ae` (regression). Earlier head `c8a8c94ac1ad5596656f5323278e3a335581f8b0` passed [live verifier](https://github.com/dtfgenetics/Tools/actions/runs/44827828225), [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44827828137) and [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44827828550); those results do not validate this new revision.
- **Remaining:** exact-head CI and full `npm test` not yet established, independent Release Gate review, controlled merge/sync, deployed SHA parity, and server-side WooCommerce transaction-denial verification. Static HTML scanning is not a server-side enforcement mechanism.

### Live commerce guard: commented-out HTML false positives — 2026-11-20

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276). Source `284d5405e8def06c479bafaf4bd3a51490180259`; tests `dfc82451a1b1bc868e321b267a94e38cbc1ec169`.
- **Before:** The HTML scanner treated links/forms inside HTML comments as live navigation, potentially blocking educational releases for removed purchase markup.
- **After:** Ignore HTML comments before scanning real `a`, `form`, `button`, and `input` destinations; preserve rejection of active purchasing entry points. Regression cases cover commented anchors, forms, and unfinished comments.
- **Acceptance:** exact-head live-verifier, ownership, CodeQL, full repository tests, independent Release Gate review. Prior head `9051841e00ebb81f4e57a185dcca597942571537` passed three focused workflows (runs 44836680257, 44836680285, 44836680256); those do **not** validate this new head. Full suite, production server-side denial and deployment SHA unverified. No merge/deploy claimed.


### 2026-11-20 — JS add-to-cart controls (Tools PR #276)

- BEFORE: HTML navigation guard could pass a WooCommerce `single_add_to_cart_button` or `add_to_cart_button` that invokes JavaScript without an `href`, `action`, or `formaction`.
- AFTER: existing tag attribute scanner reads exact `class` values and flags WooCommerce add-to-cart classes on links/buttons/inputs, while preserving educational lookalikes and `data-class` values. Existing URL-based guard remains active.
- Changed: `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`.
- Previous exact head `3e10ef29436d032b1da2279f24fdeab2d7f1f7ad`: [live regression](https://github.com/dtfgenetics/Tools/actions/runs/44843336417), [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44843336430), [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44843336465) completed successfully. These do **not** validate new head `739cc57ea45a6c5f360334a7031a0dc364c07a04`.
- New exact-head tests, full suite, independent review and production deployment: **not yet verified**. Static checks do not prove server-side WooCommerce denial; keep sales hold P0 open.

### 2026-11-20 — Native WooCommerce named submit controls (Tools PR #276)

- **Before:** A native product form could submit `<button name="add-to-cart" value="42">` or `<input name="add-to-cart" type="submit">` to its current page without any commerce URL or CSS class; static live verifier missed it.
- **After:** `hasShopNavigation` flags exact case-insensitive `name=add-to-cart` on button/input controls; unrelated `data-name` and `add-to-cart-info` remain permitted. Regression cases added.
- **Changed:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, `docs/RELEASE_COMPLETION_REGISTER.md` on existing [PR #276](https://github.com/dtfgenetics/Tools/pull/276). Source `ae5bdc1bd2350519ff30e8ac10cfe713a725f786`, test `9cb10d2c26f2d7097191d199819a7d01b0b6f423`.
- **Prior exact-head evidence:** `a6a9b09ceeb7bf5f4fc38fea35dd3c1197406f09` passed [live regression](https://github.com/dtfgenetics/Tools/actions/runs/44849793005), [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44849793010), and [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44849793034). These results do **not** validate the new changes.
- **Still required:** exact-head regression/ownership/CodeQL and full `npm test`, independent Release Gate review, controlled mirror/deployment SHA parity, and direct non-mutating server-side WooCommerce cart/checkout/Store API denial verification. Static detection is not transaction enforcement.

### 2026-11-20 — Case-variant WooCommerce action keys (Tools PR #276)

- **Before:** URL query key matching for `wc-ajax` and `rest_route` was case-sensitive despite other commerce query keys being case-insensitive. `?WC-AJAX=CHECKOUT` and `?REST_ROUTE=/wc/store/v1/checkout` could bypass the static HTML release guard.
- **After:** inspect query entries with case-insensitive key comparison; preserve case-insensitive AJAX action values and read-only catalogue allowances. Added positive and negative deterministic regression cases.
- **Changed:** `scripts/live-verifier-response.mjs` at `9266df90776c42cd6d5f04eac4c4dfd0d4a3f36a`, `scripts/live-verifier-response.test.mjs` at `0d262dd13412a12777fbf433dea9890cc86ee0d0`, and this register. Existing owner branch and [PR #276](https://github.com/dtfgenetics/Tools/pull/276) reused.
- **Prior head evidence:** `cc0b9b5a583b6d575f2ea516855f92a77eceb0c9` passed CodeQL, Live verifier regression, and Canonical tool ownership guard (exact-head workflow query). These runs do **not** verify the new changes.
- **Verification limitation:** local Node test execution unavailable because the runtime cannot resolve `raw.githubusercontent.com`; exact new-head CI and full `npm test` pending. No merge or deployment. Server-side WooCommerce denial remains unverified.
- **Next:** check exact-head CI, fix failures, run full suite in CI, independent Release Gate approval, then controlled deployment and non-mutating server-side transaction denial checks.

### First-party HTTP purchasing destination coverage — 2026-11-20

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276). Test commit `02a4665a4a6fc72b6305543180bfd384b0368c54`; implementation commit `9d8485a2c574821060affb44eb82aadb720bd02d`.
- **Before:** the live HTML guard resolved absolute HTTP links to `http://dtfseeds.com` but excluded them because its first-party comparison required the HTTPS origin. An HTTP checkout link could therefore evade the static sales-hold release check even when the server redirected it to HTTPS.
- **After:** classify HTTP and HTTPS links to the canonical `dtfseeds.com` hostname as first-party; retain external-domain exclusion. Added regression examples for insecure checkout links and WooCommerce AJAX checkout form actions.
- **Changed:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, this register.
- **Evidence:** prior exact-head `c7339b4c6bfa91f7aa6f721c1df31c37ea98be04` had successful ownership (44860814804), live-verifier (44860814910), CodeQL (44860814758). Those runs **do not** verify this new revision. Exact-head CI and full `npm test` remain required. No independent approval, merge, deployment or server-side denial is claimed.

### 2026-11-20 — exact-head verification and server-side hold reconciliation

- **Tools PR #276:** exact head `89bd827abb177c0f46da0e4fe3001eaa940a9d17` passed [live-verifier regression](https://github.com/dtfgenetics/Tools/actions/runs/44865746178), [canonical ownership](https://github.com/dtfgenetics/Tools/actions/runs/44865746260), and [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44865746297); each GitHub Actions run reports `completed/success`. This supersedes earlier notes saying this head had no CI. Full `npm test` is **not evidenced** by these three workflow conclusions. Independent Release Gate approval, merge, deployed SHA and production browser validation are **not verified**.
- **Thc PR #2571:** GitHub PR metadata now confirms `closed/merged`, merge commit [`7920f869b3cef38901a50eaf5726fefc88f37531`](https://github.com/dtfgenetics/Thc/commit/7920f869b3cef38901a50eaf5726fefc88f37531). The older register row incorrectly calls this PR open. A GitHub merge does **not** establish that its WordPress MU-plugin or fallback snippet is installed/active on production. Anonymous Store API cart/checkout mutation denial, checkout payment denial and deployed revision remain unverified P0 requirements.
- **Handoff:** Release Gate should assess PR #276 on its exact head, request full-suite evidence, and separately require live server-side purchase-denial proof without creating a payable order. No commerce links or purchases have been enabled.

### Inert script/style commerce markup regression — 2026-11-21

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276). Implementation `5e01b8560cf12552a99f83be4bfd535e245ed665`; regression tests `ee80a3c44c8a2499c71583793136207647cb1f39`.
- **Before:** HTML verifier scanned literal `<a>`, `<form>`, and button examples inside `<script>` and `<style>` bodies, risking a false release failure on inert educational code samples.
- **After:** Remove script/style blocks before scanning active HTML controls; continue rejecting active cart/checkout links and buttons. Changed `scripts/live-verifier-response.mjs` and `scripts/live-verifier-response.test.mjs`.
- **Acceptance:** exact-head `npm run test:live-verifier`, full `npm test`, ownership and CodeQL, independent Release Gate review. These checks and production server-side WooCommerce denial are **not established** by the implementation commit alone. No merge/deploy claimed.

### 2026-11-21 — Inert template commerce-markup regression (Tools PR #276)

- **Before:** the live HTML commerce guard scanned markup inside HTML `<template>` elements even though their contents are inert until instantiated, causing false release failures for educational code examples.
- **After:** `scripts/live-verifier-response.mjs` excludes template blocks alongside script/style; `scripts/live-verifier-response.test.mjs` covers inert checkout/cart/add-to-cart examples and active controls outside templates. Source commit `a5994ca0877b69e7ddb704f7e32cea7b2603a71a`, tests commit `9f5b549cc21bfbe9533f2a6ecada15a4f222d512`.
- **Evidence:** prior head `6e7b0a0fc88037af983608f5dcea3a3fb99eeb22` passed live-verifier regression, canonical ownership and CodeQL. This does **not** validate the new revision. Exact-head CI and full `npm test` remain to be checked; independent Release Gate review required. Server-side production cart/checkout/Store API denial and deployed SHA are unverified. No merge or deployment claimed.

### Purchasing-link entity decoding — 2026-11-21

- Owner: Tools [PR #276](https://github.com/dtfgenetics/Tools/pull/276). Previous head `f4364a3145b0502c83b9451218b3ab05a1a093ca` passed [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44880124159), [live-verifier regression](https://github.com/dtfgenetics/Tools/actions/runs/44880124227), and [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44880124188).
- **Before:** HTML entity encoded `&quest;` and `&equals;` could hide WooCommerce query endpoints from static HTML navigation classification. **After:** `scripts/live-verifier-response.mjs` decodes these and `&num;` before URL parsing; `scripts/live-verifier-response.test.mjs` covers encoded add-to-cart, checkout, Store API and safe educational queries. Implementation/test commits: `808fc36c53afed1fae63926fe33067408f57c4d0`, `e7de803ceaf4d5b23eaeee05fb4a59177e3e1670`.
- Exact-head CI for the new implementation and full `npm test` **not yet verified** at documentation write time. No merge, deployment, or server-side denial established by this static verifier. Next: confirm exact-head regression/ownership/CodeQL and full suite; independent Release Gate review; verify anonymous production cart/checkout/Store API mutation denial without creating an order.

### Named HTML query delimiter coverage — 2026-11-21

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276); source commit `f6f777acb0bd7766d9dbf1645441af4e3299932a`, regression commit `3093c589f4be3ca4eae471b0a497f6fe6a1d1702`.
- **Before:** `hasShopNavigation` defined replacements for `&quest;`, `&equals;`, and `&num;` but omitted them from the matching regular expression, so named-entity query delimiters could evade detection even though positive regression fixtures already existed.
- **After:** the matcher includes those three names; added a named-query-plus-fragment regression. Changed `scripts/live-verifier-response.mjs` and `scripts/live-verifier-response.test.mjs`.
- **Acceptance outstanding:** exact-head `npm run test:live-verifier`, full `npm test`, ownership and CodeQL results, independent Release Gate review. This source change does not prove deployed transaction denial. No merge/deploy claimed.

### Implementation evidence — 2026-11-21 (Tools PR #276)

- **P0 public commerce navigation verifier:** `hasShopNavigation` now treats `www.dtfseeds.com` as first-party in addition to `dtfseeds.com`, preventing a checkout/cart/Store API link on the `www` hostname from escaping the static release guard. Existing exclusions for external and educational lookalike links remain.
- Changed: `scripts/live-verifier-response.mjs` (`5d615ec3e26d3e42dc3f6ad23d808b278aa1b7a1`) and `scripts/live-verifier-response.test.mjs` (`63a2b04d8c7cec124d2bb5ff1aa67992502e3e68`). Regression fixtures cover www checkout, www AJAX checkout, www Store API cart, and safe hostname/path lookalikes.
- Prior exact head `885f0eed0131593d0d90f19194ba4a884e671c91` passed [live verifier regression](https://github.com/dtfgenetics/Tools/actions/runs/44889178062), [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44889178120), and [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44889178037). **These passes do not validate the new head.** Local full `npm test` could not run because GitHub DNS resolution failed in the execution container. New exact-head CI and independent Release Gate approval are required.
- **Not deployed or live verified.** Static HTML checks cannot establish that server-side WooCommerce transactions are denied. Keep catalogue visible and all purchasing disabled. Next: exact-head CI, full suite, independent review, then non-transactional production server-side denial verification.

### Sales-hold verifier follow-up — 2026-11-21

- [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276) now detects additional first-party WooCommerce `wc-ajax` cart/checkout mutations: `remove_from_cart`, `update_cart`, `apply_coupon`, and `update_order_review`, in addition to existing add-to-cart and checkout actions. Source change `baa49b7d2e72dbe26cde2aebf6cce1b3ce303bcf`; regression cases `20e3c8fa541aca56d309df164b2e60d136760da2`.
- Previous head `d9bb986d6db51a6f0135031888d17d46ddd2dc27` passed [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44894329364), [live-verifier regression](https://github.com/dtfgenetics/Tools/actions/runs/44894329308), and [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44894329304). These are **not** test results for the new head.
- Local clone/test blocked by GitHub DNS failure (`Could not resolve host: github.com`). Require exact-new-head regression, CodeQL, ownership and full repository tests before independent Release Gate approval. This verifier is only a static release gate: live server-side WooCommerce cart and checkout denial and deployed revision remain **unverified**.

### 2026-11-21 — Native WooCommerce checkout submit controls (Tools PR #276)

- **Before:** a `button` or `input` named `woocommerce_checkout_place_order` could submit a WooCommerce checkout form to its current URL without an explicit checkout path, and the HTML sales-hold verifier missed it.
- **After:** `hasShopNavigation` rejects native named place-order controls (case-insensitive) as well as existing add-to-cart controls. Tests cover button/input, case variants, `data-name` and educational lookalikes.
- **Changed:** `scripts/live-verifier-response.mjs` (`f7049665a606dc9f21d94dc01ce05dc5fac4567d`), `scripts/live-verifier-response.test.mjs` (`adfa9fb0344b05f83a0e22e346eef21dd64c1f0f`), this register. Owner: [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276).
- **Evidence:** prior head `df11156a78c1126cbd6210eb4521a9b6daf92520` passed live-verifier regression [44898891389](https://github.com/dtfgenetics/Tools/actions/runs/44898891389), ownership [44898891388](https://github.com/dtfgenetics/Tools/actions/runs/44898891388), CodeQL [44898891323](https://github.com/dtfgenetics/Tools/actions/runs/44898891323). These runs **do not** validate this new head. Exact-head CI, full `npm test`, independent Release Gate approval, production deployment SHA and server-side transaction denial remain outstanding. No merge/deploy claimed.

### 2026-11-21 — Standalone AJAX add-to-cart class (Tools PR #276)

- **Before:** the HTML sales-hold verifier caught `add_to_cart_button` and `single_add_to_cart_button`, but missed actionable WooCommerce controls bearing only `ajax_add_to_cart` without an explicit `href` or `formaction`.
- **After:** detect the standalone `ajax_add_to_cart` class on anchors, buttons and inputs. Regression fixtures cover all three elements and ensure `ajax_add_to_cart_help` and `data-class` lookalikes remain permitted. The existing seed catalogue remains visible; this change does not enable purchasing.
- **Owner/paths:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276), `scripts/live-verifier-response.mjs` at `bf5eefa73815ecc54c2464dae63b9acbe38a1cf6`, `scripts/live-verifier-response.test.mjs` at `38475424170f674580f58a540fbfd2dd99440217`.
- **Prior-head evidence:** `06ea8ea33ed22162f6a986cb7c3e2b58926b2ee5` completed Live verifier regression, Canonical tool ownership guard, and CodeQL Security successfully (GitHub Actions query, 2026-11-21). Those results do not verify this new revision.
- **Outstanding:** exact-head focused regression/ownership/CodeQL, full `npm test`, independent Release Gate approval, deployment SHA and anonymous server-side WooCommerce transaction denial. Static markup classification is not proof of server enforcement. Do not merge/deploy without review.

### 2026-11-21 — P0 live-verifier CI repair (Tools PR #276)

- **Before:** exact-head `9478b3bf762edbd58a913c866634d9d45e651e12` failed Live verifier regression (9/12 passing) and canonical ownership (same dependent regression), while CodeQL passed. Workflow runs: [regression](https://github.com/dtfgenetics/Tools/actions/runs/44908646539), [ownership](https://github.com/dtfgenetics/Tools/actions/runs/44908646611), [CodeQL](https://github.com/dtfgenetics/Tools/actions/runs/44908646617). Job logs identified `ReferenceError: classes is not defined` at `scripts/live-verifier-response.mjs:113`.
- **Root cause / after:** literal `\\n` sequences inside a `//` comment swallowed the `const classes` declaration. Replaced them with real line breaks so the declaration executes before class detection. Implementation commit [`2c07e617`](https://github.com/dtfgenetics/Tools/commit/2c07e6178c7d663104ab9454fb187de15bde3ef4). Existing regression tests cover actionable WooCommerce classes and safe lookalikes.
- **Acceptance pending:** exact-head focused regression and full `npm test`, canonical ownership, CodeQL, independent Release Gate approval; no merge or deployment claim. Verify anonymous server-side cart/checkout/Store API denial separately, without creating an order.

### 2026-11-21 — Exact-head CI recovery verified (Tools PR #276)

- **Before:** prior head `9478b3b` failed the live-verifier regression and dependent ownership workflow due to `ReferenceError: classes is not defined`; the subsequent fix had no confirmed CI evidence.
- **After (verified):** PR #276 head `262e7cbb973a4d2d95c12c9b3fc7cc9ab39b50b6` completed [Live verifier regression](https://github.com/dtfgenetics/Tools/actions/runs/44913528075), [Canonical tool ownership guard](https://github.com/dtfgenetics/Tools/actions/runs/44913528023), and [CodeQL Security](https://github.com/dtfgenetics/Tools/actions/runs/44913528000), all `success` according to the GitHub commit-workflow query. This confirms the previous CI-breaking defect was repaired on that exact head, not full product readiness.
- **Outstanding:** full repository `npm test` was not executed in this run; these CI results do not cover this register-only follow-up commit. Independent Release Gate approval, merge, live deployed SHA, and non-transactional verification of anonymous server-side WooCommerce cart/checkout/Store API denial remain required. Do not claim production enforcement from HTML scanning.

### 2026-11-21 — Actionless native WooCommerce form guard (Tools PR #276)

- **Before:** Native WooCommerce checkout and cart forms could submit to their current page without an explicit `action` URL or named purchasing button; the static sales-hold verifier would miss them.
- **After:** `hasShopNavigation` rejects exact `woocommerce-checkout` and `woocommerce-cart-form` class tokens on `<form>` elements, including case variants. Regression cases include actionless forms and safe educational lookalikes.
- **Changed:** `scripts/live-verifier-response.mjs` commit `f19dd0cc3886722828af8a5cdcf348b8977d5198`; `scripts/live-verifier-response.test.mjs` commit `91541e3e5f8e6631fe4194edaf2814a3b8b77071`. Existing owner [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276).
- **Verification:** prior head `dc52d567222bbff642062572c256d9f28d2ecae9` passed live-verifier, ownership and CodeQL. These runs **do not** validate the new commits. Exact-new-head CI, full `npm test`, independent release approval, deployment SHA and non-transactional server-side WooCommerce denial remain outstanding. No merge/deployment claimed.

### HTML image-map purchasing navigation — 2026-11-21

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276). Implementation `4e8bf62fd5a2cba23aaea209a3c21607946c43d9`; tests `72717120e594a4c29a8c40c232072ccef97c5b9e`.
- **Before:** the HTML sales-hold verifier inspected anchor, form and button/input destinations, but ignored active `<area href>` navigation inside image maps, allowing first-party cart/checkout/shop links to evade the static release gate.
- **After (source):** classify `<area>` href attributes with the same first-party commerce URL checks as anchors; regression cases cover quoted, unquoted, uppercase, safe educational, data-href lookalike, and external area links.
- **Changed paths:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, this register.
- **Acceptance pending:** exact latest-head live-verifier regression, canonical ownership, CodeQL, full `npm test`, independent Release Gate review; production server-side WooCommerce cart/checkout/Store API denial and deployed SHA remain unverified. No merge or deployment claimed.

### 2026-11-21 — Embedded commerce iframe detection (Tools PR #276)

- **Before:** the static sales-hold guard checked links, forms, and buttons but not active iframe `src` destinations. An embedded first-party checkout/cart or WooCommerce AJAX checkout endpoint escaped the markup gate.
- **After (source):** classify iframe `src` with the existing first-party commerce URL logic; leave educational and external iframe destinations and `data-src` inert. Preserve visible seed catalogue with no public purchasing controls.
- **Owner/paths:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276); `scripts/live-verifier-response.mjs` (`dd50a76ccc2bc4a3642eea673caa41a2690f9674`), `scripts/live-verifier-response.test.mjs` (`d2fd6ff593e9e66a573611bf74bdfae590930bd7`), this completion register.
- **Verification:** prior head `d52778a2ce0e5f0364c49f1839ea54dce95c33ce` reported success for live verifier, canonical ownership, and CodeQL. These results **do not verify** this new head. Exact-head CI and full `npm test` remain pending. Independent Release Gate review and production server-side WooCommerce cart/checkout/Store API denial without creating an order are mandatory. No merge/deployment claimed.

### 2026-11-21 — Embedded commerce destinations (Tools PR #276)

- **Before:** live sales-hold HTML guard inspected iframe `src` but missed `<object data="/checkout/">` and `<embed src="/cart/">`, both capable of loading first-party purchasing pages.
- **After (source):** inspect `object[data]` and `embed[src]` with the existing first-party URL, entity, and Store API classification. Tests include checkout/cart embeds, safe educational embeds, external examples and `data-*` lookalikes.
- **Changed:** `scripts/live-verifier-response.mjs` (`3499d80059e0a1d43f7ebd7707576083645e9a0e`), `scripts/live-verifier-response.test.mjs` (`6b2236076bb7f9c6a55f594bc9dd3b7b031ec03b`), this register.
- **Prior-head evidence:** `fe552df141fcc19b7e29029a1c20a616d842d121` passed live-verifier regression [44934746228](https://github.com/dtfgenetics/Tools/actions/runs/44934746228), ownership [44934746488](https://github.com/dtfgenetics/Tools/actions/runs/44934746488), and CodeQL [44934746231](https://github.com/dtfgenetics/Tools/actions/runs/44934746231). These results do **not** validate the new commits.
- **Acceptance pending:** exact-head focused and full `npm test`, ownership, CodeQL, independent Release Gate. No merge/deploy or production server-side WooCommerce cart/checkout/Store API denial verified. Preserve visible genetics catalogue with purchasing disabled.


### Commerce meta-refresh redirect coverage — 2026-11-21

- **Owner:** [Tools PR #276](https://github.com/dtfgenetics/Tools/pull/276). Source commit `b22df826627fd2e855da077606c15b2dfd628d14`; regression commit `f2c88489b3a5787b006f259d63636427de61f014`.
- **Before:** static HTML commerce guard inspected anchors, forms and embeds, but not active `<meta http-equiv="refresh" content="0;url=/checkout/">` redirects.
- **After (source):** inspect only active refresh meta tags, parse their URL and pass it through existing first-party commerce route and WooCommerce endpoint detection. Regression cases cover cart/checkout, AJAX checkout and benign educational/external refreshes.
- **Changed:** `scripts/live-verifier-response.mjs`, `scripts/live-verifier-response.test.mjs`, this register.
- **Checks:** previous exact head `f883fcdb695bfd2c89aaf5187bf6bc3e0d0908c0` had three successful workflows (live verifier regression, canonical ownership, CodeQL). New commits require exact-head CI and full `npm test`. Local checkout/test attempt blocked: `git ls-remote` failed with `Could not resolve host: github.com`. No local test pass claimed.
- **Release:** PR remains open. No merge/deployment or production server-side WooCommerce transaction denial established. Independent Release Gate must review after exact-head checks.

### Exact-head CI verification — 2026-11-21 (Tools PR #276)

- **Verified source head:** `00f3bdd78fb338769019d9863768315c8d7eaf43` (commerce meta-refresh guard and regression cases).
- **Exact-head GitHub Actions:** [live verifier regression #44946141903](https://github.com/dtfgenetics/Tools/actions/runs/44946141903) **success**; [canonical ownership #44946141926](https://github.com/dtfgenetics/Tools/actions/runs/44946141926) **success**; [CodeQL #44946141913](https://github.com/dtfgenetics/Tools/actions/runs/44946141913) **success**. These are checks for the implementation head, not a full-suite or deployed-site pass.
- **Unverified acceptance:** full `npm test` and production cart/checkout/Store API server-side denial. Local repository clone remains blocked by `Could not resolve host: github.com` (2026-11-21); no local test result claimed. Independent Release Gate approval, merge and deployed revision parity remain pending.
- **Next:** run full suite in an accessible runner, verify server-side transaction rejection without creating an order, and obtain independent approval before any merge/deployment. Do not add more static detector rules solely to expand this already-reviewed PR.

### Full deterministic Tools suite gate — 2026-11-21 (PR #276)

- **Before:** focused live-verifier, ownership and CodeQL workflows passed on prior head `bd778136d24cb71792d03dab8db748c4b07c87b1`, but the full `npm test` acceptance gate was not exercised by an Actions workflow on this PR; local checkout had failed DNS resolution.
- **After (source):** added `.github/workflows/full-tools-suite-pr.yml` on the existing PR owner branch, implementation commit `41c079d8efaaecabe010393a0dc714fcb8dd6de6`. Runs `npm test` with Node 20 on pull requests touching source/scripts/package or the workflow, with read-only contents permission and a 30-minute timeout. This is test infrastructure, not a claim of passing tests.
- **Acceptance pending:** inspect exact latest-head full-suite job logs and repair failures, plus focused regression/ownership/CodeQL. Independent Release Gate review and production server-side cart/checkout/Store API denial are still required; no merge/deploy verified.


### Full-suite PR head checkout and register trigger — 2026-11-21

- **Owner:** Tools PR #276 (`fix/live-verifier-commerce-links-20261120`). Before: workflow used default `actions/checkout` pull-request merge ref while its step claimed exact PR head; documentation-only completion-register updates did not trigger full-suite workflow.
- **After:** `.github/workflows/full-tools-suite-pr.yml` explicitly checks out `${{ github.event.pull_request.head.sha || github.sha }}` and includes `docs/RELEASE_COMPLETION_REGISTER.md` in pull-request paths. Source commit `838252ca7e222d396f57e197a1b4e357b352db60`.
- **Prior evidence:** preceding head `c31486ea540d17cb0de8bcdaef550339c74ec070` had successful Full Tools deterministic suite (run 44956529529), ownership (44956529552), CodeQL (44956529640) and live-verifier regression (44956529635). Those checks precede this change and checkout was not explicitly pinned to PR head.
- **Acceptance:** verify workflow at latest PR head reports success, confirm checkout SHA in job logs, then independent Release Gate review. Server-side WooCommerce purchase denial and live deployment parity remain unverified. No merge or deployment claimed.


### 2026-11-22 — PPFD dimmer calibration duplicate measurement guard

- **Owner:** narrowly scoped Tools branch `fix/ppfd-calibration-duplicate-dimmer-20261122` (main at `82895ee9ad6b3617d50e37e3c38ea486008335aa`; existing open PR #280 owns separate VPD CSV release, not modified).
- **Before:** the Light Lab `parseCalibrationPoints` used a Map and silently overwrote earlier measured PPFD when multiple lines specified the same dimmer percentage, producing an apparently valid interpolation from ambiguous data.
- **After (source):** reject repeated dimmer percentages, show a specific correction message, clear interpolated PPFD and DLI until the user supplies unique measurements. Distinct measured points continue to interpolate normally.
- **Changed:** `site/public-route-patch/ppfd-chart/index.html` commit `9abf9bd68daea3ddd0247925e4ba26f3d672deba`; `scripts/test-ppfd-browser.mjs` regression commit `54eab639260f54814edc13be344cac0966b270ef`; this register.
- **Acceptance pending:** exact-head PPFD Chromium browser, deterministic Tools suite, ownership, CodeQL and independent Release Gate review. No production deployment or merge claimed.

- **2026-11-22 follow-up:** PR #281 head `c81b9f895052a92d3a6d0e74307c1efaf08a3ca5` passed six exact-head GitHub Actions: Guided Tool Chapters CI #45002846015, ownership #45002845973, PPFD numeric input #45002845978, full Tools suite #45002845997, PPFD Light Lab math #45002845968, CodeQL #45002846019. Improved accessible validation by linking calibration textarea to live status and setting `aria-invalid` based on actual parsing (`7f47a017f1f365d398fe09a6ad7f3fc4aa39d755`); browser regression now checks numeric-equivalent 50/50.0 duplicate and accessible recovery (`a662e558598571009eb90829d9e416df3da39520`). **New exact-head CI pending**. Independent Release Gate review, merge and live deployment unverified.


### 2026-11-22 — PPFD Light Lab add-reading integrity (PR #281)

- **Latest prior exact-head evidence:** `36abdaee41c0f47b826b80b6a48e34846ed50da9` passed all six GitHub Actions workflows: Guided Tool Chapters CI #45007268908, PPFD Light Lab math acceptance #45007268801, CodeQL #45007268923, PPFD numeric input regression #45007268837, canonical ownership guard #45007268894, full Tools deterministic suite #45007268850. These passes do not apply to the new head.
- **Before:** the “Add current dimmer + PPFD” button rebuilt a Map and silently overwrote a previous PPFD reading at the same dimmer percentage, bypassing the duplicate-entry guard on manually entered calibration data.
- **After:** adding a reading refuses to overwrite an existing dimmer setting and explains how to correct it. Malformed existing calibration data is preserved instead of discarded. New unique settings remain addable.
- **Paths:** `site/public-route-patch/ppfd-chart/index.html` (`e1bdcaff6d76f70519c5a56248de8f6b79918a0d`); `scripts/test-ppfd-browser.mjs` (`d05fac4839df13a1e21a3589338dacdb874dd8a6`).
- **Pending:** run exact-head PPFD browser, full suite, ownership, CodeQL, accessibility checks; independent Release Gate approval, merge and live deployment. No new-head pass claimed.

### 2026-11-22 — PPFD calibration target accessibility (PR #281)

- **Baseline exact-head evidence:** prior head `7afdf17e9ec1d2d8f088c27cace021c427fd2a72` passed Guided Tool Chapters, canonical ownership, Full Tools deterministic suite, PPFD numeric input regression, PPFD Light Lab math acceptance, and CodeQL Security (all completed successfully).
- **Before:** invalid/blank target dimmer correctly suppressed estimates but did not expose invalid state on the target input to assistive technology.
- **After:** `renderCalibration()` sets `aria-invalid` on `#calibrationTargetDimmer` according to validated target; browser regression asserts a blank target exposes `aria-invalid=true`. Commits `0357f8ddee0ed590d55b3f371ded29c8205919e9`, `7db45dad28e4d6c5322c5cd0096df869b2442f17`.
- **Acceptance pending:** exact latest-head six workflows and independent Release Gate approval; no merge or production deploy claimed.
