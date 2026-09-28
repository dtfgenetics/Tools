# Canonical tool ownership

As of 2026-09-28, `dtfgenetics/Tools` is the source of truth for the DTFSeeds cultivation tool suite.

`dtfgenetics/Thc` remains the site integration/deployment repository and may contain synchronized copies of tool files solely so the public-suite and WordPress/Hostinger publishing system can package them.

## Canonical public routes

- `/tools/`
- `/atlas/`
- `/terpene-atlas/`
- `/ph-meter/`
- `/tds-meter/`
- `/vpd-chart/`
- `/ppfd-chart/`
- `/unit-converter/`
- `/dilution-calculator/`
- `/root-zone-temperature/`
- `/plant-growth-tracker/`
- `/photoperiod-planner/`
- `/co2-ventilation/`
- `/breeder-pedigree/`
- `/substrate-calculator/`
- `/grow-planner/`
- `/dry-cure-lab/`
- `/ipm-scout/`
- `/environment-control/`
- `/dew-point/`
- `/dryback-lab/`
- `/fertigation-lab/`
- `/water-quality-lab/`

## Ownership rule

Implementation work starts in `dtfgenetics/Tools`. Integration copies in `dtfgenetics/Thc` must not be treated as canonical and must never overwrite newer canonical Tools code.

GrowLens and THC Grow Doc remain separate application products and are not moved into this repository merely because they link to the Tools experience.
