# kurshemsida — Project Context

## Project Overview
- School management platform: frontend (React/TypeScript) + backend (ASP.NET Core C#)
- Two repos: `kurshemsida` (frontend) and `Kursserver` (backend)
- Roles: Admin, Teacher, Coach, Student (students temporarily disabled — cannot log in, see MEMORY.md)
- ~14k lines of TypeScript across 137 files (as of 2026-02-23)

## Tech Stack
- **Framework:** React 19 + TypeScript 5.9
- **Build:** Vite 7 with SWC (`npm run build` = `tsc -b && vite build`)
- **Styling:** Tailwind CSS 3.4 + shadcn/ui (50+ Radix-based components in `src/components/ui/`)
- **State:** TanStack React Query v5 (no Redux/Zustand)
- **Router:** React Router v7 (BrowserRouter)
- **Editor:** Monaco (CodeEditor.tsx for HTML/CSS/JS exercises/projects)
- **Toasts:** Sonner + shadcn/ui Toaster
- **Dark mode:** next-themes (class-based toggle)
- **Testing:** Vitest (Node environment)
- **Path alias:** `@/` → `./src/`
- **Fonts:** Inter (body), Space Grotesk (headings)
- **Colors:** Primary blue (215 85% 45%), Accent cyan (195 85% 42%), CSS variables in `index.css`

## Directory Structure
```
src/
  api/            # Service layer — one file per domain (raw fetch calls)
  components/
    ui/           # shadcn/ui primitives (50+ components)
    admin/        # Admin-only components (AdminSchedule, AdminUsers, etc.)
    calendar/     # Calendar/booking UI (FourDayView, dialogs, calendarUtils)
    messaging/    # Chat thread components (ThreadList, ChatThread, StudentContextChat)
    deltagare/    # Participant list/detail
  contexts/       # AuthContext (single context — user, role, login/logout)
  hooks/          # React Query hooks (useProjects, useBookings, useMessages, etc.)
  pages/          # Route page components
  Types/          # TypeScript interfaces
    Dto/          # Mutation DTOs (AddProjectDto, UpdateUserDto, etc.)
  utils/          # imageUtils, toastMessage
  lib/            # cn() utility (tailwind-merge + clsx)
  helptext/       # Swedish help content + video URLs
  changelogs/     # Release notes JSON files
  assets/         # Images + styles
  __tests__/      # Vitest tests (mirrors src/ structure)
```

## Feature Wiring Pattern
A typical feature follows: **Page → Hook → Service → API**

1. **Page** (`pages/Foo.tsx`) renders UI, calls hooks
2. **Hook** (`hooks/useFoo.ts`) wraps `useQuery`/`useMutation` with query keys and cache invalidation
3. **Service** (`api/FooService.ts`) makes `fetch()` calls with `credentials: 'include'`
4. **Backend** responds; hook's `onSuccess` invalidates relevant query keys

Example:
```
Projekt.tsx → useAddProject() → projectService.addProject(dto) → POST /api/add-project
  onSuccess → invalidateQueries(['projects']) → useProjectHistory() refetches
```

## Authentication
- JWT stored in HttpOnly cookie (set by backend, never touched by frontend)
- All requests use `credentials: 'include'`
- `AuthContext` provides user, role, login/logout
- On 401: hard redirect to `/login` via `responseAction()` in services
- Role hierarchy: Admin (1), Teacher (2), Coach (3), Student (4), Guest (5)
- Admin and Teacher are treated identically (`isAdmin = role === "Admin" || role === "Teacher"`)
- `useUserRole()` hook derives `isAdmin`, `isCoach`, `isStudent` booleans

## API Communication
- Base URL: relative (proxied to `https://localhost:5001` in dev via Vite config)
- All services use raw `fetch()` — no axios
- Response pattern: `responseAction(response)` checks 401 → redirect, !ok → throw
- Booking conflicts return 409 with conflict data for user decision
- Auth token: HttpOnly cookie, auto-sent via `credentials: 'include'`

## Query Patterns
- Query keys: `['projects']`, `['bookings']`, `['threads']`, `['unreadCount']`, `['availabilities']`, `['busyTimes']`, `['seating', classroomId, dayOfWeek]`, etc.
- Mutations invalidate parent query on success
- Messaging uses `refetchInterval: 10_000` for polling
- Stale time varies: 5min for projects, 30s for bookings

## Key Shared Components
- `AppLayout` — flex container (sidebar + topnav + content)
- `AppSidebar` — collapsible nav, role-based menu items, unread badges
- `TopNav` — header with hamburger, chat icon, profile avatar
- `ProtectedRoute` — route guard checking `allow="admin"` or `allow="student"`
- `CardDialog` — generic add/edit form dialog
- `CodeEditor` — Monaco wrapper for exercise/project code

## Routing (App.tsx)
Auth-based conditional rendering: not logged in → Login (except public routes like `/kodsidor`), guest → Homepage + public routes, logged in → full app with AppLayout.

| Path | Component | Guard |
|------|-----------|-------|
| `/` | Index | — |
| `/kodsidor` | Kodsidor | — (public, accessible without login) |
| `/login` | Login | Redirects if logged in |
| `/projekt` | Projekt | — |
| `/ovningar` | Ovningar | — |
| `/portfolio` | Portfolio | — |
| `/meddelanden` | MeddelandenPage | — |
| `/deltagare` | Deltagare | allow="admin" |
| `/preferenser` | Preferenser | — |
| `/admin` | Admin | allow="admin" |
| `/admin-schedule` | AdminSchedule | allow="admin" |
| `/deltagarschema` | StudentSchedule | allow="admin" |
| `/klassrum` | Klassrum | allow="admin" |
| `/student-calendar` | StudentCalendar | allow="student" |
| `/mina-deltagare` | CoachMyParticipants | — |
| `/kontakt` | CoachContact | — |
| `/coach-installningar` | CoachSettings | — |
| `/coach-projekt` | CoachProjects | — |
| `/coach-booking` | CoachBookingView | — |
| `/terminal` | Terminal | — |

See `.claude/PAGE_MAP.md` for detailed per-page, per-role functionality breakdown.

## Naming Conventions
- Pages: PascalCase (`Projekt.tsx`, `Ovningar.tsx`)
- Components: PascalCase (`AppLayout.tsx`, `CardDialog.tsx`)
- Hooks: `use` prefix, camelCase (`useProjects`, `useBookings`)
- Services: PascalCase with `Service` suffix (`BookingService.ts`)
- Types: PascalCase with `Type` suffix (`ProjectType`, `ExerciseType`)
- DTOs: PascalCase with `Dto` suffix (`AddProjectDto`, `UpdateUserDto`)

## Domain Entities

| Entity | Key Fields |
|--------|-----------|
| User | id, firstName, lastName, email, authLevel, coachId, schedule bools, emailNotifications |
| Project | id, title, description, html, css, js, difficulty, projectType |
| Exercise | id, title, description, js, expectedResult, difficulty, exerciseType, clues |
| Booking | id, adminId, coachId, studentId, startTime, endTime, status, meetingType, note, seen, reason, rescheduledBy, createdByRole |
| BusyTime | id, adminId, startTime, endTime, note |
| SeatingAssignment | id, classroomId, dayOfWeek, period (am/pm), row, column, studentId |
| Thread | id, user1Id, user2Id, studentContextId |
| Message | id, threadId, senderId, content, createdAt |
| Availability | id, adminId, startTime, endTime, isBooked |
| RecurringEvent | id, name, weekday, startTime, endTime, frequency, adminId |
| Permission | id, userId, html, css, js, variables, conditionals, loops, functions, arrays, objects (all bool) |
| ExerciseHistory | id, userId, topic, language, difficulty, title, solution, asserts, isCompleted, feedback fields |
| ProjectHistory | id, userId, techStack, difficulty, title, starterHtml, solutionHtml/Css/Js, isCompleted, feedback fields |

## Messaging System
- **Replaced** the old ticket/arende system with persistent 1-on-1 chat threads
- Page: `src/pages/MeddelandenPage.tsx` — single page for all roles at `/meddelanden`
  - Admin: two tabs (Deltagare | Coacher), shows all active users including those without existing threads ("virtual threads" with negative IDs)
  - Coach: flat list of direct threads (admins/teachers + students)
  - Student: flat list of direct threads (admins/teachers + coach)
- Components: `src/components/messaging/` — `ThreadList`, `ChatThread`, `StudentContextChat`
- `StudentContextChat`: about-student threads shown in Deltagare/Mina deltagare views (not on Meddelanden page). Matches thread by `studentContextId` only (threads are shared across all admins/teachers).
- Student-context thread visibility: admins/teachers see ALL student-context threads (not just their own). Backend `ApplyThreadVisibilityFilter` restricts coaches to their own students only.
- Sidebar badge split: `useUnreadCounts()` derives from `useThreads()` data to split unread counts — `messagesCount` (direct) on "Meddelanden", `studentContextCount` on "Deltagare"/"Mina deltagare". Also exposes `unreadStudentIds: Set<number>` for per-participant red dots.
- Thread model: `User1Id < User2Id` enforced for uniqueness, `StudentContextId` nullable (null = direct, N = about-student)
- Unique constraint uses computed column: `COALESCE(StudentContextId, 0)` for SQL Server null uniqueness
- Lazy thread creation on first message via `POST /api/messages`
- 10-second polling (`refetchInterval`) on threads and messages for near-real-time updates
- Email notifications on new messages (respects `EmailNotifications` flag, skipped in dev)

## Calendar System
- Shared components in `src/components/calendar/`: `CalendarShell`, `FourDayView`, `BookingDetailsDialog`, `RecurringEventDialog`, `RecurringEventClickDialog`, `calendarUtils`
- Admin-specific: `src/components/admin/AdminSchedule.tsx`, `AdminBookingDialog.tsx`
- Coach: `src/pages/CoachBookingView.tsx`
- All calendars use React Query hooks: `useBookings`, `useAvailabilities`, `useRecurringEvents`, `useNoClasses` (in `src/hooks/`)
- Booking API via `src/api/BookingService.ts` — endpoints: `/api/bookings`, `/api/availability`, `/api/busy-time`
- `RecurringEventService.ts` handles `/api/recurring-events` CRUD + exceptions
- `calendarUtils.ts` exports: `getFreeSegments`, `getAdminColorMap`, `ALL_TIME_OPTIONS`, `padTime`, `STATUS_COLORS`, `RECURRING_EVENT_COLOR`, `BUSY_TIME_COLOR`, plus `WORKDAY_*` constants (08:30–14:30)
- **Booking flow is approval-based**: every new booking starts `Status=Pending`. The non-creator (admin or coach) approves. There is no auto-accept path.
- **Conflict model**: overlap with an `Accepted` booking → 409 hard block (shown as toast). Overlaps with pending bookings, busy time, or recurring events never block at the backend — they coexist freely. Coaches see frontend-only warnings when clicking on busy/recurring cells before the suggestion dialog opens.
- **Availability is decorative**: `AdminAvailability` rows are rectangles painted on the admin's calendar to signal preferred times. They do NOT gate bookings. `Booking` no longer has an `AdminAvailabilityId` FK.
- **Busy time is no-consideration**: creating or updating a busy block does not check or cancel existing bookings. Admin resolves visual overlaps manually.
- **Reschedule returns to Pending**: a reschedule sets `Status=Pending` + `RescheduledBy=Admin|Coach`. The presence of `RescheduledBy` is what the UI uses to render "Ombokning – svar krävs".
- **Domain enums** (stored as PascalCase strings in DB via EF `HasConversion<string>()`):
  - `BookingStatus`: `Pending | Accepted | Declined`
  - `MeetingType`: `Intro | Followup | Other`
  - `BookingActor` (reused for `CreatedByRole` and `RescheduledBy`): `Admin | Coach`
  - `RecurringFrequency`: `Weekly | Biweekly`
  - Frontend types match in `src/Types/CalendarTypes.ts` as TS string unions.
- **Coach calendar UX**: single-select teacher dropdown (`ToggleGroup type="single"`, defaults to first alphabetical admin). Clicking anywhere in the calendar opens the suggestion dialog. Coaches see own bookings (all statuses) + other coaches' `Accepted` bookings masked as opaque "Upptagen" blocks (no identity leaked). Other coaches' pending bookings are not visible.
- **Backend JSON enum serialization**: Minimal APIs require `builder.Services.ConfigureHttpJsonOptions(...)` with `JsonStringEnumConverter` in addition to `AddControllers().AddJsonOptions(...)`. Both are wired in `Program.cs` — missing either breaks one surface.
- **Files deleted in the 2026-04 booking rework**: `AdminAvailabilityEndpoints.cs`, `PresetIntroConfig.cs`, `PresetIntroSlotService.cs`, `ScheduleHelpers.cs`, `BookAvailabilityDto.cs` (backend); `StudentCalendar.tsx`, `StudentBookingDialog.tsx`, `ConflictDialog.tsx` (frontend). Do not re-introduce these concepts — if you find references, they are stale.

## Seating System
- Page: `src/pages/Klassrum.tsx` — visual classroom layout with per-seat FM/EM selects
- Hooks: `src/hooks/useSeating.ts` — `useSeatingAssignments`, `useAssignSeat`, `useClearSeat`
- Service: `src/api/SeatingService.ts` — GET/PUT/DELETE `/api/seating`
- Backend: `SeatingEndpoints.cs` — CRUD with input validation, unique constraint per seat/day/period
- Two layouts: Spår 1 (classroomId=1, 15 tables) and Spår 2 (classroomId=2, 8 tables)
- Students filtered by `user.course` matching classroomId
- Overview tab shows free seats and scheduled student counts per day/block

## Student Schedule Page
- Page: `src/pages/StudentSchedule.tsx` — read-only view of student schedules per day
- Uses existing `useUsers()` data, filters by schedule booleans (scheduledMonAm, etc.)
- Tabs: Översikt (counts per day/block) + Mon-Thu (sorted student lists with colored blocks)

## Absence Warning Emails
- Teacher feature on Deltagare page: mail icon next to warning triangle for absent students
- Dialog: `src/components/deltagare/AbsenceWarningDialog.tsx` — pregenerated or custom message
- Hooks: `src/hooks/useAbsenceWarning.ts` — `useLastAttendedDate` (query), `useSendAbsenceWarning` (mutation)
- Service: `src/api/AbsenceWarningService.ts`
- Backend endpoints: `GET /api/absence-warning/last-attended/{studentId}`, `POST /api/absence-warning/send`
- Email sent via `SendEmailFireAndForget` (Resend API, no-op in dev), body HTML-encoded
- Coach Mina deltagare (`CoachMyParticipants.tsx`): participant list split by attendance — active students on top, absent 4+ weeks in separate section

## AI Exercise & Project System
- Students generate exercises/projects via AI (Grok), then submit feedback which saves to history
- Endpoints in `ExerciseEndpoints.cs`: GET `exercise-history`, GET `project-history`, POST `exercise-feedback`, POST `project-feedback`
- Shared test runner: `src/lib/exerciseTestRunner.ts` — `parseAsserts()` and `runTests()` used by both AI-generera and Sparade views
- Sparade tabs show student's own history (not shared catalogue) with filters matching generation options

## Changelog System (`src/changelogs/`)
- One JSON file per feature/fix: `src/changelogs/<YYYY-MM-DD>-<slug>.json`
- Schema: `{ displaydate: string | null, entries: { admin, coach, student } }`
- Each role's entries is `ChangelogItem[]` — either a plain `string` or `{ text: string; children: string[] }` for nested bullets
- `displaydate: null` = unpublished (hidden from dialog); set to a date string to publish
- Loaded by `src/hooks/useChangelog.ts`, rendered by `src/components/ChangelogDialog.tsx`
- `/makepr` drafts changelog entries in **Swedish** as its first step

## Help System
- `HelpDialog` (`src/components/HelpDialog.tsx`): per-page popover with static help text + optional video thumbnail
- `HelpVideoModal` (`src/components/HelpVideoModal.tsx`): fullscreen YouTube embed
- `NavChat` (`src/components/NavChat.tsx`): persistent AI chatbot in TopNav, uses `useHelpbot` hook

## SCENARIO Comment Convention
Add to mutation hooks (frontend) and endpoint registrations (backend) after implementing features. Used by `/static-trace` to verify code matches intent.

**Frontend — JSDoc on mutation hooks** (`src/hooks/use*.ts`):
```ts
/**
 * SCENARIO: One sentence — who does what
 * CALLS: POST /api/route (BackendFile.cs)
 * SIDE EFFECTS:
 *   - DB/flag change (backend)
 *   - Email sent if EmailNotifications = true (backend, EmailService)
 *   - Invalidates ["queryKey"] cache
 */
```
Query hooks (read-only): single-line `/** SCENARIO: ... */` only.

## Security Patterns
- **XSS**: All `dangerouslySetInnerHTML` render sites use `DOMPurify.sanitize()`
- **Route guarding**: `ProtectedRoute.tsx` — wraps routes needing role check, redirects to `/` if unauthorized
- **Backend auth**: Endpoints use `[Authorize]` attribute, role checks via claims
- **HTML content**: News posts (`Post.html`) are raw admin-authored HTML — always sanitize on render

## Testing
- Framework: Vitest (Node environment)
- Location: `src/__tests__/<category>/` mirroring source
- Import: `import { describe, it, expect } from 'vitest'`
- Source imports use `@/` alias
- ~10 test files covering utils, services, hooks
- Backend tests in `Kursserver.Tests` cover pure helpers/parsers only

## Shared Components & Patterns
- Shared `FeedbackForm` component for bug/idea submission in settings pages
- `AdminBugReports` module in admin panel with Buggar/Ideer tabs
- `CoachAttendance.tsx` is shared between admin and coach views (Deltagare + Mina deltagare)
  - Tabs: Narvaro, Schemalagda dagar, Meddelanden, Kontaktinfo, Lararkontakt/Larare pa kursen, Progression, Statistik
  - Role-based differences in tab content
- Booking email notifications centralized in `Kursserver/Utils/BookingNotifier.cs`
- Dev mode email suppression: backend wraps email calls with `if (!app.Environment.IsDevelopment())`

## Known Gotchas
- `ProtectedRoute` supports `allow: 'admin' | 'student'` for route guarding
- Old ticket system was replaced by messaging — no more ticket/arende code
- Changelog: `CHANGELOG.md` at root is gitignored (local only)
- cloc command: `cloc . --exclude-dir=node_modules,dist,.git --exclude-ext=json,lock`
