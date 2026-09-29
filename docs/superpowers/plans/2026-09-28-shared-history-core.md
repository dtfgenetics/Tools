# Shared History + Portable Data Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Consolidate history filtering, latest-by-entity selection, spread calculation, CSV serialization, and restore sanitation across cultivation tools.

**Architecture:** Add one pure shared ES module and migrate four routes incrementally. Existing time-series math, charts, storage keys, GrowLens bridges, and backup schemas remain unchanged.

**Tech Stack:** Browser ES modules, Node 20 deterministic tests.

**Spec:** `docs/superpowers/specs/2026-09-28-shared-history-core-design.md`

## Global Constraints
- Preserve all localStorage keys and public routes.
- No new production dependency.
- Null/blank stays unknown.
- CSV escaping must handle commas, quotes and newlines.
- Full `npm test` before merge.

## Review Focus
- null filter values do not accidentally match string "null".
- invalid timestamps are excluded from latest-by-group.
- missing numeric values do not become zero in spread/summary.
- CSV cells containing quotes/newlines round-trip safely.
- restore sanitization applies the limit after validation/normalization.

### Task 1: Shared history core
Create `site/public-route-patch/assets/thc-history-core-v1.mjs` and `scripts/test-history-core.mjs`. Write RED tests for all shared contracts, then implement and add to `npm test`.

### Task 2: Environment + Root-Zone migration
Create integration validation first. Replace local field filtering/value enumeration and CSV row construction with the shared core while preserving `thc-environment-history-v1` and `thc-root-zone-history-v1`.

### Task 3: Dryback migration
Extend integration validation first. Replace zone filtering, latest-by-sensor, spread, and CSV serialization with shared functions while preserving `thc-dryback-events-v1`.

### Task 4: Plant Growth migration
Extend integration validation first. Replace plant/stage filtering, filter enumeration, average helper with shared history/time-series functions, and CSV serialization while preserving `thc-plant-growth-history-v1`.

### Task 5: Verification
Run the canonical CI suite, inspect the PR diff for schema/data coercion regressions, fix Important/Critical findings test-first, and merge only if green.
