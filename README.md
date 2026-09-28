# DTF Genetics — Cultivation Tools

Canonical source for the DTFSeeds / Teaching Healthy Cultivation interactive tool suite.

Public tools: Living Plant Atlas, Terpene Atlas, pH Reference, TDS/EC Reference, VPD Chart, PPFD/DLI Light Lab, and the Tools hub.

The deploy-compatible tree remains under `site/public-route-patch/` so dtfseeds.com can consume it without changing public URLs.

**Repository rule:** new tool features, fixes, datasets, shared UI runtime changes, and cultivation math changes originate in `dtfgenetics/Tools`. `dtfgenetics/Thc` is the website/education integration and deployment repository; its copies are deployment mirrors.

Run `npm test` for deterministic validation. Playwright is not used.
