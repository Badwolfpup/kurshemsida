# kurshemsida — Project Rules

## Architecture Reference
- `.claude/PROJECT_CONTEXT.md` — full architecture, tech stack, patterns, domain models
- `.claude/PAGE_MAP.md` — per-page, per-role functionality breakdown
- `.claude/INTENT.md` — organizational purpose, who we serve, guiding principles for design decisions
- After completing implementation that changes architecture, endpoints, models, routes, or page behavior, check if these files need updating.

## Pull Requests & Changelog
- **Never push directly to main** — all changes must go through a PR. Create a branch, push it, and use `/makepr` or `gh pr create`
- Kursserver PRs are handled by the user — do not create PRs for that repo
- After any implementation (even quick edits that don't go through `/makepr`), update `CHANGELOG.md` under `## [Unreleased]`, grouped by feature area

## SCENARIO Comments & Static Trace
- After implementing a feature, add SCENARIO comments to every hook and endpoint that was added or modified. See comment convention in `.claude/PROJECT_CONTEXT.md`.
- **Plan mode**: After adding comments, automatically run `/static-trace` on every changed feature. Always show the full PASS/FAIL report.
- **Quick edits**: After finishing, if any logic changed (hooks, endpoints, service methods), ask if user wants to run `/static-trace`. Skip for CSS, copy, config, and cosmetic changes.

## Unit Tests
- After implementing a feature, invoke the `unit-test` skill. It will scan changed code, identify testable logic, write tests, and run 3 independent reviewers.
- **Quick edits**: If the change is CSS, copy, config, or cosmetic — skip. Otherwise, invoke the skill.
