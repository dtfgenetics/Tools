# Competitive Tool Benchmark

Last reviewed: 2026-10-05

This document is a production gate for the DTF Genetics / Teaching Healthy Cultivation tool suite. “Better” means more useful for the intended cultivation workflow, not merely more features or a prettier page. Every canonical tool should compete on calculation transparency, workflow continuity, education, evidence, accessibility, responsive UX, persistence, portability, and safety of imported/local data.

## Benchmark principles

1. **Connected workflows beat isolated calculators.** A result should flow into the next cultivation decision when the relationship is legitimate.
2. **Show assumptions and units.** Do not hide chemistry, environmental math, or conversion conventions.
3. **User-defined targets are not universal recommendations.** Guardrails and steering bands must be labeled as user/program values unless a cited source supports a reference range.
4. **History must be useful.** Saving a record is not enough; tools need filtering, comparison, trend context, export/backup, and printable review where appropriate.
5. **Scientific tools need evidence and measurement-method guidance.** Sensor limitations, calibration, sampling method, and uncertainty belong in the product.
6. **Mobile is a first-class interface.** Controls must remain reachable, tables scroll intentionally, and navigation/touch targets remain usable.
7. **Imported/restored data is untrusted.** Escape user-controlled strings and validate record structure before rendering.
8. **Canonical implementation remains in dtfgenetics/Tools.** THC is an integration/deployment mirror.

## Current external benchmarks

### Environment / monitoring
- Pulse Grow — https://pulsegrow.com/
- Pulse Help Center — https://support.pulsegrow.com/
- AROYA — https://aroya.io/
- Growlink — https://growlink.com/

Benchmark capabilities include multi-zone dashboards, VPD/dew point/light/CO2 context, historical charts, filters, alerts/guardrails, journal/context, CSV exports, sensor-backed measurements, irrigation/root-zone data, and connected crop-steering workflows.

### Light / PPFD / DLI
- Apogee Instruments DLI resources — https://www.apogeeinstruments.com/daily-light-integral-measurement/
- Apogee Connect — https://www.apogeeinstruments.com/apogee-connect-overview/
- Pulse Grow advanced light monitoring — https://pulsegrow.com/
- Photone logging / heatmap workflows — https://growlightmeter.com/the-best-tool-for-logging-light-dli-ppfd-or-lux/ and https://growlightmeter.com/the-simplest-way-to-create-a-par-map-ppfd-heatmap/

Benchmark capabilities include PPFD/ePPFD measurement context, DLI calculation/integration, sensor calibration/accuracy context, timestamped logging, trend charts, average/median/min/max summaries, export, and clear distinction between instantaneous light and daily exposure. PAR/PPFD and ePAR logs must remain explicitly separated unless the measurement device itself supports the selected spectral range.

### Fertigation / nutrient formulation
- HydroBuddy / Science in Hydroponics — https://scienceinhydroponics.com/

Benchmark capabilities include target formulations, product/salt composition, source-water context, automated mass solving, target error, stock/direct preparation, and transparent elemental accounting.

### Irrigation / dryback / crop steering
- AROYA crop steering — https://aroya.io/education-guides/crop-steering
- Growlink crop steering — https://learn.growlink.com/crop-steering
- Growlink Precision Irrigation Playbook — https://growsmarter.growlink.io/

Benchmark capabilities include P0–P3-style irrigation phase thinking, field capacity, VWC, dryback, shot size, runoff/leachate, feed/root-zone EC, target bands, historical trends, and cultivar/stage context.

### Dry / cure
- Cannatrol — https://cannatrols.com/

Benchmark capabilities include staged dry/cure/store programs, temperature/dew-point control, gradual vs stepped transitions, water-activity context, history, and program repeatability.

### Interactive plant science / 3D
- BioDigital Human — https://www.biodigital.com/

The subject matter differs, but it is a strong UX benchmark for interactive scientific anatomy: searchable structures, labels, isolate/focus interactions, guided chapters/tours, supporting media, quizzes, mobile access, and accessibility-oriented alternate navigation.

### Terpene / chemistry reference
- PubChem — https://pubchem.ncbi.nlm.nih.gov/

Benchmark capabilities include searchable compounds, identifiers, 2D/3D structures, computed properties, downloadable coordinates/data, source provenance, and clear separation of measured/computed/reference information.

### Breeding / lineage
- Seedfinder — https://www.seedfinder.com/
- SeedFinder.eu lineage database — https://seedfinder.eu/

Benchmark capabilities include lineage search, interactive relationship maps, breeder/source attribution, strain profiles, and traversable parent/descendant relationships.

## DTF competitive status

