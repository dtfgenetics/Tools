# DTF / THC Cultivation Tools — Evidence & Reference Registry

Canonical repository: `dtfgenetics/Tools`

Migrated from legacy placeholder repository `dtfgenetics/all-in-one-thc-grow-` on 2026-09-28. Future revisions belong here.

Last reviewed: 2026-09-26

This document is the shared evidence registry for DTF/THC cultivation tools. It should be used when building or revising PPFD/DLI, VPD, pH, EC/TDS, nutrient, plant-diagnostic, plant-atlas, and terpene-atlas tools.

## Production evidence rules

1. Prefer peer-reviewed primary research, university extension publications, government/standards sources, and instrument-science references.
2. Separate measured values from grower heuristics.
3. Avoid presenting a single number as universally optimal when cultivar, growth stage, CO2, temperature, substrate, irrigation strategy, or measurement method materially changes the recommendation.
4. Display target bands, assumptions, units, and evidence strength in user-facing tools.
5. Use EC (mS/cm or dS/m) as the primary dissolved-salt measurement. Treat ppm/TDS as a derived meter scale and identify the conversion factor used.
6. For cannabis-specific claims, prefer cannabis-specific studies over general greenhouse guidance. Use general controlled-environment horticulture sources to explain underlying plant science.
7. Re-check sources when making major tool revisions.

## PPFD / DLI / lighting

### Cannabis-specific
- Rodriguez-Morrison et al. (2021), Frontiers in Plant Science — "Cannabis Yield, Potency, and Leaf Photosynthesis Respond Differently to Increasing Light Levels in an Indoor Environment"
  https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2021.646020/full
  Use for: PPFD-response, canopy vs leaf response, yield, photosynthesis, cannabinoid/terpene response.

- Llewellyn et al. (2022), Frontiers in Plant Science — "Indoor grown cannabis yield increased proportionally with light intensity, but ultraviolet radiation did not affect yield or cannabinoid content"
  https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2022.974018/full
  Use for: high-PPFD response, UV claims, yield/potency separation.

- Scientific Reports (2025), "Vegetative and reproductive stage lighting interactions on flower yield, water use efficiency, terpenes, and cannabinoids of Cannabis sativa"
  https://www.nature.com/articles/s41598-025-27437-4
  Use for: cumulative light/DLI, stage interactions, photosynthesis, transpiration, stomatal conductance, WUE.

### General horticulture
- Purdue Extension — DLI requirements and supplemental-light economics.
  https://www.extension.purdue.edu/extmedia/ho/ho-238-b-w.pdf
  https://www.extension.purdue.edu/extmedia/HO/HO-283-W.pdf

Tool requirements:
- PPFD -> DLI calculator using photoperiod.
- DLI -> average PPFD calculator.
- Canopy mapping guidance rather than relying on a single center reading.
- Explicit CO2/environment caveat for high-light targets.
- Evidence-linked growth-stage presets, not universal hard-coded limits.

## pH / EC / TDS / nutrient solution

- Oklahoma State University Extension, HLA-6722 — "Electrical Conductivity and pH Guide for Hydroponics"
  https://extension.okstate.edu/fact-sheets/electrical-conductivity-and-ph-guide-for-hydroponics
  Use for: EC fundamentals, pH, alkalinity, water testing, meter calibration, units.

- Oklahoma State University Extension — Hydroponics
  https://extension.okstate.edu/fact-sheets/hydroponics
  Use for: hydroponic nutrient-management concepts and EC/pH context.

- Penn State Extension — "Hydroponics Systems and Principles of Plant Nutrition: Essential Nutrients, Function, Deficiency, and Excess"
  https://extension.psu.edu/hydroponics-systems-and-principles-of-plant-nutrition-essential-nutrients-function-deficiency-and-excess
  Use for: nutrient functions, deficiency/excess context, EC monitoring.

- Kpai et al. (2024), Frontiers in Plant Science — "Mineral nutrition for Cannabis sativa in the vegetative stage using response surface analysis"
  https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2024.1501484/full
  Use for: cannabis-specific N-P-K interactions and vegetative-stage mineral nutrition.

Tool requirements:
- EC is canonical; ppm/TDS must state 500/0.5, 640/0.64, or 700/0.7 scale.
- Show source-water EC separately from final feed EC.
- Include alkalinity as distinct from pH.
- Do not infer elemental nutrient concentrations from EC alone.
- Explain substrate/runoff/drain EC vs reservoir/feed EC.
- Include calibration reminders and temperature considerations.

