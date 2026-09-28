# Shared Solution + Irrigation Core Design

Date: 2026-09-28

## Goal
Unify Water Quality, Fertigation, and Dryback around one browser-native record contract for source water, mixed solution, feed/runoff/root-zone EC, pH, applied volume, runoff volume, substrate volume, and provenance.

## Architecture
Create `thc-solution-irrigation-core-v1.mjs` as a small shared data/math adapter layered on the existing cultivation math and measurement cores. Keep every public route and storage schema unchanged. The new module normalizes records, computes irrigation execution metrics, compares source/feed/root-zone EC, and creates versioned handoff payloads.

## Shared contracts
- `normalizeSolutionRecord(input)`
- `ecComparison({sourceEc,expectedEc,feedEc,rootEc})`
- `irrigationMetrics({appliedMl,runoffMl,substrateMl})`
- `createFertigationHandoff(input)`
- `normalizeWaterReport(input)`

## Migrations
- Water Quality Lab uses shared water-report normalization and shared time-series summaries.
- Fertigation Lab uses shared solution normalization, EC comparison, and versioned dryback handoff.
- Dryback Lab consumes the handoff through the shared core and uses shared irrigation metrics.

## Constraints
- Preserve localStorage keys and version-1 handoff compatibility.
- No automatic irrigation/control claims.
- No conductivity prediction from elemental ppm.
- No manufacturer-specific nutrient rates copied into THC.
- Only permissively licensed external code may be copied; reference-only sources stay uncopied.
- Full deterministic `npm test` is the merge gate.
