# Shared Telemetry Dashboard Core Design

Date: 2026-09-28

## Goal
Give THC one reusable multi-sensor / multi-zone dashboard model so live telemetry can be summarized consistently across Environment, Root Zone, Dryback, PPFD, pH/EC, and GrowLens.

## Architecture
Add `thc-telemetry-dashboard-core-v1.mjs`, a pure ES module layered on the existing live packet contract. It accepts normalized telemetry packets, selects the latest packet per device, derives freshness/health, groups devices by zone, reports metric coverage, and produces a stable table model. Add a small reusable browser renderer module and mount it in Environment Control as the first consumer.

## Contracts
- `latestDevicePackets(records,{now,staleAfterMs})`
- `telemetryHealthSummary(records,{now,staleAfterMs})`
- `zoneTelemetrySummary(records,{now,staleAfterMs})`
- `telemetryMetricCoverage(records)`
- `telemetryTableModel(records,{now,staleAfterMs,metricKeys})`

## Constraints
- Volatile/read-only workspace in this phase: no live packet persistence.
- No credentials or control endpoints.
- Invalid timestamps do not win latest-device selection.
- Null/blank metrics remain unknown.
- Existing route storage keys and save actions stay unchanged.
- No new production dependency.
- Full canonical `npm test` is the merge gate.
