# Shared Live Tool Adapter Design

Date: 2026-09-28

## Goal
Reuse the existing live telemetry core across VPD, Root Zone, Dryback, pH, EC/TDS and PPFD without duplicating parser/status/apply UI in every route.

## Architecture
Add `thc-live-tool-adapter-v1.mjs`, a small browser module layered on `thc-live-data-core-v1.mjs`. It parses one JSON packet, normalizes it through the shared core, renders a consistent read-only preview/apply panel, and applies only mapped numeric fields to existing inputs. Routes add one mount container and one mount call.

## Contracts
- `parseLiveJsonPacket(text, options)`
- `applyPacketFields(packet, tool, resolveField)`
- `mountLiveToolAdapter({container,tool,zoneField,onApplied})`

## Constraints
- No packet, URL, token, password, or API key persistence.
- Applying telemetry never auto-saves a cultivation record.
- Missing metrics never overwrite existing inputs.
- Existing route storage keys, calculations, and manual save flows remain unchanged.
- No new runtime dependency.
- Full canonical `npm test` is the merge gate.
