# kurshemsida — Project Rules

## Pull Requests & Changelog
- Frontend PRs are created via `/makepr` — do not manually push or create PRs
- Kursserver PRs are handled by the user — do not create PRs for that repo
- After any implementation (even quick edits that don't go through `/makepr`), update `CHANGELOG.md` under `## [Unreleased]`, grouped by feature area

## SCENARIO Comments & Static Trace
- After implementing a feature, add SCENARIO comments to every hook and endpoint that was added or modified. See comment convention in MEMORY.md.
- **Plan mode**: After adding comments, automatically run `/static-trace` on every changed feature. Always show the full PASS/FAIL report.
- **Quick edits**: After finishing, if any logic changed (hooks, endpoints, service methods), ask if user wants to run `/static-trace`. Skip for CSS, copy, config, and cosmetic changes.

## Unit Tests
- After implementing a feature, check if any modified or new logic is covered by a unit test in `src/__tests__/`.
- **If you modified a tested function**: update the existing test(s) to reflect the change.
- **If you added new testable logic** (pure functions, data transformations, calculations, reducers): add unit tests for it.
- **Testable logic** means: pure functions, data transformations, sort/filter helpers, reducers, date calculations. It does NOT mean React Query hooks, HTTP service methods, or component rendering.
- Run `npm run test` after writing or changing tests to confirm all pass.
- **Quick edits**: If the change is CSS, copy, config, or cosmetic — skip. Otherwise, check whether tests need updating.
