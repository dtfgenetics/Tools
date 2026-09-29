# Competitive Tool Benchmark

Last reviewed: 2026-09-29

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
| PPFD / Light Lab | DLI + target PPFD, variable-light integration, canopy grids, 3×3–9×9 mapping, distribution metrics, baseline comparison, timestamped PPFD/ePAR logging, time-series chart, summary statistics, logged photon integration, CSV/JSON round-trip, print report, sensor/check metadata, PAR/ePAR education | No direct hardware ingest/API; continue improving visual map/report polish and calibration workflow |
| VPD / Environment | Shared math, dew point, DLI, reusable user guardrail profiles, manual JSON plus read-only HTTP/WebSocket telemetry transport, telemetry dashboard/alert context, zone filtering, day/night summary, selectable long-history charts with saved VPD guardrail overlays, CSV/JSON, print, GrowLens bridge | No authenticated vendor-specific connector, push/SMS delivery, or scheduled exports |
| Water Quality | pH/EC/alkalinity/hardness/major ions together, source filtering, trends, backup/export/print, GrowLens handoff | Needs stronger ion-balance/alkalinity education, lab-method metadata, optional CSV import, and more direct fertigation mapping than Ca/Mg alone |
| Fertigation | Direct and injector math, P2O5/K2O conversion, source water, 12-nutrient target-vs-achieved matrix (N/P/K/Ca/Mg/S/Fe/Mn/Zn/Cu/B/Mo), five-product optimizer, user-defined product library, cost/stock metadata, expected/reference vs measured EC context, recipe persistence, Water Lab and Dryback handoffs | Needs deeper compatibility/solubility education and chemistry-aware constraints; stock-group metadata remains organizational only and does not certify compatibility |
| Dryback / irrigation | Weight or VWC mode, dryback rate, shot %, drainage %, feed handoff, filtering, print/export, P0–P3 steering phases, reusable steering templates, time-based phase classification, multi-sensor comparison, selectable sensor/metric time-series charts, saved dryback target-band overlays, feed/root EC comparison, read-only HTTP/WebSocket VWC/EC packet ingest with device/time metadata, field-capacity/reference profiles, workspace backup | No authenticated vendor-specific substrate connector or automatic irrigation-event detection from a continuous sensor stream |
| Plant Growth | Persistent intervals, plant/stage filtering, height/node/canopy/branch rates, comparison summary, shared long-history time-series chart, export/backup/print, GrowLens diary | Needs photo linkage, richer morphology measurements, and stronger stage-aware/baseline comparisons across repeated phenotype observations |
| Root-Zone Temperature | Persistent history, zone/timing filters, comparison summary, root-air and solution-root deltas, feed/root EC context, shared multi-series root/air/solution temperature chart, export/backup/print, GrowLens bridge | Needs multi-sensor comparison and optional live root-zone ingest; it intentionally does not infer dissolved oxygen |
| Photoperiod Planner | Persistent schedules, timeline visualization, schedule comparison, internal consistency checks, export/backup, and Light Lab handoff | Needs richer dawn/dusk transition modeling, printable comparison reports, and optional location-aware sunrise/sunset planning without hiding assumptions |
| Dry / Cure Lab | Persistent checkpoints, water-activity field, staged Dry/Cure/Store programs, slope-vs-step transitions, actual-vs-program comparison, temperature/dew-point/RH deltas, vapor-pressure context, lot-filtered long-history charting with saved program-target overlays, workspace backup, saved program library, export and print report | Hardware/control integration remains separate; future work should focus on direct sensor ingest and richer cross-lot comparison without implying browser control of drying hardware |
| Plant Atlas | 3D explorer, semantic anatomy targets, search/index, system routes, fallback model, scientific diagrams, system-vs-system comparison, six-stop guided anatomy tour with learning checks, canonical tool bridges | Still needs richer media blocks, stronger model assets, and broader accessibility-equivalent list/tree exploration throughout |
| Terpene Atlas | 120 curated named compounds, family wheel, comparison, evidence registry, measured-population context, stereochemistry awareness | Needs richer chemistry visualization, 2D/3D structures or structure links, identifiers/properties, stronger source drill-down, and downloadable compound records |
| Breeder Pedigree | Editable pedigree builder, Cytoscape graph, local persistence/backup, recursive ancestor/descendant traversal, self-parent/cycle validation, conflicting-parentage audit, GrowLens handoff and print report | Still needs richer generation/selection metadata and optional external-reference attribution |
| Tools Hub | Searchable canonical hub, consistent shared shell, connected context, task-first workflow entry points for environment, irrigation/root zone, feed formulation, crop/light planning, harvest and breeding | Continue polishing search, prioritization and cross-tool handoffs as the suite grows |

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
1. Environment: add authenticated direct provider ingestion plus notification/export integrations without implying hardware where none is connected.
2. Dryback: add authenticated vendor-specific substrate connectors and automatic irrigation-event detection while preserving the existing generic read-only transport, steering templates and multi-sensor review.
3. Fertigation: deepen compatibility/solubility education and chemistry-aware constraints without pretending the browser can certify precipitation safety.
4. Dry/Cure: add optional sensor ingest and cross-lot comparison while keeping hardware/control integration clearly separate from browser planning.

### P1 — differentiation
5. Terpene Atlas: structure visualization/identifiers/downloadable compound records.
6. Water Lab: broader source-water chemistry import and stronger full-chemistry fertigation handoff.
7. Breeder Pedigree: richer generation/selection metadata and optional external-reference attribution.
8. Plant Atlas: richer media blocks, stronger model assets and broader accessible list/tree navigation.

### P2 — polish
9. Root-zone and Growth: multi-sensor/photo-linked comparison workflows; Photoperiod: richer dawn/dusk transition modeling and printable comparison reports.
10. Tools Hub: continue refining task prioritization and cross-tool navigation as new capabilities land.
