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

## Ticket System
- **Unified page**: `src/pages/TicketsPage.tsx` — single component for all roles, uses `TicketPageConfig` + `getConfig(isAdmin, isCoach)` pattern
- Old per-role files still exist but are unused (not imported): `StudentTickets.tsx`, `CoachTickets.tsx`, `AdminTickets.tsx`
- Shared sub-components: `TicketReplyThread`, `TimeSuggestionDisplay`, `TimeSuggestionDialog` (in `src/components/tickets/`)
- Backend: `TicketEndpoints.cs` — emails skipped in dev mode via `!app.Environment.IsDevelopment()`

## Data Model Notes
- `Booking`: AdminId, CoachId, StudentId, AdminAvailabilityId, Note, MeetingType, StartTime, EndTime, BookedAt, Seen, Status, Reason, RescheduledBy
- `Ticket`: SenderId (student), RecipientId (admin), Subject, Message, Type, Status
- `TicketTimeSuggestion`: TicketId, SuggestedById, StartTime, EndTime, Status (pending/accepted/declined), DeclineReason
- `RecurringEvent`: Name, Weekday, StartTime, EndTime, Frequency (weekly/biweekly), StartDate, AdminId, CreatedAt
- `RecurringEventException`: RecurringEventId, Date, IsDeleted, Name, StartTime, EndTime
- Admin calendar renders `Booking` + `RecurringEvent` instances — ticket suggestions must be converted to bookings to appear

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
- Student sidebar item is "Mina ärenden" (not "Skapa ärende")

## Recurring Patterns
- cloc command: `cloc . --exclude-dir=node_modules,dist,.git --exclude-ext=json,lock`
- When switching branches: `git checkout main && git pull && git checkout <branch>` (changes stay on original branch)
- Dev mode email suppression: backend wraps `EmailService.SendEmailFireAndForget()` calls with `if (!app.Environment.IsDevelopment())` — applied in TicketEndpoints.cs, consider using same pattern elsewhere
