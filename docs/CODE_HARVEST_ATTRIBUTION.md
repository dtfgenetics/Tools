# Code Harvest & Attribution Ledger

This ledger prevents external reference code from entering THC without a provenance/licensing decision.

| Project | Use | License status | Direct code copied? | Action |
|---|---|---|---|---|
| dwot/isley | Grow-journal architecture/reference | MIT verified | No | Preserve MIT notice if code is later ported |
| Dmans218/emerald-plant-tracker | Plant/environment history UX/reference | MIT verified | No | Preserve MIT notice if code is later ported |
| dlazarogi/VPD-calculator | VPD modes/reference | Verify before direct reuse | No | Use equations/concepts only until verified |
| danielfppps/hydrobuddy | Nutrient formulation/reference | Verify before direct reuse | No | Do not copy code until compatible reuse is confirmed |
| JakeTheRabbit/HAGR | Irrigation/crop-steering reference | Verify before direct reuse | No | Architecture/reference only |

The THC Cultivation Math Engine v1 is an original implementation of standard published equations. No external project source code was copied into it.


## 2026-09-29 guided-workflow benchmark

- Athena Batch Tank Nutrient Calculator (MIT): benchmarked its mobile-first guided "Mix mode", remembered local state, and tank-side step completion UX. No Athena product rates, schedules, formulas, or source code were copied; DTF implements the interaction pattern with its own generic workflow state machine and existing cultivation math.
- Open Source Horticulture calculators: benchmarked the value of a unified calculator suite spanning DLI, VPD, fertilizer and dilution workflows. DTF keeps these capabilities behind shared canonical math/data modules rather than duplicating formulas per page.
- HydroBuddy: benchmarked multi-product nutrient-solution optimization as a mature reference model. DTF's existing solver remains independently implemented and explicitly bounded by entered guaranteed-analysis data.
