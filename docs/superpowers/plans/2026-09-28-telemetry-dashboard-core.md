# Shared Telemetry Dashboard Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add reusable multi-device telemetry summaries and expose them in Environment Control without persisting live packet data.

**Architecture:** Build a pure dashboard core first, then a small renderer that accepts normalized packets and renders device/zone health. Environment Control gets a batch JSON snapshot panel that uses the same live telemetry normalizer.

**Tech Stack:** Browser ES modules, Node deterministic tests.

**Spec:** `docs/superpowers/specs/2026-09-28-telemetry-dashboard-core-design.md`

## Global Constraints
- No live packet persistence.
- No credentials.
- No control endpoints.
- Preserve all existing route/storage contracts.
- Null stays unknown.
- No new dependency.
- Full `npm test` before merge.

## Review Focus
- duplicate/out-of-order packets choose the newest valid packet per device.
- missing timestamps never outrank valid packets.
- stale/offline counts are deterministic.
- metric coverage ignores null/blank values.
- mixed zones and unspecified zones remain separately visible.

### Task 1: Dashboard core
Create `site/public-route-patch/assets/thc-telemetry-dashboard-core-v1.mjs` and `scripts/test-telemetry-dashboard-core.mjs` with RED→GREEN.

### Task 2: Shared renderer
Create `site/public-route-patch/assets/thc-telemetry-dashboard-v1.mjs` and unit-test its pure model helpers.

### Task 3: Environment integration
Add a batch telemetry snapshot panel that accepts a JSON array/object collection, normalizes packets, renders latest device health, zone counts, and metric coverage, and never auto-saves history.

### Task 4: Verification
Run canonical CI and inspect for persistence, stale-state, null-coercion, and route regressions. Merge only if green.
