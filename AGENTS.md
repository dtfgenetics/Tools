# AGENTS.md

## Purpose

This repository is the canonical source for DTF Genetics cultivation tools. Treat `dtfgenetics/Tools` as the authoring source for tool implementations, shared cultivation-tool UI/runtime code, cultivation math, tool-owned datasets, persistence contracts, and tool validation.

## Repository ownership

- Author new cultivation-tool features and fixes here first.
- `dtfgenetics/Thc` may contain deployment/integration mirrors of tool assets, but it is not an alternate authoring source.
- Never overwrite this repository from a mirror in `dtfgenetics/Thc`.
- Do not duplicate a tool into another DTF repository when it can be implemented or extended here.
- Preserve the canonical `thc-cultivation-record@1` shared data contract unless an intentional versioned migration is implemented and validated.

## Required validation

Before proposing or merging changes:

1. Use Node.js 20 or newer.
2. Run `npm test`.
3. For cultivation-math changes, also run `npm run test:math`.
4. For experience/UI work, run `npm run audit:experience`.
5. For changes that affect live/public behavior, run `npm run verify:live` when the required live environment is available.
6. Do not weaken or bypass `validate-repo-boundaries.mjs`, `validate-owned-references.mjs`, or migration ownership checks to make a change pass.

Validation should stay deterministic. Do not add Playwright as a required repository gate unless the repository standard is deliberately changed.

## Change discipline

- Fix root causes instead of adding parallel implementations.
- Reuse shared cores, storage primitives, chart systems, telemetry adapters, and export/backup utilities where they already exist.
- Delete dead or superseded code only after confirming the active replacement is validated and no owned reference depends on it.
- Keep migration records accurate when ownership or public-route integration changes.
- Avoid generated or vendored payloads in source control unless they are required inputs or verified release artifacts.
- Keep user-visible units, terminology, formulas, and scientific reference data consistent across tools.

## Cross-repository work

When a tool change must be integrated into the public site:

1. Finish and validate the canonical change here.
2. Update the migration/integration manifest as required.
3. Sync the validated deploy-compatible output into the website/deployment repository.
4. Verify the mirror matches the canonical source.
5. Do not hand-edit the mirror as the permanent fix.

## Safety for cleanup

When cleaning this repository, prefer removal of duplicate, unreachable, generated, or superseded implementation code over preserving active-tree clutter. Preserve useful provenance through Git history and explicit migration/retirement records rather than keeping obsolete runtime copies active.
## Parallel chat/session contract

New concurrent work must use a unique session branch:

`work/<project-id>/<task>/<session-id>`

Do not let separate chats or agents share one mutable branch, even when they are working on the same tool. A session may continue only when it explicitly resumes that exact branch/PR.

For normal tool work:
- create the session from current `main`;
- keep edits inside the canonical tool/resource being changed;
- run the focused validator for that tool when one exists, then `npm test` before merge;
- push one PR for the session;
- resolve same-file/same-resource conflicts only at integration;
- after merge, hand off the exact canonical commit to `dtfgenetics/Thc` through the version-pinned mirror process.

Do not hand-edit the `Thc` mirror as a substitute for canonical work here.