## VPD / temperature / humidity / transpiration

- Frontiers in Plant Science (2025) — "Predicting vegetative phase nutrient uptake in Cannabis sativa L. via transpiration-driven mass-balance"
  https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2025.1753553/full
  Use for: cannabis VPD context, transpiration, nutrient uptake, greenhouse environmental ranges.

- Scientific Reports (2025) lighting/WUE study above.
  Use for: interaction among PPFD, transpiration, stomatal conductance, and water-use efficiency.

Tool requirements:
- Calculate saturation vapor pressure from temperature and RH.
- Support air VPD and leaf VPD; do not silently treat them as identical.
- Allow measured leaf temperature offset.
- Explain that VPD is a driver/context variable, not a complete diagnosis by itself.
- Cross-link VPD with PPFD, irrigation/dryback, and temperature tools.

## Plant diagnostics / nutrient symptoms

- Penn State Extension hydroponic nutrition reference above.
  Use for: deficiency/excess symptom framework and measurement-based confirmation.

Diagnostic UX rules:
- Visual symptoms are non-specific. Never diagnose solely from leaf color/pattern when multiple causes fit.
- Separate observation -> differential -> verification.
- Include pH/EC/root-zone/environment/pest/pathogen checks where relevant.
- Attach evidence and uncertainty to each candidate.
- Distinguish deficiency, antagonism/lockout, toxicity, irrigation/root stress, pests, pathogens, and environmental injury.

## Terpene atlas / aroma science

- Booth & Bohlmann (2019), Plant Science — "Terpenes in Cannabis sativa — From plant genome to humans"
  https://pubmed.ncbi.nlm.nih.gov/31084880/
  Use for: cannabis terpene biosynthesis, genetics, variability, standardization limits.

- "The Cannabis Terpenes" (2020), Molecules / PubMed Central
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7763918/
  Use for: terpene classes, biosynthesis, cannabis context.

- "Cannabinoids, Phenolics, Terpenes and Alkaloids of Cannabis" (2021), PubMed Central
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8125862/
  Use for: chemical taxonomy and compound reference.

- PubMed (2025), "Exploring Aroma and Flavor Diversity in Cannabis sativa L.—A Review of Scientific Developments and Applications"
  https://pubmed.ncbi.nlm.nih.gov/40649299/
  Use for: aroma/flavor diversity, cultivation/post-harvest effects, analytical/sensory context.

Terpene-tool requirements:
- Separate aroma/sensory descriptors from pharmacological claims.
- Evidence-grade biological/health claims.
- Do not present the "entourage effect" as settled fact.
- Track chemical class, formula, molecular mass, boiling point only when source/method context is available, aroma descriptors, occurrence, biosynthesis, analytical method, and evidence grade.
- Treat cultivar/strain terpene percentages as lab-specific observations, not permanent strain constants.

## Evidence grading

Suggested UI labels:
- A — replicated peer-reviewed cannabis-specific evidence
- B — peer-reviewed cannabis evidence with limited cultivars/conditions
- C — established controlled-environment horticulture/plant-science evidence
- D — preliminary, indirect, observational, or mechanistic evidence
- Grower heuristic — practical convention not established as a scientific optimum

## Next source areas to maintain

- leaf-temperature measurement and infrared-emissivity guidance
- irrigation/dryback and substrate water-content research
- root-zone oxygen/dissolved oxygen
- alkalinity/acidity and irrigation-water chemistry
- cannabis tissue-analysis sufficiency ranges
- pest/pathogen image references and extension diagnostic keys
- post-harvest temperature/RH/water-activity literature
- CO2 x PPFD x temperature interaction studies
- spectral response and far-red research
- measurement uncertainty/calibration references for PAR, pH, EC, RH, temperature, and substrate sensors


## Ownership and maintenance

This registry is the cross-tool evidence governance reference for the canonical cultivation tools repository.

- New tool evidence and source-policy changes originate in `dtfgenetics/Tools`.
- Diagnostic-specific evidence remains authoritative in `dtfgenetics/Thc-dataset`.
- General education/encyclopedia claims remain authoritative in `dtfgenetics/thc-grow-hub`.
- Certification evidence remains authoritative in `dtfgenetics/Thc-learning-courses-`.
- Deployment mirrors in `dtfgenetics/Thc` must not become competing editable copies of this registry.

When a tool needs a claim-specific citation registry or structured machine-readable source set, place that data beside the canonical tool and keep this document as the shared evidence-policy/index layer rather than duplicating the same source list across multiple repositories.