| Tool family | Current strengths | Important remaining gaps |
| --- | --- | --- |
| PPFD / Light Lab | DLI + target PPFD, variable-light integration, canopy grids, 3×3–9×9 mapping, distribution metrics, baseline comparison, timestamped PPFD/ePPFD logging, generic HTTP/WebSocket ingest, authenticated same-origin provider/device PPFD reads when the server gateway is configured, time-series statistics, logged photon integration, CSV/JSON round-trip, print report, sensor/check metadata, PAR/ePAR separation | Expand provider/device-specific calibration coverage; provider reads intentionally do not infer PAR vs ePAR basis or bypass explicit logging |
| VPD / Environment | Shared VPD/dew-point/DLI math, reusable user guardrails, generic HTTP/WebSocket telemetry, authenticated same-origin provider ingestion through the telemetry dashboard when the server gateway is configured, sustained-alert engine, local active-transition history, optional browser notifications, alert-history export, zone/day-night summaries, long-history charts, CSV/JSON, print, GrowLens bridge | Expand provider coverage beyond the current gateway; cloud push/SMS and scheduled server-side exports still require external infrastructure, and browser notifications only work when the browser/platform permits them |
| Water Quality | pH/EC/alkalinity/hardness/major ions + trace nutrients, ion/charge-balance screening, alkalinity meq/L + bicarbonate-equivalent education, lab/report metadata, unit-aware CSV import aliases, canonical CSV template, explicit µS/cm→mS/cm conversion, deliberate rejection of ambiguous ppm auto-mapping, trends, backup/print, GrowLens handoff, full 12-nutrient Fertigation mapping, nitrate-N/sulfate-S fallbacks without double counting, explicit handoff completeness audit, context-only preservation for alkalinity/hardness/Na/Cl/provenance | Broader source-specific laboratory/provider import adapters remain useful; external laboratory APIs are not connected and alkalinity education intentionally does not become an acid-dose recommendation |
| Fertigation | Direct/injector math, P₂O₅/K₂O conversion, source water, 12-nutrient target-vs-achieved matrix, five-product optimizer, user product library, cost/stock/chemistry-class/solubility metadata, compatibility screening, measured-vs-reference EC verification, saved mix history/workflow, Water Lab and Dryback handoffs | Chemistry screening is intentionally conservative and cannot certify precipitation safety, chelate stability, pH-dependent availability, or real stock-tank compatibility; deeper chemistry-aware constraints remain a P0 |
| Dryback / irrigation | Weight/VWC modes, dryback rate, shot %, drainage %, feed/root EC comparison, P0–P3 steering templates and time classification, field-capacity/reference profiles, multi-sensor comparison, long-history charts, generic telemetry ingest, authenticated same-origin provider/device reads when the server gateway is configured, persistent VWC-rise irrigation candidates with threshold/cooldown/max-gap screening and export | Expand provider/controller coverage beyond the current gateway; detected VWC rises are candidates and still need reconciliation with known irrigation volume, emitter state, runoff and controller logs |
| Plant Growth | Persistent intervals, plant/stage filters, height/node/canopy/branch plus stem-diameter and internode-length rates, stage-aware/baseline comparisons, photo/observation references, same-stage cross-plant phenotype comparison with dimensional normalization to cm/day, shared trend chart, export/backup/print, GrowLens diary | True image-linked annotation/measurement and larger multi-plant/line cohort analysis remain opportunities; morphology comparisons stay descriptive rather than genetic-superiority or biomass claims |
| Root-Zone Temperature | Persistent history, zone/timing filters, root-air and solution-root deltas, feed/root EC context, generic telemetry ingest, authenticated same-origin provider/device reads when the server gateway is configured, multi-sensor/position comparison, shared chart, export/backup/print, GrowLens bridge | Expand provider coverage beyond the current gateway; the tool intentionally does not infer dissolved oxygen |
| Photoperiod Planner | Persistent schedules, schedule comparison, timeline visualization, linear dawn/dusk ramps, effective full-output-equivalent hours, manual date/latitude/longitude/UTC-offset solar sunrise/sunset planning with explicit 90.833° zenith/horizon assumptions, export/backup, print report and Light Lab handoff | Richer non-linear transition models remain; solar planning intentionally uses manual coordinates/offset rather than device-location tracking and keeps horizon/DST assumptions explicit |
| Dry / Cure Lab | Persistent checkpoints, water-activity field, staged Dry/Cure/Store programs, slope/step transitions, actual-vs-program deltas, vapor-pressure context, generic HTTP/WebSocket telemetry, authenticated same-origin provider/device reads when the server gateway is configured, lot trends with program overlays, full-run cross-lot comparison, workspace backup, saved program library, export/print | Hardware control remains separate; expand provider coverage beyond the current gateway while keeping all polling read-only and browser planning separate from hardware control |
| Plant Atlas | 3D explorer, semantic anatomy targets, 32-structure searchable index, fallback model, system comparison, six-stop guided tour with checks, canonical tool bridges, accessible 16-system tree with native details/summary navigation, and a scientific media library that reuses only relevant reference plates while explicitly listing systems still missing dedicated visuals | Stronger/high-detail model assets and new dedicated scientific visuals for currently uncovered systems remain the primary gaps |
| Terpene Atlas | 120 curated compounds, family wheel, shareable comparisons, evidence/source registry, population context, stereochemistry awareness, PubChem identifiers/structure links, structure/identifier panel, downloadable JSON compound records, imported-profile population context, and deterministic formula-derived molar mass + DBE labeled as calculated rather than experimental properties | Richer local 2D/3D chemistry rendering, more resolved identities/reference properties, deeper source drill-down and downloadable structure formats remain |
| Breeder Pedigree | Editable pedigree builder, Cytoscape graph, persistence/backup, recursive ancestry/descendant traversal, self-parent/cycle/conflicting-parentage validation, generation/testing notes, selection criteria, line status, breeder/source attribution, external reference URL, merge-only CSV lineage import with common field aliases and full graph validation, GrowLens handoff and print report | Richer source normalization, source-specific import adapters and larger pedigree review workflows remain |
| Tools Hub | Searchable canonical hub, shared shell/context, task-first workflow entry points for environment, irrigation/root zone, feed formulation, crop/light planning, harvest and breeding, weighted task/synonym search with exact-title priority and ranked matches, plus browser-local recent-tool prioritization for links opened from the Hub | Continue refining cross-tool handoffs and task ranking as capabilities grow; search aliases should stay descriptive rather than imply one symptom has one diagnosis |

