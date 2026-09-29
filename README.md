# DTF Genetics — Cultivation Tools

Canonical source repository for the DTFSeeds / Teaching Healthy Cultivation interactive cultivation-tool suite.

The repository owns the Tools hub, Plant Atlas, Terpene Atlas, pH and EC references, VPD and PPFD/DLI tools, plus the expanded cultivation workflow tools for water quality, fertigation, dryback, environment, IPM, planning, breeding, conversions, dilution, substrate, ventilation/CO₂, photoperiod, plant growth, root-zone temperature, and dry/cure work.

Public routes are deployed at dtfseeds.com from the deploy-compatible tree under `site/public-route-patch/`.

## Shared cultivation data

Reusable grow measurements and tool outputs use the canonical `thc-cultivation-record@1` contract. The contract, local storage layer, source bridges, and per-tool data requirements live in this repository. See `docs/CULTIVATION_DATA_SYSTEM.md` and `data/tool-data-requirements-v1.json`. This lets manual entries, meters, sensor telemetry, GrowLens context, and calculated tool results feed one compatible data layer instead of isolated per-tool formats.

## Repository rule

New tool features, fixes, datasets, shared UI/runtime changes, and cultivation math changes originate here in `dtfgenetics/Tools`.

`dtfgenetics/Thc` is the website/education integration and deployment repository. Its tool files are mirrors, not an alternate authoring source. Never copy tool implementation changes from `Thc` back over this repository.

## Validation

Run `npm test`.

Validation is deterministic and does not use Playwright.
