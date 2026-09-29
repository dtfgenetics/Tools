# Telemetry Rules + Device Health Core Design

Date: 2026-09-28

## Goal
Give THC one reusable alert/rule engine and device-health model so Environment, Root Zone, Dryback, PPFD, pH/EC and connected providers share the same threshold, sustain, hysteresis and calibration-health behavior.

## Architecture
Add `thc-telemetry-rules-core-v1.mjs` as a pure ES module over normalized telemetry packets. Rules are declarative and metric-based. Evaluation is history-aware so a threshold can require N consecutive out-of-band samples and use a clear margin before returning to normal. Add normalized device-health helpers for calibration age, stale telemetry and provider threshold metadata.

Extend the Pulse provider with read-only sensor-details retrieval and normalize its documented thresholds and pH/EC calibration timestamps into the shared device-health contract.

## Core contracts
- `normalizeTelemetryRule(input)`
- `evaluateTelemetryRule(records,rule,{previousState})`
- `evaluateTelemetryRules(records,rules,{previousStates})`
- `calibrationHealth({lastCalibrationAt,maxAgeDays,now})`
- `normalizeDeviceHealth(input)`

## Pulse health contract
- `provider.getDetails(deviceId)`
- gateway: `GET /api/telemetry/pulse/devices/:id/details`
- browser client: `getDetails(providerId,deviceId)`

## Constraints
- Alerts are advisory only; no provider writes/control actions.
- Missing/null telemetry stays unknown, never zero.
- Sustain counting uses valid timestamped packets from one device.
- Hysteresis clear margin cannot make the active band narrower.
- Provider secrets remain server-only.
- No new runtime dependency.
- Full canonical `npm test` is the merge gate.
