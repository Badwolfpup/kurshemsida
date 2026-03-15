# Changelog

Draft and commit a changelog entry for the current branch.

## Instructions

1. Run `git diff origin/main...HEAD` (or `git diff HEAD` if no remote) to read all changes in this branch.

2. Based on the diff, draft three role-based changelog summaries as bullet point strings:
   - **admin**: Detailed summary of all changes — functional, UI, and under-the-hood. Written for Admin/Teachers who want the full picture.
   - **coach**: Only functional changes that affect how coaches use the system. No UI tweaks, no internal refactors, no server-side only changes.
   - **student**: Same principle as coach — only functional changes visible to students.

   Each entry should be a short, plain-language sentence in **Swedish** (e.g. "Coacher kan nu föreslå mötestider utanför lärarens tillgänglighet."). Do not use developer jargon.

3. Present the three lists to the user for review:
   ```
   **Admin/Teachers:**
   - ...

   **Coaches:**
   - ...

   **Students:**
   - ...
   ```

4. Ask the user: "Are these changelog summaries correct? Edit or confirm to continue." Wait for confirmation or edits before proceeding.

5. Once confirmed, determine today's date (YYYY-MM-DD) and the current branch name. Write the file as `src/changelogs/<YYYY-MM-DD>-<branch-slug>.json` where `<branch-slug>` is the branch name with slashes replaced by dashes (e.g. `feat/my-feature` → `feat-my-feature`). The file content:
   ```json
   {
     "displaydate": null,
     "entries": {
       "admin": ["..."],
       "coach": ["..."],
       "student": ["..."]
     }
   }
   ```
   Use the confirmed bullet points as the arrays. If a role's list is empty, use `[]`.

6. Stage the file: `git add src/changelogs/<filename>.json`

7. Commit it: `git commit -m "chore: add changelog entry"`
