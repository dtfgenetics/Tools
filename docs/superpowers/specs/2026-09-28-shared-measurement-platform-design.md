# Shared Measurement Platform Design

Date: 2026-09-28

## Goal
Reduce duplicated code across the THC cultivation tools while improving parity with modern monitoring products: calibration provenance, sensor/source identity, stale/offline detection, reusable history summaries, sustained excursions, CSV/JSON portability, and consistent cross-tool records.

## Architecture
Keep every public route and tool-specific UI. Add small browser-native shared modules under `site/public-route-patch/assets/` and migrate pages incrementally.

1. `thc-meter-core-v1.mjs`
   - normalize meter/source metadata
   - calibration-age state without inventing universal calibration intervals
   - reading freshness state
   - pH and EC record validation primitives
2. `thc-timeseries-core-v1.mjs`
   - numeric summaries
   - time-window filtering
   - grouped summaries
   - stale/latest observation state
   - sustained band excursion analysis via the existing measurement core
3. `thc-measurement-journal-v1.js`
   - remain the DOM/storage/chart adapter
   - use shared normalization/header helpers
   - expose rows and filtered summaries without duplicating parsing/storage logic

## First migrations
- pH Meter: shared calibration/source metadata and journal normalization.
- TDS/EC Meter: same shared meter core, preserving EC-first storage and 500/700 scale identity.
- Root-zone Temperature: shared time-series summary/latest-reading behavior.
- Environment Control: shared time-series summaries and freshness semantics where saved readings exist.

## Constraints
- No framework migration.
- No new production dependency unless unavoidable.
- Preserve current storage schemas and public routes.
- Preserve GrowLens bridges and educational copy.
- No claim of live hardware connectivity unless a real source is attached.
- External source code may only be copied when license-compatible; otherwise independently implement the pattern.
- Deterministic Node tests remain the production gate.
