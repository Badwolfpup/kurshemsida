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

## Security Patterns
- **XSS**: All `dangerouslySetInnerHTML` render sites use `DOMPurify.sanitize()` — installed as `dompurify` + `@types/dompurify`
- **Route guarding**: `src/components/ProtectedRoute.tsx` — wraps routes needing role check, redirects to `/` if unauthorized. Currently guards `/admin` and `/admin-schedule` (admin/teacher only). Uses `useUserRole()` hook.
- **Backend auth**: Endpoints use `[Authorize]` attribute (not `.RequireAuthorization()`). Role checks done manually inside handler via `context.User.FindFirst(ClaimTypes.Role)?.Value` compared to `Role.Admin.ToString()` etc.
- **HTML content**: News posts (`Post.html`) are raw admin-authored HTML stored in DB — always sanitize on render, never trust the stored value

## Recurring Patterns
- cloc command: `cloc . --exclude-dir=node_modules,dist,.git --exclude-ext=json,lock`
- When switching branches: `git checkout main && git pull && git checkout <branch>` (changes stay on original branch)
- Dev mode email suppression: backend wraps `EmailService.SendEmailFireAndForget()` calls with `if (!app.Environment.IsDevelopment())` — applied in TicketEndpoints.cs, consider using same pattern elsewhere
