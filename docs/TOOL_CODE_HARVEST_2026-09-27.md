# THC Tool Code Harvest Matrix — 2026-09-27

## Purpose
Identify external open-source implementations that can strengthen the THC cultivation tools without replacing the existing THC design system, evidence standards, standalone routes, or deterministic QA.

## Production rule
Do not copy code until its license is verified. Prefer permissive licenses (MIT, BSD, Apache-2.0). For GPL/AGPL/CC-NC or unknown licenses, use only independently derived concepts unless legal review approves reuse.

## Current THC targets
- `/ppfd-chart/` — THC Light Lab: PPFD, DLI, canopy mapping, schedule analysis
- `/vpd-chart/` — air/leaf VPD, charting, history
- `/ph-meter/` — pH interpretation and measurement workflow
- `/tds-meter/` — EC/TDS/500/700 conversion and measurement workflow
- `/atlas/` — Plant Atlas
- `/terpene-atlas/` — Terpene Atlas
- GrowLens / Grow Doc — diagnostic and longitudinal records

## Approved harvest candidates

### BenLeikin/openSeedling — MIT
Source: https://github.com/BenLeikin/openSeedling
License: MIT

Use/adapt:
- Fixture-specific light calibration curves instead of assuming linear dimming.
- Schedule-aware DLI forecast using the remaining photoperiod.
- Per-grow-area/setup separation of light, sensor, target band and history.
- Hysteresis + sustained-clear logic for alerts to prevent threshold flapping.
- Sensor stale/removed states.
- Daily light target band visualization and day-progress pacing.
- Graceful optional sensor handling.
- Per-field validation pattern for settings.
- Static asset cache-busting/versioning.

Targets:
1. `/ppfd-chart/`
2. `/vpd-chart/`
3. Environmental Control Center
4. GrowLens history/alerts

Implementation note:
Port concepts into browser-native JavaScript and THC storage models. Do not copy Raspberry Pi GPIO/hardware-control code into the public web tools.

### johnhouston707/cannabis-cultivation-resources — license not verified
Source: https://github.com/johnhouston707/cannabis-cultivation-resources

Potentially useful data:
- terpene profile JSON
- genetics relationship JSON
- environment comparison datasets

Status: REFERENCE ONLY until license is verified. Do not copy dataset contents into production yet.

Targets:
- `/terpene-atlas/`
- Plant/genetics relationship views
- environment comparison references

## Reference-only / excluded candidates

### dlazarogi/VPD-calculator — CC BY-NC-SA 4.0
Source: https://github.com/dlazarogi/VPD-calculator
License restricts commercial use.

Do not copy code into DTF production.
Safe use: compare public formulas/method descriptions against primary scientific references, then independently implement from those references.

Potential concept checks:
- leaf-based VPD
- air-based VPD
- method-selection explanation
- altitude/pressure discussion

### thebuggeddev/seed — license not found
Source: https://github.com/thebuggeddev/seed

Useful interaction benchmark:
- 3D specimen states
- anchored anatomy markers
- hover/click structure identification
- science cards → lesson → quiz flow

Status: visual/UX benchmark only until a compatible license is present.

Target:
- `/atlas/` interaction architecture

## Immediate engineering work

### P0 — PPFD / Light Lab
Add:
- fixture calibration profile data model
- non-linear dimming curve support
- schedule-aware projected DLI
- target-band pace chart
- saved fixture profiles
- stale-measurement flags
- exportable calibration metadata

### P0 — VPD
Add:
- named grow-zone profiles
- timestamped history datasets compatible with the shared environment center
- alert hysteresis and sustained-clear logic
- explicit air-VPD vs leaf-VPD modes
- sensor freshness / source metadata

### P0 — EC/TDS
Add:
- saved meter profiles
- calibration date and standard-solution metadata
- explicit 500/700 scale identity everywhere a ppm value is shown
- EC-first canonical storage
- conversion provenance in exports

### P1 — Plant Atlas
Benchmark interaction architecture against modern interactive science atlases:
- structure anchors
- focus state
- detail drawer
- related lesson
- quiz/deep-link handoff
Keep THC raster/photorealistic educational visual requirements; do not introduce SVG instructional artwork.

### P1 — Terpene Atlas
Before importing third-party data, require:
- verified license
- source provenance
- chemical identity normalization
- cis/trans and stereochemical handling
- evidence-grade fields

## Acceptance requirements
- Preserve `site/public-route-patch/` route ownership.
- Preserve THC shell and cross-links.
- No new production dependency without a documented reason.
- Deterministic Node-based validation; do not introduce Playwright.
- Responsive/mobile-first behavior.
- Accessibility keyboard/focus coverage.
- Source/license attribution where required.
- No third-party code with incompatible or unknown license copied into production.


## Live telemetry / connector references — 2026-09-28

### mqttjs/MQTT.js — MIT
Source: https://github.com/mqttjs/MQTT.js
License: MIT

Use as an architectural reference for future broker-backed device connectors:
- connection lifecycle
- subscription/message separation
- browser-compatible telemetry transport

Status: LICENSE VERIFIED. Not vendored in this phase because THC can keep the shared sensor contract transport-neutral and avoid a new runtime dependency until an MQTT broker integration is actually enabled.

### pladaria/reconnecting-websocket — MIT
Source: https://github.com/pladaria/reconnecting-websocket
License: MIT

Use/adapt concepts:
- reconnect lifecycle
- bounded retry delay
- explicit close vs reconnect behavior
- transport state callbacks

Status: LICENSE VERIFIED. Concepts independently implemented in `thc-live-data-core-v1.mjs`; no third-party runtime dependency added.

### leeoniya/uPlot — MIT
Source: https://github.com/leeoniya/uPlot
License: MIT

Status: already vendored in the Tools repository. Reuse for dense multi-series telemetry visualization instead of adding another chart library.

### Commercial benchmark observations
- Growlink publicly documents REST APIs, WebSocket streams, webhooks and telemetry access.
- Pulse exposes live/recent sensor data APIs, historical charts and CSV exports.
- AROYA combines substrate EC/VWC/temperature, irrigation measurements and climate data.

Engineering implication:
Keep transports separate from the normalized THC packet contract so REST, WebSocket, MQTT, CSV imports and future vendor-specific adapters can all feed the same cultivation tools without duplicating parsing, freshness, history and chart logic.
