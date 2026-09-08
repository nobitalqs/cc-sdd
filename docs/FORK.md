# Maintaining this fork

This is the `nobitalqs/cc-sdd` fork of [gotalab/cc-sdd](https://github.com/gotalab/cc-sdd).
The starting point is upstream commit `29aee950f4addc36f9aeecb9881c46540e71ecc9`.
It includes changes after release `v3.0.2`; the package's `3.0.2` version alone does
not identify that source baseline. Preserve upstream history and its MIT license.

## Purpose and current scope

Use spec-driven development for substantial features and system changes. Codex
and Claude Code are both primary clients. Start from upstream behavior and
evaluate each proposed improvement against that baseline. Previous local
customizations are hypotheses, not requirements to port.

The foundation adds repository validation and maintenance instructions only.
It does not change installed skills, templates, approval semantics, task
execution, or agent dispatch. Separate bugfix profiles, additional metadata
protocols, project-specific policy, and external supervisory loops are not part
of this fork's initial improvement plan. Other upstream clients remain present;
the new package smoke checks specifically exercise the two primary clients.

Design quality is the next evaluation topic. Changes to task granularity,
delegation, or parallel execution belong in later, separately reviewable work.
Do not assume shorter prompts or more agents improve results without evidence.

## Local setup and branches

Clone this fork into a new directory. Do not install the generated skills into
the source checkout or connect personal configuration through shared symlinks.

```bash
git clone https://github.com/nobitalqs/cc-sdd.git
cd cc-sdd
git remote add upstream https://github.com/gotalab/cc-sdd.git
git config remote.pushDefault origin
git config push.default simple
git config pull.ff only
gh repo set-default nobitalqs/cc-sdd
git fetch upstream
```

`origin` is this fork; `upstream` is the original project. `upstream/main` is a
remote-tracking reference, not an additional local development branch. Keep
`main` as this fork's stable integration branch. Work on short topic branches
such as `liquanshan/design-template`. For concurrent work, use separate worktrees:

```bash
git worktree add -b liquanshan/design-template ../cc-sdd-worktrees/design-template main
```

Check the worktree and branch before editing. Commit explicit files, keep each
change independently understandable, and open PRs against **this fork's** `main`.
Retain old experimental branches and PRs until an explicit archival decision.
Repository-maintenance changes may use a short change record under
`docs/maintenance/`; this does not introduce another installed spec profile.

## Validation

From `tools/cc-sdd`, using Node.js 22 or 24:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm test
npm run test:package
```

`npm test` runs the existing Vitest suite, including source-level manifest and
renderer checks. `test:package` packs the built package, installs the tarball in
a temporary directory outside the checkout with lifecycle scripts disabled,
and invokes that installed CLI. It checks all 17 skills, declared shared rules,
spec templates, and client documents for Codex and Claude Code, each in English
and Chinese. The packed license must match the original root LICENSE verbatim.
Temporary files are removed even on failure.

These are deterministic build and installation checks. They do not run Codex
or Claude models and do not establish prompt quality or feature completion.
For workflow changes, compare upstream and candidate on the same representative
inputs separately in both clients. Record model/client versions, correctness,
missing requirements, human corrections, elapsed time, and usage. Keep project
data and private execution logs out of the public repository.

The CI matrix covers Linux with Node.js 22 and 24. Windows and macOS runtime
acceptance is not claimed by this matrix. Checks run on every PR, pushes to
`main`, and manual dispatch; documentation-only PRs still produce required checks.

## Pull requests and automation

Use a Draft PR while checks or the scope are unsettled. Explain the problem,
resulting behavior, and validation. Once the new CI has succeeded, require
`Validate (Node 22)` and `Validate (Node 24)` for `main`. Preserve its existing
PR requirement and restrictions against deletion and force-push. A solo
maintainer need not require another human approver; add that rule when there
are active collaborators. AI review is evidence, not a substitute GitHub identity.

Actions in the new CI use full commit SHA pins and a read-only repository token.
When updating a pin, verify its official release and rerun the same checks.
The inherited publish, Claude dispatch/comment, and stale-issue jobs are limited
to `gotalab/cc-sdd`. They do not publish packages, start agents, or close issues
in this fork. A future release process requires its own package identity and
credentials; retain the upstream package name/version during this bootstrap.

Ordinary topic PRs can be squash-merged. Do not squash an upstream synchronization:
preserve the upstream commits as ancestors so future merges have the right base.
Do not rebase or force-push the shared `main` branch.

## Updating from upstream

Start from a clean, current local `main`, fetch upstream, and create a sync branch:

```bash
git switch main
git pull --ff-only origin main
git fetch upstream
git switch -c liquanshan/sync-upstream
git merge upstream/main
```

Resolve conflicts deliberately, inspect changed workflows as well as templates,
run validation, and open a PR into this fork. Use a merge commit for that PR.
Avoid `gh repo sync --force`, which can replace divergent fork work. Syncing and
merging locally does not publish changes until the branch is pushed.

## Distribution and future GitLab use

No separate npm release exists yet. `npx cc-sdd@latest` fetches the upstream
package. To try this fork now, build and pack it locally, then install the
tarball into a disposable test project. Do not use a live project for installer
experiments. Future fork releases must have distinguishable tags and record the
upstream base; never move existing release tags.

GitHub is the current development authority. A future internal GitLab copy
should initially consume selected validated commits or tags in one direction.
If team development later moves to GitLab, explicitly change the authority and
select public changes for GitHub rather than writing the same branch independently
on both hosts. Git carries commits, branches, and tags; issues, PRs, comments,
and release metadata need a separate platform import. GitHub Actions configuration
does not itself create a GitLab pipeline.

## References

- [GitHub: configure a fork remote](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/configuring-a-remote-repository-for-a-fork)
- [GitHub: sync a fork](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/syncing-a-fork)
- [GitHub: protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub: secure use of Actions](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitLab: repository mirroring](https://docs.gitlab.com/user/project/repository/mirror/)
