# Fork foundation change record

Started: 2026-09-08. Remote verification: 2026-09-09.

Base: `gotalab/cc-sdd@29aee950f4addc36f9aeecb9881c46540e71ecc9`, identical to
`nobitalqs/cc-sdd:main` when this work started.

## Goal and boundary

Establish a reviewable maintenance foundation for this fork before changing
workflow prompts. One repository-maintenance change owns root/package README
notices, this guide/record, `.github/workflows/`, and the package validation
script/command. No installed skill, template, CLI implementation, dependency,
version, or existing spec changes are intended. A verbatim copy of the root
LICENSE is added to the package so npm includes the original notice.

## Observed evidence and decisions

- The inherited repository has publish, Claude, and stale-issue workflows but
  no independent PR build/test workflow.
- Its `main` ruleset requires PRs and prevents deletion/non-fast-forward pushes,
  but has no required CI checks.
- Existing tests call source APIs; an unpacked production CLI needs an additional
  check to catch omitted build outputs or templates.
- The package directory has no LICENSE. Include the root license verbatim and
  check that it reaches the packed installation without changing its terms.
- Both Codex and Claude Code are primary clients. Test their actual packed
  installations in English and Chinese without starting paid agent runs.
- Keep package identity and workflow behavior unchanged. Limit inherited
  upstream automation by repository identity rather than replacing its logic.
- Existing loop experiments remain separate and are not merged or deleted.

## Acceptance and validation

| Acceptance | Evidence |
| --- | --- |
| Reproducible dependency install and build | Local Node 24.14.1 / npm 11.17.0 passed; clean Linux CI installs/builds passed on Node 22 and 24 |
| Existing unit/manifest tests remain green | 39 files / 193 tests passed locally |
| Built tarball installs all primary-client assets | Codex and Claude Code, each en/zh: 4/4 passed; packed LICENSE matches root |
| Missing packaged assets fail validation | Disposable copies missing CLI, Codex kiro-impl, a shared rule, or LICENSE: 4/4 rejected |
| Fork cannot run inherited write/publish jobs | Explicit repository conditions; actionlint 1.7.12 passed all workflows |
| PR has Linux Node 22/24 checks | Both jobs passed in [run 34299363051](https://github.com/nobitalqs/cc-sdd/actions/runs/34299363051) against implementation commit `c4a0e5b` |
| Required checks added without weakening existing rules | Ruleset `protect-main` / `20836014` read back: both checks required from GitHub Actions, strict up-to-date policy; all prior rules/conditions/bypass settings preserved |

Commands: `npm ci --ignore-scripts --no-audit --no-fund`, `npm run build`,
`npm test`, and `npm run test:package`, from `tools/cc-sdd`.

The initial local install ran ordinary `npm ci --no-audit --no-fund` and its
existing prepare/build script. CI deliberately installs with `--ignore-scripts`
then builds explicitly. Negative checks copied the package inputs into disposable
directories, removed one asset per copy, and required the real `test:package`
command to fail for that asset. They did not modify the source checkout.

The first remote run also passed 193 tests and all four packed-install cases in
each Node job. [Issue #3](https://github.com/nobitalqs/cc-sdd/issues/3) tracks this
work; [Draft PR #4](https://github.com/nobitalqs/cc-sdd/pull/4) carries the code and
this record. Its current-head checks remain authoritative after documentation
updates; the linked initial run is evidence for the unchanged implementation.

## Limits and rollback

This foundation verifies packaging, not agent behavior or improved designs.
No Windows/macOS runtime evidence, npm publication, GitLab migration, or merge
is included. Future changes to package contents, client layouts, Node support,
or workflows require renewed applicable checks.

Rollback is a revert of this maintenance change. Before removing or renaming
required CI jobs, adjust the repository ruleset so new PRs cannot be left waiting
for checks that no longer exist. Do not reset shared branches or delete old work.
