# kurshemsida — Project Context

## Project Overview
- School management platform: frontend (React/TypeScript) + backend (ASP.NET Core C#)
- Two repos: `kurshemsida` (frontend) and `Kursserver` (backend)
- Roles: Admin, Teacher, Coach, Student
- ~14k lines of TypeScript across 137 files (as of 2026-02-23)

## Key Architecture
- React Query (`@tanstack/react-query`) for all data fetching/mutations
- shadcn/ui + Tailwind CSS design system
- Calendar: React Big Calendar with custom `FourDayView`
- Auth: JWT with role claims; `FromClaims().GetUserId(context)` pattern in endpoints
- Backend: Minimal API endpoints (`MapGet`, `MapPost`, etc.) organized in `*Endpoints.cs` files

## Important File Paths
- Frontend hooks: `src/hooks/use*.ts`
- Frontend services: `src/api/*Service.ts`
- Frontend types: `src/Types/*Type.ts`
- Frontend pages: `src/pages/*.tsx`
- Backend models: `Kursserver/Models/*.cs`
- Backend endpoints: `Kursserver/Endpoints/*Endpoints.cs`
- Unit tests: `src/__tests__/`
- Changelog: `CHANGELOG.md` (root, gitignored — local only)

## Messaging System
- **Replaced** the old ticket/ärende system with persistent 1-on-1 chat threads
- Page: `src/pages/MeddelandenPage.tsx` — single page for all roles at `/meddelanden`
  - Admin: two tabs (Deltagare | Coacher), shows all active users including those without existing threads ("virtual threads" with negative IDs)
  - Coach: flat list of direct threads (admins/teachers + students)
  - Student: flat list of direct threads (admins/teachers + coach)
- Components: `src/components/messaging/` — `ThreadList`, `ChatThread`, `StudentContextChat`
- `StudentContextChat`: about-student threads shown in Deltagare/Mina deltagare views (not on Meddelanden page)
- Sidebar badge split: `useUnreadCounts()` derives from `useThreads()` data to split unread counts — `messagesCount` (direct) on "Meddelanden", `studentContextCount` on "Deltagare"/"Mina deltagare". Also exposes `unreadStudentIds: Set<number>` for per-participant red dots.
- Shared `FeedbackForm` component for bug/idea submission in settings pages
- `AdminBugReports` module in admin panel with Buggar/Idéer tabs
- Backend: `MessageEndpoints.cs` (threads, messages, view, unread-count), `BugReportEndpoints.cs`
- Thread model: `User1Id < User2Id` enforced for uniqueness, `StudentContextId` nullable (null = direct, N = about-student)
- Unique constraint uses computed column: `COALESCE(StudentContextId, 0)` for SQL Server null uniqueness
- Lazy thread creation on first message via `POST /api/messages`
- 10-second polling (`refetchInterval`) on threads and messages for near-real-time updates
- Email notifications on new messages (respects `EmailNotifications` flag, skipped in dev)

## Data Model Notes
- `Booking`: AdminId, CoachId, StudentId, AdminAvailabilityId, Note, MeetingType, StartTime, EndTime, BookedAt, Seen, Status, Reason, RescheduledBy
- `Thread`: User1Id, User2Id, StudentContextId (nullable), CreatedAt, UpdatedAt — unique on (User1Id, User2Id, COALESCE(StudentContextId, 0))
- `Message`: ThreadId, SenderId, Content, CreatedAt
- `ThreadView`: UserId, ThreadId, LastViewedAt — unique on (UserId, ThreadId)
- `BugReport`: Type ("bug"|"idea"), Content, SenderId, CreatedAt
- `RecurringEvent`: Name, Weekday, StartTime, EndTime, Frequency (weekly/biweekly), StartDate, AdminId, CreatedAt
- `RecurringEventException`: RecurringEventId, Date, IsDeleted, Name, StartTime, EndTime

## AI Exercise & Project System
- Students generate exercises/projects via AI (Grok), then submit feedback which saves to history
- `ExerciseHistory`: UserId, Topic, Language, Difficulty, Title, Description, Example, Assumptions, FunctionSignature, Solution, Asserts (JSON), IsCompleted, feedback fields
- `ProjectHistory`: UserId, TechStack, Difficulty, Title, Description, LearningGoals, UserStories, DesignSpecs, AssetsNeeded, StarterHtml, BonusChallenges, SolutionHtml/Css/Js, IsCompleted, feedback fields
- Endpoints in `ExerciseEndpoints.cs`: GET `exercise-history`, GET `project-history`, POST `exercise-feedback`, POST `project-feedback`
- Shared test runner: `src/lib/exerciseTestRunner.ts` — `parseAsserts()` and `runTests()` used by both AI-generera and Sparade views
- Sparade tabs show student's own history (not shared catalogue) with filters matching generation options

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

**Backend — XML doc above `app.Map*`** (`Kursserver/Endpoints/*Endpoints.cs`):
```csharp
/// <summary>
/// SCENARIO: One sentence — who does what
/// CALLS: useHookName() → serviceName.method()
/// SIDE EFFECTS:
///   - Sets Field = value
///   - Sends email if EmailNotifications = true
/// </summary>
app.MapPost("/api/route", ...
```
Skip service methods — they are pure HTTP wrappers with no side effects.

## Security Patterns
- **XSS**: All `dangerouslySetInnerHTML` render sites use `DOMPurify.sanitize()` — installed as `dompurify` + `@types/dompurify`
- **Route guarding**: `src/components/ProtectedRoute.tsx` — wraps routes needing role check, redirects to `/` if unauthorized. Currently guards `/admin` and `/admin-schedule` (admin/teacher only). Uses `useUserRole()` hook.
- **Backend auth**: Endpoints use `[Authorize]` attribute (not `.RequireAuthorization()`). Role checks done manually inside handler via `context.User.FindFirst(ClaimTypes.Role)?.Value` compared to `Role.Admin.ToString()` etc.
- **HTML content**: News posts (`Post.html`) are raw admin-authored HTML stored in DB — always sanitize on render, never trust the stored value

## Backend Unit Tests
- `Kursserver.Tests` covers pure helpers/parsers only (`ScheduleHelpers`, `HasAdminPriviligies`, `FromClaims`, exercise/project parsers)
- No HTTP endpoint integration tests — endpoint logic is not unit-tested
- New endpoints only need tests if they extract pure logic into a static helper method

## Participant Detail View (CoachAttendance)
- `src/components/admin/CoachAttendance.tsx` is shared between admin and coach views
- Admin: accessed from `Deltagare.tsx` with `seluser` + `showChat` props
- Coach: accessed from `CoachMyParticipants.tsx` with `seluser` + `showChat` props
- Tabs: Närvaro, Schemalagda dagar, Meddelanden, Kontaktinfo, Lärarkontakt/Lärare på kursen, Progression, Statistik
- Role-based differences: Lärarkontakt (admin: single ContactId teacher), Lärare på kursen (coach: all teachers), Progression (admin: mock data, coach: empty), Meddelanden (admin: chats with coach, coach: chats with admin)
- When `seluser` is provided: dropdowns are hidden, attendance checkboxes are read-only
- `DeltagareDetail.tsx` was deleted — CoachAttendance replaces it

## Calendar System
- Shared components in `src/components/calendar/`: `CalendarShell`, `FourDayView`, `BookingDetailsDialog`, `ConflictDialog`, `RecurringEventDialog`, `RecurringEventClickDialog`, `StudentBookingDialog`, `calendarUtils`
- Admin-specific: `src/components/admin/AdminSchedule.tsx`, `AdminBookingDialog.tsx`
- Coach: `src/pages/CoachBookingView.tsx`
- Student: `src/pages/StudentCalendar.tsx`
- All calendars use React Query hooks: `useBookings`, `useAvailabilities`, `useRecurringEvents`, `useNoClasses` (in `src/hooks/`)
- Unified booking API via `src/api/BookingService.ts` (new endpoints: `/api/bookings`, `/api/availability`) — legacy old-API functions removed except `getBookings` (used by TimeSuggestionDialog, marked `@deprecated`)
- `RecurringEventService.ts` handles `/api/recurring-events` CRUD + exceptions
- `calendarUtils.ts` exports: `getFreeSegments`, `getAdminColorMap`, `ALL_TIME_OPTIONS`, `padTime`, `STATUS_COLORS`, `RECURRING_EVENT_COLOR`
- `ProtectedRoute` supports `allow: 'admin' | 'student'` for route guarding

## Changelog System (`src/changelogs/`)
- One JSON file per feature/fix: `src/changelogs/<YYYY-MM-DD>-<slug>.json`
- Schema: `{ displaydate: string | null, entries: { admin, coach, student } }`
- Each role's entries is `ChangelogItem[]` — either a plain `string` or `{ text: string; children: string[] }` for nested bullets
- `displaydate: null` = unpublished (hidden from dialog); set to a date string to publish
- Loaded by `src/hooks/useChangelog.ts`, rendered by `src/components/ChangelogDialog.tsx`
- Dialog renders two-level bullets: top-level = disc, children = circle (indented)
- `/makepr` drafts changelog entries in **Swedish** as its first step

## Recurring Patterns
- cloc command: `cloc . --exclude-dir=node_modules,dist,.git --exclude-ext=json,lock`
- When switching branches: `git checkout main && git pull && git checkout <branch>` (changes stay on original branch)
- Dev mode email suppression: backend wraps `EmailService.SendEmailFireAndForget()` calls with `if (!app.Environment.IsDevelopment())` — applied in MessageEndpoints.cs
- Booking email notifications: centralized in `Kursserver/Utils/BookingNotifier.cs` — handles created, status changed, cancelled, rescheduled notifications for admin/coach/student
