# kurshemsida — Project Rules

## Pull Requests & Changelog
- Frontend PRs are created via `/makepr` — do not manually push or create PRs
- Kursserver PRs are handled by the user — do not create PRs for that repo
- After any implementation (even quick edits that don't go through `/makepr`), update `CHANGELOG.md` under `## [Unreleased]`, grouped by feature area

## SCENARIO Comments & Static Trace
- After implementing a feature, add SCENARIO comments to every hook and endpoint that was added or modified. See comment convention in MEMORY.md.
- **Plan mode**: After adding comments, automatically run `/static-trace` on every changed feature. Always show the full PASS/FAIL report.
- **Quick edits**: After finishing, if any logic changed (hooks, endpoints, service methods), ask if user wants to run `/static-trace`. Skip for CSS, copy, config, and cosmetic changes.
