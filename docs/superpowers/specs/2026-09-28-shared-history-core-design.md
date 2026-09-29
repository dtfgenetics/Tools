# Shared History + Portable Data Core Design

Date: 2026-09-28

## Goal
Give THC cultivation tools one reusable contract for filtering saved records, enumerating filter values, selecting the latest record per sensor/entity, numeric spreads, safe CSV rows, and validated history restoration.

## Architecture
Create `thc-history-core-v1.mjs` as a pure browser/Node-compatible module. It composes the existing time-series core rather than replacing charts or route-specific UI. Migrate Environment, Root-Zone Temperature, Dryback, and Plant Growth first; PPFD/VPD retain their specialized import/chart code but can consume this foundation later.

## Shared contracts
- `filterRecords(records, filters)`
- `uniqueFieldValues(records, key)`
- `latestByGroup(records, groupKey, dateKey)`
- `numericSpread(records, key)`
- `csvRow(values)`
- `csvTable(header, records, mapper)`
- `sanitizeHistory(records,{limit,validator,normalize})`

## Constraints
- Preserve route URLs and storage keys.
- Preserve existing backup schema/version compatibility.
- Empty/null numeric values must never become zero implicitly.
- CSV values must be quoted/escaped consistently.
- No new dependency.
- Full canonical npm test is the merge gate.
