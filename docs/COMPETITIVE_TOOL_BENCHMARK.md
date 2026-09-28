# Competitive Tool Benchmark

Last reviewed: 2026-09-28

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

Benchmark capabilities include PPFD/ePPFD measurement context, DLI calculation/integration, sensor calibration/accuracy context, logging, export, and clear distinction between instantaneous light and daily exposure.

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
| PPFD / Light Lab | DLI + target PPFD, variable-light integration, canopy grids, 3×3–9×9 mapping, distribution metrics, baseline comparison, CSV/JSON round-trip, print report, sensor/check metadata, PAR/ePAR education | No direct hardware ingest/API; continue improving visual map/report polish and calibration workflow |
| VPD / Environment | Shared math, dew point, DLI, reusable user guardrail profiles, persisted alert-event context, local history, zone filtering, day/night summary, CSV/JSON, print, GrowLens bridge | No real-time sensor connection, push/SMS notification engine, or scheduled exports |
| Water Quality | pH/EC/alkalinity/hardness/major ions together, source filtering, trends, backup/export/print, GrowLens handoff | Needs stronger ion-balance/alkalinity education, lab-method metadata, optional CSV import, and more direct fertigation mapping than Ca/Mg alone |
| Fertigation | Direct and injector math, P2O5/K2O conversion, source water, target-vs-achieved matrix, recipe persistence, Water Lab and Dryback handoffs | Optimizer currently covers N/P/K/Ca/Mg only; needs S/micronutrients, more products, product/salt library, compatibility/solubility flags, cost, and measured-vs-predicted EC context |
| Dryback / irrigation | Weight or VWC mode, dryback rate, shot %, drainage %, feed handoff, filtering, print/export, P0–P3 steering phase, feed/root EC context, user target band | No live substrate data, field-capacity workflow, phase profile templates, automated event detection, or multi-sensor comparison |
| Plant Growth | Persistent intervals, plant filtering, height/node rates, comparison summary, export/backup/print, GrowLens diary | Needs richer morphology/branch/canopy measurements, photo linkage, stage-aware comparison, and charting beyond simple bars |
| Root-Zone Temperature | Persistent history and export/backup | Needs filtering, comparison summary, print report, and stronger relationship to irrigation/root-zone EC/oxygen context |
| Photoperiod Planner | Persistent schedules and export/backup | Needs schedule comparison, sunrise/sunset/transition visualization, conflict checks, print report, and stronger Light Lab handoff |
| Dry / Cure Lab | Persistent checkpoints, water-activity field, staged Dry/Cure/Store programs, slope-vs-step transitions, temperature/dew-point targets with calculated RH, saved program library, export/backup and print report | Still needs program-to-checkpoint comparison, richer vapor-pressure/water-activity visualization, and hardware/control integration |
| Plant Atlas | 3D explorer, semantic anatomy targets, search/index, system routes, fallback model, scientific diagrams | Needs guided tours, learner checkpoints/quizzes, richer media blocks, stronger model assets, and accessibility-equivalent list/tree exploration throughout |
| Terpene Atlas | 120 curated named compounds, family wheel, comparison, evidence registry, measured-population context, stereochemistry awareness | Needs richer chemistry visualization, 2D/3D structures or structure links, identifiers/properties, stronger source drill-down, and downloadable compound records |
| Breeder Pedigree | Editable pedigree builder, Cytoscape graph, local persistence/backup, DTF breeding workflow orientation | Needs richer generation/selection metadata, relationship validation, descendant/ancestor traversal, share/print views, and optional external-reference attribution |
| Tools Hub | Searchable canonical hub, consistent shared shell, connected context | Needs workflow-oriented entry points (“diagnose environment”, “plan irrigation”, “formulate feed”, “review harvest”) in addition to tool-by-tool browsing |

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
1. Fertigation: expand optimizer beyond N/P/K/Ca/Mg and add product library / target-error workflow.
2. Dryback: field-capacity workflow, steering profiles, EC/VWC phase comparison.
3. Dry/Cure: compare actual checkpoints against the active staged program and deepen vapor-pressure / water-activity visualization.
4. Environment: add optional sensor/API ingestion and notification/export integrations without implying hardware where none is connected.

### P1 — differentiation
5. Plant Atlas: guided tours + learning checks + richer accessible anatomy navigation.
6. Terpene Atlas: structure visualization/identifiers/downloadable compound records.
7. Breeder Pedigree: generation/selection metadata, lineage validation, share/print.
8. Water Lab: broader source-water chemistry import and fertigation handoff.

### P2 — polish
9. Root-zone, Photoperiod and Growth: comparison reports, richer charts, workflow bridges.
10. Tools Hub: task-first workflow navigation layered over the canonical tool directory.
