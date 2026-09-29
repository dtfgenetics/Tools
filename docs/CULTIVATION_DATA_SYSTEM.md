# Cultivation Data System

## Goal

DTF cultivation tools should not each invent their own isolated data format. The Tools repository now defines one canonical record envelope for measurements, observations, tool calculations, sensor telemetry, GrowLens bridges, and imported grow data.

The center of the system is `thc-cultivation-record@1`.

## Data flow

```text
manual entry ─┐
meter reading ├─> canonical cultivation record ─> local history / charts
sensor feed ──┤                              ├─> other tools
GrowLens ─────┤                              ├─> GrowLens diary/state
tool result ──┘                              └─> approved research export
```

A tool should read the canonical fields it understands and emit reusable results back into the same format.

## Record identity and context

Every record contains:

- `type`: environment, light, solution, irrigation, root-zone, plant-growth, plant-observation, IPM, training, harvest, dry-cure, genetics, or tool-result.
- `sourceType`: manual, sensor, meter, tool, GrowLens, or import.
- optional `plantId`, `cycleId`, `spaceId`, and `zone`.
- `observedAt`.
- canonical `metrics` and matching units.
- small structured `values` for non-metric categorical data.
- provenance describing method/device/calibration and whether a result was estimated or derived.

## Canonical measurements

The shared metric vocabulary covers environment, light, solution chemistry, irrigation/runoff, root zone, plant growth, harvest, and dry/cure measurements. Canonical units are enforced by the shared core.

Do not store the same physical quantity under tool-specific names when it can be represented with a canonical metric.

## Tool requirements registry

`data/tool-data-requirements-v1.json` records each major tool's required inputs, optional inputs, derived metrics, collected metrics, record types, and public route.

This file is the planning authority when we ask:

- What data do we still need to collect?
- Which tools can reuse a reading?
- Which tools should share a sensor?
- What fields are missing from GrowLens?
- What data should Plant Atlas or Grow Doc learn from?
- Which new tool can be built from data we already have?

## Storage layers

The record contract is storage-independent.

1. Browser/local history is appropriate for anonymous tool sessions.
2. GrowLens is appropriate for user-owned plant/cycle history.
3. A future authenticated collector API can persist cross-device records.
4. Public research datasets receive only explicitly approved, sanitized exports.

The public Git repository stores schemas, code, reference datasets, and approved research artifacts. It should not store private live user journals.

## Existing systems this unifies

The Tools repository already has measurement normalization, history helpers, live telemetry normalization, provider adapters, time-series utilities, and GrowLens diary bridges. The cultivation-data core sits above those pieces and gives them a shared domain record.

## Implementation rule for every tool

When a tool gains a useful measurement or result:

1. Normalize the value to a canonical metric and unit.
2. Create a cultivation record with its plant/space/cycle context when known.
3. Preserve provenance, including whether it came from a sensor, meter, estimate, or calculation.
4. Append it to shared history.
5. Make it available to other compatible tools and GrowLens.
6. Export to research only through the separate consent/sanitization path.

This is the basis for building tools from accumulated real grow data rather than isolated calculator inputs.
