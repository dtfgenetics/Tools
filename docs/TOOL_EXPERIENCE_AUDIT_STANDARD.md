# Tool Experience Audit Standard

Last reviewed: 2026-09-29

This standard complements the competitive feature validator. Feature presence alone is not enough: every canonical tool route must remain understandable, responsive, accessible, evidence-aware, and visually useful.

## Blocking structural gate

Every canonical route must keep:

- document language
- descriptive page title
- mobile viewport metadata
- useful meta description
- canonical URL
- a primary H1
- a main content landmark

Run:

`npm run audit:experience`

The command exits nonzero for structural regressions.

## Quality signals tracked as warnings

The audit also reports, without blocking releases yet:

- aria-live feedback on interactive tools
- form-label presence
- charts, diagrams, images, heatmaps, 3D, or other visual explanation signals
- explicit Teaching Healthy Cultivation / educational context
- explicit scope, uncertainty, or limitation language
- persistence/history
- export/backup/print pathways
- GrowLens workflow bridges

Warnings are intentionally non-blocking while the scientific visual backlog is being completed. Once a signal is consistently present across the relevant tool family, promote it to a release gate.

## Firecrawl competitive findings — 2026-09-29

Live-page review showed that DTF's strongest differentiation is the combination of transparent math, measurement context, education, persistence, cross-tool handoffs, and free browser workflows. The main remaining parity gaps are:

1. authenticated hardware/provider integrations and remote notifications versus commercial monitoring platforms;
2. richer scientific visuals across non-Atlas tools;
3. deeper chemistry visualization/download formats in Terpene Atlas;
4. progressive disclosure so advanced capabilities do not overwhelm first-time users.

The audit exists to keep those product-quality dimensions visible while the implementation evolves.
