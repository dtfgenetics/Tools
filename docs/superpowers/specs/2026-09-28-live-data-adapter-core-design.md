# Shared Live Data Adapter Core Design

Date: 2026-09-28

## Goal
Give THC cultivation tools one vendor-neutral read-only telemetry contract for live/polled sensor data, freshness/offline state, deduplication, bounded history, and chart-series construction.

## Competitive requirements
Current cultivation platforms expose live/historical telemetry, device filtering, exports, and API/real-time connectors. THC should support the same data flow without coupling every calculator to a vendor SDK.

## Architecture
Create `thc-live-data-core-v1.mjs` as a pure ES module. It accepts flat or mapped JSON telemetry, normalizes timestamps/source/device/zone/metrics, preserves missing values as unknown, deduplicates packets, caps buffers, calculates freshness/connection state, derives deterministic reconnect delays, and builds time-aligned chart series. Environment Control is the first route integration; other tools consume the same packet schema later.

## Contracts
- `normalizeTelemetryPacket(input,{sourceId,deviceId,zone,mapping})`
- `telemetryPacketKey(packet)`
- `appendTelemetryPacket(records,packet,{limit})`
- `telemetryFreshness(packet,{now,staleAfterMs})`
- `connectionState({connected,lastSeenAt,now,staleAfterMs})`
- `reconnectDelay(attempt,{baseMs,maxMs})`
- `buildMetricSeries(records,metricKeys)`

## Constraints
- Read-only in this phase: no climate/irrigation control endpoints.
- No API tokens or credentials stored in localStorage.
- Preserve existing routes/storage keys and manual workflows.
- Empty/null numeric values stay unknown; never coerce to zero.
- No new runtime dependency.
- Full canonical `npm test` is the merge gate.
