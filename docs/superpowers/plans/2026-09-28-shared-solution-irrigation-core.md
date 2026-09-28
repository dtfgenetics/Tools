# Shared Solution + Irrigation Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Consolidate solution chemistry and irrigation execution primitives used by Water Quality, Fertigation, and Dryback.

**Architecture:** Add one shared ES module that composes existing measurement/math primitives. Migrate three routes without altering storage keys, public URLs, or version-1 handoff compatibility.

**Tech Stack:** Browser ES modules, Node 20 tests, existing THC tool shell.

**Spec:** `docs/superpowers/specs/2026-09-28-shared-solution-irrigation-core-design.md`

## Global Constraints
- Preserve existing storage keys and handoff compatibility.
- No new production dependency.
- Do not infer EC from elemental ppm.
- Preserve GrowLens bridges.
- Test first; full `npm test` before merge.

## Review Focus
- null/blank EC values remain unknown, not zero.
- runoff can exceed applied volume without crashing; report the arithmetic rather than silently clamp.
- zero/invalid substrate volume does not create a fake shot percentage.
- version-1 handoffs remain readable.
- imported water reports preserve optional missing analytes as null.

### Task 1: Shared solution/irrigation core
Create `site/public-route-patch/assets/thc-solution-irrigation-core-v1.mjs` and `scripts/test-solution-irrigation-core.mjs`.
Write RED tests for normalization, EC deltas, irrigation metrics, missing values, and v1 handoff compatibility; then implement minimal code and gate it in `npm test`.

### Task 2: Water Quality migration
Create a route integration validator first. Replace local imported-report normalization and average helpers with shared water normalization plus `numericSummary`; preserve `thc-water-quality-history-v1`.

### Task 3: Fertigation migration
Create a route integration validator first. Replace local EC comparison/handoff construction with the shared core; preserve `thc-fertigation-dryback-handoff-v1` and version 1 payloads.

### Task 4: Dryback migration
Extend the route validator first. Replace shot/drainage/EC-delta arithmetic with shared `irrigationMetrics` and `ecComparison`; preserve `thc-dryback-events-v1`.

### Task 5: Verification
Run full canonical CI, inspect the full PR diff for schema regressions, fix Important/Critical issues test-first, and merge only on a green gate.
