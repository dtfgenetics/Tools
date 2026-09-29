# Telemetry Rules + Device Health Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Add a reusable alert/rule engine plus device calibration/health metadata and expose Pulse sensor details through the existing secure gateway.

**Architecture:** Build the pure rules/health core first. Then extend the Pulse provider, gateway and same-origin client with sensor details. Keep all alert evaluation client-side over normalized packets and all provider authentication server-side.

**Tech Stack:** Browser/Node ES modules, Web Fetch API, deterministic Node tests.

**Spec:** `docs/superpowers/specs/2026-09-28-telemetry-rules-health-design.md`

## Global Constraints
- Advisory/read-only only.
- No provider write/control endpoints.
- No browser secrets.
- Null stays unknown.
- No new dependency.
- Preserve existing routes/storage contracts.
- Full `npm test` before merge.

## Review Focus
- alternating values do not satisfy a sustained alert.
- stale/invalid timestamp samples do not count toward sustain.
- active rules do not clear until the clear margin is crossed.
- calibration with no date reports unknown, not expired.
- provider details never leak raw API/provider secrets.

### Task 1: Rules + health core
Create `site/public-route-patch/assets/thc-telemetry-rules-core-v1.mjs` and RED→GREEN unit tests.

### Task 2: Pulse device details
Extend `server/providers/pulse-v1.mjs` with `getDetails(deviceId)`, normalize threshold + calibration metadata, and add tests.

### Task 3: Gateway/client details route
Add `GET /api/telemetry/:provider/devices/:id/details` plus same-origin client method with tests.

### Task 4: Environment alert board
Add a shared alert-board renderer using the new rule engine and current dashboard packets. Keep rule definitions local/explicit and do not auto-save or control hardware.

### Task 5: Verification
Run canonical CI, inspect for false-zero, secret leakage, state-clearing and storage regressions, then merge only when green.
