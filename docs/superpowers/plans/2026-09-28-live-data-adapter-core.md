# Shared Live Data Adapter Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reusable live telemetry core and connect Environment Control to it without changing existing saved-history contracts.

**Architecture:** Build a pure tested packet/state/series module first. Add a lightweight Environment “live JSON adapter” that accepts pasted/provider-fed JSON packets and can later be driven by REST/WebSocket/MQTT connectors. Keep transport concerns separate from cultivation math.

**Tech Stack:** Browser ES modules, Node 20 deterministic tests, existing uPlot where appropriate.

**Spec:** `docs/superpowers/specs/2026-09-28-live-data-adapter-core-design.md`

## Global Constraints
- No credentials persisted.
- No control/write endpoints.
- Preserve all existing storage keys.
- Null remains null.
- No new production dependency.
- Full `npm test` before merge.

## Review Focus
- duplicate packets do not create duplicate history.
- out-of-order packets still build chronologically sorted series.
- stale timestamps report stale/offline without changing measurements.
- metric mapping ignores non-numeric/null values instead of creating zero.
- reconnect backoff is bounded and deterministic.

### Task 1: Core telemetry contract
Create `site/public-route-patch/assets/thc-live-data-core-v1.mjs` and `scripts/test-live-data-core.mjs` using RED→GREEN.

### Task 2: Environment integration
Create a failing integration validator, then add an optional Live Data panel to Environment Control that parses one JSON packet, normalizes it, previews connection/freshness state, and copies valid metrics into the existing form without auto-saving history.

### Task 3: Cross-tool adapter bridge
Add a small shared helper for converting normalized telemetry packets into tool-specific field maps so VPD, Root Zone, Dryback, pH/EC and PPFD can adopt it without duplicating packet parsing.

### Task 4: Verification
Run canonical CI, inspect for null coercion/unsafe HTML/storage regressions, fix findings test-first, and merge only when green.
