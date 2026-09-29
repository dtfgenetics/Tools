# Shared Live Tool Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add one reusable live telemetry UI adapter and migrate VPD, Root Zone, Dryback, pH, EC/TDS and PPFD to it.

**Architecture:** Build and test a small module on top of `thc-live-data-core-v1.mjs`; each route adds a mount point and a minimal module call. Existing save/history behavior remains explicit and unchanged.

**Tech Stack:** Browser ES modules, Node deterministic tests.

**Spec:** `docs/superpowers/specs/2026-09-28-shared-live-tool-adapter-design.md`

## Global Constraints
- Read-only telemetry application only.
- Never persist credentials or packets.
- Never auto-save tool history.
- Preserve existing storage keys/routes.
- Null stays unknown.
- No new dependency.
- Full `npm test` before merge.

## Review Focus
- invalid JSON returns a clear error instead of mutating fields.
- missing metrics leave current form values untouched.
- only finite mapped numbers are applied.
- route-specific render/input events still update calculations.
- one provider packet can map consistently across multiple tools.

### Task 1: Shared adapter module
Create `site/public-route-patch/assets/thc-live-tool-adapter-v1.mjs` and `scripts/test-live-tool-adapter.mjs` with RED→GREEN.

### Task 2: VPD + Root Zone + Dryback
Create integration assertions first, then add shared adapter mount points/calls.

### Task 3: pH + EC/TDS + PPFD
Extend integration assertions first, then add shared adapter mount points/calls.

### Task 4: Verification
Run canonical CI, inspect route diffs for duplicate parser logic, persistence regressions, and false-zero behavior; merge only when green.
