# Secure Provider Telemetry Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a deployable read-only provider gateway and Pulse connector that feed normalized telemetry into the existing THC live-data ecosystem.

**Architecture:** Implement pure provider functions first, then one Web Request/Response handler. Keep transport/auth on the server; browser tools consume same-origin JSON only.

**Tech Stack:** ES modules, Web Fetch API, Node 20 tests.

**Spec:** `docs/superpowers/specs/2026-09-28-secure-provider-gateway-design.md`

## Global Constraints
- GET only.
- Never expose secrets.
- No provider control endpoints.
- No new runtime dependency.
- Existing browser tools remain functional without the gateway.
- Full canonical `npm test` before merge.

## Review Focus
- missing secret returns configured/unavailable state without leaking env.
- invalid device IDs never reach upstream fetch.
- upstream 401/429/500 errors return safe bounded messages.
- provider response wrappers normalize into our packet contract.
- CORS/same-origin response headers do not accidentally allow credential exfiltration.

### Task 1: Pulse provider
Create `server/providers/pulse-v1.mjs` and provider tests with RED→GREEN.

### Task 2: Gateway router
Create `server/telemetry-gateway-v1.mjs` and router tests with RED→GREEN.

### Task 3: Browser connector
Add a small shared same-origin provider client that discovers devices and retrieves normalized recent packets without accepting API keys.

### Task 4: Verification
Run canonical CI, inspect for secret strings/unsafe methods/error leakage, and merge only when green.
