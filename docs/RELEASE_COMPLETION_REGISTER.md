# THC Tools release completion register

Updated: 2026-11-13. This register records **verified evidence**, not a claim of production readiness. Canonical implementation: `dtfgenetics/Tools`; integration/deployment mirror: `dtfgenetics/Thc`.

| Priority | Owner | Work item | Status / evidence | Acceptance criteria | Next action |
| --- | --- | --- | --- | --- | --- |
| P0 | Tools | Live asset MIME checks | PR [#243](https://github.com/dtfgenetics/Tools/pull/243) **merged 2026-11-13** at merge commit `54d26063ca5cfb75145ee84da961f21fea8789ab`; cache-busted asset MIME fix and focused regression tests are present on `main`; focused and full test execution results not independently verified in this run | Exact-head tests pass; cache-busted JS/CSS/SVG pass, HTML fallback fails; reviewed PR merged | Run `npm run test:live-verifier` and `npm test` on current `main`; verify live asset responses and deployment SHA |
| P0 | Tools + Thc | Canonical Atlas mirror parity | [#155](https://github.com/dtfgenetics/Tools/issues/155) reports 27 drifted pages and risk of overwriting richer educational content | Review and preserve substantive lessons; repair canonical and og:url metadata; exact byte parity after controlled upstream sync | Compare each drifted page, upstream validated improvements, then verify mirror before merge |
| P0 | Tools | End-to-end tools release | [#210](https://github.com/dtfgenetics/Tools/issues/210) open | Every manifest route and asset validated; known-answer science tests, keyboard/mobile browser tests, production smoke on deployed SHA | Collect exact-head unit, experience, browser and live evidence |
| P0 | Tools + Thc | Event-driven sync | [#90](https://github.com/dtfgenetics/Tools/issues/90) open; scheduled fallback exists | Least-privilege dispatch works without exposing token; pinned SHA and fallback preserved | Configure controlled dispatch credential and test end-to-end |
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