## Required parity gates for production

A production-ready calculator/lab should normally provide:

- explicit units and formulas/assumptions
- input validation and bounded numeric fields
- responsive/mobile-safe controls
- keyboard-visible focus and semantic labels
- aria-live feedback for calculations or actions
- saved history when repeated measurement is meaningful
- filter/comparison/trend summary when history exists
- CSV export for tabular data
- JSON backup/restore for persistent structured data
- printable/saveable report for decision records
- escaped imported/local strings before HTML rendering
- cultivation context / GrowLens bridge where the relationship is meaningful
- cross-links into the preceding/following workflow tool
- current-scope limitations written in the UI
- deterministic tests for core math and persistence contracts

Hardware-backed features must never be implied when the browser has no sensor connection.

## Priority roadmap

### P0 — competitive blockers
1. **Environment:** expand authenticated provider coverage beyond the current same-origin gateway. Local browser notifications and alert-history export are implemented; cloud push/SMS and scheduled server-side exports still require external infrastructure.
2. **Dryback:** expand provider/controller coverage beyond the current same-origin gateway and reconcile sensor-detected irrigation candidates with known controller events, applied volume and runoff.
3. **Fertigation:** deepen chemistry-aware compatibility/solubility constraints and education without pretending the browser can certify precipitation safety or nutrient availability.
4. **Dry/Cure:** expand authenticated provider coverage beyond the current same-origin gateway while keeping hardware control separate from browser planning; continue deepening multi-checkpoint cross-lot analytics.

### P1 — differentiation
5. **Plant Atlas:** stronger/high-detail 3D model assets and dedicated scientific visuals for systems still listed as uncovered by the media library.
6. **Terpene Atlas:** richer local 2D/3D chemistry rendering, more resolved identities/reference properties, deeper source drill-down and downloadable structure formats; formula-derived mass/DBE are already covered.
7. **Water Lab:** source-specific laboratory/provider import adapters and provenance normalization; generic unit-aware aliases/template, alkalinity/speciation education, and the full-chemistry Fertigation handoff are now implemented.
8. **Breeder Pedigree:** add source-specific lineage adapters, richer source normalization and larger pedigree review workflows; merge-only canonical CSV import is now implemented.

### P2 — polish
9. **Light / Root-zone / Growth / Photoperiod:** expand provider/device-specific calibration coverage where appropriate, image-linked annotation/cohort phenotype analysis, and more advanced non-linear light-transition models; richer morphology, cross-plant comparison, printable schedule comparison, and manual solar-clock planning are already implemented.
10. **Tools Hub:** keep refining task ranking and cross-tool navigation as the suite expands; task-first workflows, ranked search and browser-local recent-tool prioritization are already implemented.
