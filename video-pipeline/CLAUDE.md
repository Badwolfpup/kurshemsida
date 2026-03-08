# video-pipeline

Automated help video generator for the kurshemsida school management platform. Produces narrated .mp4 screencasts from JSON walkthrough definitions.

## Stack
- **Playwright** (Node.js) for browser automation + video recording
- **edge-tts** (`python -m edge_tts`, voice `sv-SE-SofieNeural`) for Swedish TTS
- **FFmpeg** for merging video + positioned audio clips

## Usage
```bash
# Single walkthrough
node pipeline.js walkthroughs/student-01-projekt.json

# Flags
node pipeline.js walkthroughs/foo.json --skip-tts --skip-record
```

## Walkthrough JSON Format
```json
{
  "title": "Display name",
  "role": "student|coach|teacher",
  "startUrl": "http://localhost:5173/page",
  "outputName": "filename-without-extension",
  "steps": [
    { "id": 1, "action": "screenshot_pause", "narration": "Swedish text", "pauseMs": 3000 }
  ]
}
```

## Available Step Actions
| Action | Fields | Notes |
|---|---|---|
| `screenshot_pause` | `narration`, `pauseMs` | Just waits while video records. Most common action. |
| `click` | `selector`, `narration`, `pauseMs` | Clicks an element |
| `fill` | `selector`, `value`, `narration`, `pauseMs` | Types into an input |
| `select` | `selector`, `option`, `narration`, `pauseMs` | Two-step: clicks trigger, then clicks option |
| `scroll` | `narration`, `pauseMs` | Scrolls down 400px |
| `hover` | `selector`, `narration`, `pauseMs` | Hovers over element |
| `press` | `selector`, `key`, `narration`, `pauseMs` | Presses a keyboard key |
| `wait_for` | `selector`, `waitMs`, `narration`, `pauseMs` | Waits for element to appear |
| `navigate` | `url`, `narration`, `pauseMs` | Navigates to a URL |
| `evaluate` | `script`, `narration`, `pauseMs` | Runs arbitrary JS in page context |

## Login Credentials (dev mode)
- `student` -> `test.elev@gmail.com`
- `coach` -> `coachen@hudiksvall.se`
- `teacher` -> `teacher@hudiksvall.se`

Passcode is auto-filled in dev mode. The recorder handles login automatically via a separate browser context (no login in the recorded video).

## Lessons Learned

### Selectors for shadcn/ui (Radix)
- `SelectTrigger` renders as `button[role='combobox']` -- use `:near(:text('Label'))` to target specific ones
- `SelectItem` renders as `[role='option']` -- use `:has-text('Value')`
- `TabsTrigger` renders as `button[role='tab']` -- use `:has-text('Tab Name')`
- Dialogs render with `[role='dialog']`
- Example select step: `{ "selector": "button[role='combobox']:near(:text('Ämne'))", "option": "[role='option']:has-text('Loops')" }`

### Avoid Long Async Waits
- Don't rely on `wait_for` for AI-generated content (API calls can take 2+ min or fail entirely)
- Instead: show the form, click Generate briefly to show loading state, then switch to the "Sparade" tab to demo pre-existing saved data
- This makes videos reliable and repeatable

### Calendar / Date-Dependent UI
- React Big Calendar events render as `.rbc-event` divs
- `handleSelectEvent` may block past events from opening dialogs (e.g. `isBefore` guard)
- If no future availability exists, clicks on calendar events will silently fail
- Workaround: use "Foreslaa moete" or similar buttons that don't depend on calendar data, or narrate the flow with `screenshot_pause` steps

### ChangelogDialog Suppression
- The app auto-opens a ChangelogDialog on login
- The recorder suppresses it by setting `localStorage.setItem("changelog_last_seen", ...)` before recording
- If a dialog still appears, the recorder tries `Escape` to dismiss overlays

### Audio File Caching
- TTS skips regeneration if the .mp3 file already exists
- To re-record narration for specific steps, delete the corresponding `output/audio/{outputName}-step-{id}.mp3` files
- To re-run specific walkthroughs, see `run-fixes3.js` as a template for batch re-runs with audio cleanup

### General Tips
- `pauseMs` should be at least as long as the narration audio; the recorder uses `Math.max(pauseMs, audioDuration)`
- Keep `screenshot_pause` steps for 3-5 seconds -- enough time for narration without dragging
- Use `screenshot_pause` to narrate UI that you can't reliably interact with (calendar views, complex layouts)
- The two-context recording approach (login context -> recording context) keeps login flow out of the final video
- FFmpeg merge uses `adelay` to position each audio clip at the correct timestamp
- Output is 1920x1080 MP4 (`libx264` + `aac`)

## Output Structure
```
output/
  audio/     # TTS .mp3 files per step + durations JSON
  video/     # Raw .webm recordings from Playwright
  final/     # Merged .mp4 files (final output)
```
