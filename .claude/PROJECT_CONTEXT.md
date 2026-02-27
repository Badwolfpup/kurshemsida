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
- Backend models: `Kursserver/Models/*.cs`
- Backend endpoints: `Kursserver/Endpoints/*Endpoints.cs`
- Unit tests: `src/__tests__/`
- Changelog: `CHANGELOG.md` (root, gitignored — local only)

## Data Model Notes
- `Booking`: AdminId, CoachId, StudentId, AdminAvailabilityId, Note, MeetingType, StartTime, EndTime, BookedAt, Seen, Status, Reason, RescheduledBy
- `Ticket`: SenderId (student), RecipientId (admin), Subject, Message, Type, Status
- `TicketTimeSuggestion`: TicketId, SuggestedById, StartTime, EndTime, Status (pending/accepted/declined), DeclineReason
- Admin calendar (`AdminSchedule`) only renders `Booking` records — ticket suggestions must be converted to bookings to appear

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

## Recurring Patterns
- cloc command: `cloc . --exclude-dir=node_modules,dist,.git --exclude-ext=json,lock`
- When switching branches: `git checkout main && git pull && git checkout <branch>` (changes stay on original branch)
