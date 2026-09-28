# Tool migration provenance

`dtfgenetics/Tools` is the canonical source of truth for the DTFSeeds cultivation-tool suite.

## Historical source commit

`migration/source-commit.txt` records the THC integration commit used as the historical migration/extraction reference when the canonical Tools repository was established. It is **not** a live synchronization pointer and should not be updated after every deployment mirror sync.

Current synchronization state is verified structurally and by content parity:

- canonical ownership is defined by `migration/manifest.json`
- Tools repository integrity is enforced by the canonical ownership guard
- THC integration parity is enforced by its canonical tool mirror guard
- deployment copies in `dtfgenetics/Thc` remain mirrors only

Do not infer current deployment freshness from `source-commit.txt`. Use the repository CI/parity checks instead.
