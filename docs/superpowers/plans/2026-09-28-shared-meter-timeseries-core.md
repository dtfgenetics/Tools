# Shared Meter + Time-Series Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate repeated measurement, calibration, freshness, and history logic so several cultivation tools share one tested foundation.

**Architecture:** Add two focused ES modules beneath the existing tool shell and extend the current measurement-journal adapter. Migrate pages without changing public routes or storage schemas.

**Tech Stack:** Browser JavaScript ES modules, existing localStorage helpers, PapaParse/uPlot where already used, Node 20 deterministic tests.

**Spec:** `docs/superpowers/specs/2026-09-28-shared-measurement-platform-design.md`

## Global Constraints
- Preserve existing public routes and storage schemas.
- No new production dependency.
- Keep hardware connectivity claims explicit and truthful.
- Preserve GrowLens bridges.
- Every new shared behavior gets a deterministic Node test.
- Full `npm test` must pass before merge.

## Review Focus
- Invalid/future calibration dates do not become misleading “fresh” states.
- Missing/invalid timestamps become unknown/stale rather than silently current.
- Empty or malformed time-series data returns safe empty summaries.
- CSV headers with punctuation/case normalize consistently.
- Tool migrations do not alter existing localStorage keys.

---

### Task 1: Shared meter core

**Files:**
- Create: `site/public-route-patch/assets/thc-meter-core-v1.mjs`
- Create: `scripts/test-meter-core.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `calibrationState(date,{now})`, `normalizeMeterRecord(input)`, `validatePh(value)`, `validateEc(value)`, `measurementSource(input,{now,staleAfterMs})`.

- [ ] Write failing tests covering valid/invalid/future calibration dates, pH bounds, EC bounds, normalized source metadata and stale timestamps.
- [ ] Run the meter-core test and verify RED because the module is absent.
- [ ] Implement the minimal module.
- [ ] Run the meter-core test and verify GREEN.
- [ ] Add the test to the canonical `npm test` command.

### Task 2: Shared time-series core

**Files:**
- Create: `site/public-route-patch/assets/thc-timeseries-core-v1.mjs`
- Create: `scripts/test-timeseries-core.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `evaluateBandSeries` and `readingFreshness` from `thc-measurement-core-v1.mjs`.
- Produces: `numericSummary(rows,key)`, `filterTimeWindow(rows,{from,to,dateKey})`, `latestObservation(rows,{dateKey,now,staleAfterMs})`, `groupSummary(rows,groupKey,valueKey)`, `bandSummary(rows,valueKey,options)`.

- [ ] Write failing tests for empty data, invalid values, time windows, grouping, latest/stale state and sustained excursions.
- [ ] Run and verify RED because the module is absent.
- [ ] Implement the minimal module.
- [ ] Run and verify GREEN.
- [ ] Add the test to `npm test`.

### Task 3: Journal adapter consolidation + pH/EC migration

**Files:**
- Modify: `site/public-route-patch/assets/thc-measurement-journal-v1.js`
- Modify: `site/public-route-patch/ph-meter/index.html`
- Modify: `site/public-route-patch/tds-meter/index.html`
- Create: `scripts/validate-meter-core-integration.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes Task 1 functions.
- Journal adapter exposes current rows without changing existing storage keys.

- [ ] Write integration validation that requires pH and TDS routes to import/use the shared meter core and preserve keys.
- [ ] Verify RED.
- [ ] Refactor calibration/source normalization to the shared core.
- [ ] Verify integration test GREEN.

### Task 4: Root-zone + environment time-series migration

**Files:**
- Modify: `site/public-route-patch/root-zone-temperature/index.html`
- Modify: `site/public-route-patch/environment-control/index.html`
- Create: `scripts/validate-timeseries-core-integration.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes Task 2 summary/latest functions.

- [ ] Write integration validation requiring both routes to use shared time-series helpers while preserving existing localStorage keys.
- [ ] Verify RED.
- [ ] Replace duplicated summary/latest logic with shared calls.
- [ ] Verify GREEN.

### Task 5: Whole-suite verification and review

- [ ] Run `npm test` in GitHub Actions on the branch.
- [ ] Review branch diff for compatibility, unsafe imports, schema changes, and duplicate helpers.
- [ ] Fix Important/Critical findings test-first.
- [ ] Re-run `npm test`.
- [ ] Merge only after the canonical gate is green.
