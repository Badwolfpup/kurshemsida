# Page Map — kurshemsida

Complete reference of every page, tab, and role-specific behavior in the app.

## Roles

- **Admin** (authLevel 1) and **Teacher** (authLevel 2) are treated identically — both set `isAdmin = true`
- **Coach** (authLevel 3) — `isCoach = true`
- **Student** (authLevel 4) — `isStudent = true`
- **Guest** — homepage only, no sidebar

## Sidebar Navigation by Role

**Admin/Teacher:** Startsida, Hantera användare, Närvaro, Deltagare (unread badge), Deltagarschema, Klassrum, Statistik, Datorer, Kalender & Bokning, [bottom] Buggar & Idéer, Profil, Logout
<!-- Disabled: Admin Panel (retired), Övningar, Projekt, Terminal, Meddelanden — students temporarily disabled -->
<!-- Note: the navbar AI helpbot chatbox (NavChat) was removed 2026-05-29 -->
<!-- Note: Statistik and Datorer are teacher/admin-only (ProtectedRoute allow="admin") -->

### Participant status (2026-05-29)
Each student (`User.status`) is **På plats** (default) / **Distans** / **Paus**. Distans + Paus = "reduced attendance": no absence warning, hidden empty attendance circles, own section in Närvaro, excluded from Klassrum seating, tagged in lists. Set via Hantera användare. Helper: `src/lib/participantStatus.ts`.

**Coach:** Startsida, Mina deltagare (unread badge), Meddelanden (unread badge), Kalender: Boka mote, Kontakt, [bottom] Profil, Logout

**Student:** Startsida, Projekt, Ovningar, Portfolio, Meddelanden (unread badge), Min kalender, Terminal, [bottom] Profil, Logout

---

## / — Startsida (Homepage)

**Roles:** All (including Guest)
**Component:** `pages/Index.tsx`

- Hero banner: "Valkommenill CUL Programmering"
- 4 clickable info cards with modals: Om kursen, Vara aktiviteter, Vara lokaler, Handledarna
- No role-based differences

---

## /projekt — Projekt

**Roles:** Admin, Coach, Student
**Component:** `pages/Projekt.tsx`
**Hooks:** `useAddProject`, `useProjectHistory`

### Tab: AI-generera (`Projekt/ProjektAIGenerate.tsx`)
- Select: AI model, project type (HTML / HTML+CSS / HTML+CSS+JS), difficulty (1-5)
- Generate button with 90s countdown
- Shows: project details (title, description, learning goals, user stories, design specs, starter code, bonus challenges)
- Toggle between assignment view and code solution (HTML/CSS/JS)
- Solution unlocks after 5 minutes
- Feedback form on completion/abandonment
- Same for all roles

### Tab: Sparade (`Projekt/ProjektSaved.tsx`)
- Filters: project type, difficulty, search by title
- Expandable list with full details + live iframe preview + code blocks
- Same for all roles

---

## /ovningar — Ovningar

**Roles:** Admin, Coach, Student
**Component:** `pages/Ovningar.tsx`
**Hooks:** `useExerciseHistory`, `useAddExercise`

### Tab: AI-generera (`OvningarAIGenerate.tsx`)
- Select: AI model, topic (Variables, Strings, Operators, Conditionals, Loops, Functions, Arrays, Objects, Events), language (JS only), difficulty (1-5)
- Generate button with countdown
- Shows: title, description, example, assumptions, function signature, test cases
- Code textarea + "Testa mot testfallen" button runs tests with pass/fail results
- Solution unlock after 5 minutes
- Feedback form on completion/abandonment
- Same for all roles

### Tab: Sparade — ROLE-BASED
- **Admin/Teacher:** Shows `AdminExercises` component (CRUD interface — create, edit, delete exercises)
- **Coach/Student:** Shows `OvningarSaved.tsx` (read-only list with filters, expandable details, code testing area, solution toggle)

---

## /portfolio — Portfolio

**Roles:** All logged-in
**Component:** `pages/Portfolio.tsx`
**Hooks:** `useExercises`, `useProjects`

- Stats cards: total available, exercise count, project count
- Project grid with type/difficulty badges
- Exercise badges
- Empty state: "Inga ovningar eller projekt tillgangliga" with prompt to contact coach
- Same for all roles

---

## /meddelanden — Meddelanden

**Roles:** Admin, Coach, Student
**Component:** `pages/MeddelandenPage.tsx`
**Hooks:** `useThreads`, `useUnreadCounts`, `useMessages`

- Thread list (left) + chat area (right), responsive layout

### Role-based differences:
- **Admin/Teacher:** 2 tabs — "Deltagare" (student threads) and "Coacher" (coach threads)
- **Coach:** No tabs — sees assigned students + admin/teachers
- **Student:** No tabs — sees own coach + admin/teachers

### Shared features:
- Unread badge per thread
- Virtual threads (created on first message) for users without existing threads
- Real-time polling (10s interval)

---

## /deltagare — Deltagare

**Roles:** Admin/Teacher only (ProtectedRoute allow="admin")
**Component:** `pages/Deltagare.tsx`
**Hooks:** `useUsers`, `useUnreadCounts`

- Filter dropdowns (top-right): **status** (på plats/distans/paus), **lärare** (by contactId), and **coach** (active coaches)
- Table of all student participants (filtered by the selected dropdowns)
- Columns: name, unread message indicator (red dot), Distans/Pausad tag (left of the Spår tag), track badge
- Distans/paus students show no absence warning; their empty attendance circles are hidden in the detail view
- Click row → `CoachAttendance` detail view (heading shows e.g. "(studerar på distans)") with attendance chart + chat (`showChat=true`)
- Back button to return to list

---

## /hantera-anvandare — Hantera användare

**Roles:** Admin/Teacher only (ProtectedRoute allow="admin")
**Component:** `pages/HanteraAnvandare.tsx` → `AdminUsers`

- User CRUD table — add, edit, delete, toggle active, assign coach
- Deltagare tab has a **Status** column; the edit dialog has a På plats / Distans / Paus toggle (ToggleGroup)

---

## /narvaro — Närvaro

**Roles:** Admin/Teacher only (ProtectedRoute allow="admin")
**Component:** `pages/Narvaro.tsx` → `AdminAttendance`

- Attendance by date — toggle present/absent per student
- On-site students first; **distans/paus students** in a separate "Distans & paus" section at the bottom, excluded from the 2-week absence warning (no triangle/red banner) but still markable

---

## /klassrum — Klassrum

**Roles:** Admin/Teacher only (ProtectedRoute allow="admin")
**Component:** `pages/Klassrum.tsx`
**Hooks:** `useUsers`, `useSeatingAssignments`, `useAssignSeat`, `useClearSeat`

- Visual table-seating planner for Spår 1 (15 tables) and Spår 2 (8 tables), per weekday (Mån–Tor)
- Översikt tab + per-spår tabs with FM/EM seat selects per table
- Distans/paus students are excluded from seating lists/counts
- Layouts (`SPAR1_LAYOUT`, `SPAR2_LAYOUT`) are exported and reused by Statistik

---

## /statistik — Statistik

**Roles:** Admin/Teacher only (ProtectedRoute allow="admin")
**Component:** `pages/Statistik.tsx`
**Hooks:** `useUsers`, `useAttendance`, `useNoClasses`, `useSeatingAssignments`, `useComputers`, `useComputerAssignments`

Three tabs:
- **Placering** (`SeatingStats`): designated/available tables per Spår × day × FM/EM, + count of "fullbokade" tables (≥6/8 slots)
- **Datorer** (`ComputerStats`): three summary rows (Total / Tilldelade / Delade datorer) and a per-pass grid of assigned vs available **shared** computers (denominated by the shared count)
- **Närvaro** (`AttendanceStats`): date-range picker (default last 4 weeks, end defaults to today); avg/median/min/max/std-dev of daily attendance overall, per weekday and per spår; total attendance rate; unique attendees per week. Excludes paus/distans students and NoClass days.

Pure stat helpers live in `src/lib/statistics.ts`.

---

## /datorer — Datorer

**Roles:** Admin/Teacher only (ProtectedRoute allow="admin")
**Component:** `pages/Datorer.tsx`
**Hooks:** `useComputers`, `useComputerAssignments`, `useAddComputer`, `useRemoveComputer`, `useSetComputerOwner`, `useAssignComputerSlot`, `useClearComputerSlot`

- Manage a global pool of borrowable computers (added/removed by id number)
- Per computer: either **shared** (assign a student per day·period in an FM/EM × Mån–Tor grid) or **dedicated** to one student (owner select) with a **Tar hem** (take-home) checkbox
- A student can belong to only one computer — students already assigned (as owner or in a slot) to another computer are filtered out of the pickers

---

## /buggar — Buggar & Idéer

**Roles:** Admin/Teacher only (ProtectedRoute allow="admin")
**Component:** `pages/Buggar.tsx` → `AdminBugReports`

- View bug reports and ideas submitted via feedback form
- Tabs: Buggar / Idéer

---

<!-- RETIRED: /admin — Admin Panel (pages/Admin.tsx)
Previously a menu-based hub for sub-pages. Promoted sub-pages to sidebar:
- Hantera deltagare → /hantera-anvandare
- Närvarohantering → /narvaro
- Buggar & Idéer → /buggar
Remaining sub-pages (Hantera övningar, Hantera projekt, Nyheter & Event, Deltagarprofiler) are unreachable — code retained for future re-enablement.
-->

---

## /admin-schedule — Kalender & Bokning (Admin)

**Roles:** Admin/Teacher only (ProtectedRoute allow="admin")
**Component:** `components/admin/AdminSchedule.tsx`
**Hooks:** `useAvailabilities`, `useBookings`, `useRecurringEvents`, `useNoClasses`

- Manage availability slots (create, edit, delete time windows)
- View all bookings across coaches and students
- Manage recurring events (weekly/biweekly with exceptions)
- Toggle no-class dates
- 4-day calendar view (`FourDayView`)

---

## /student-calendar — Min kalender

**Roles:** Student only (ProtectedRoute allow="student")
**Component:** `pages/StudentCalendar.tsx`
**Hooks:** `useBookings`, `useRecurringEvents`

- Calendar view showing own bookings (color-coded by status: pending/accepted/rescheduled/declined)
- Recurring events (read-only)
- Legend with status colors
- Action button: "+ Boka handledning"
- **Book dialog:** Select admin, note, start/end time, conflict handling (error blocks, warning allows force)
- **Booking detail dialog:** Accept/Decline (if pending from admin), Cancel (if accepted), view reschedule proposals
- **Recurring event dialog:** Read-only details on click

---

## /coach-booking — Kalender & Bokning (Coach)

**Roles:** Coach
**Component:** `pages/CoachBookingView.tsx`
**Hooks:** `useBookings`, `useAvailabilities`, `useRecurringEvents`, `useCreateBooking`, `useCancelBooking`, `useUpdateBookingStatus`, `useRescheduleBooking`

- Admin tabs at top (one per admin, colored dots)
- 4-day calendar showing:
  - Free admin availability slots (clickable, admin-colored)
  - Own bookings by status (pending/accepted/rescheduled/declined)
  - Other coaches' bookings (read-only, red "Upptagen")
  - Recurring events (read-only)
- Legend with admin colors
- Action button: "+ Foresla mote"
- **Book slot dialog:** Click free time → select meeting type (intro/followup), student (if followup), times, message
- **Suggest meeting dialog:** Via button → select admin, type, student, day, times, message, conflict warnings
- **Booking detail dialog:** Accept, Decline (with reason), Cancel, Reschedule (new times + reason)

---

## /mina-deltagare — Mina deltagare

**Roles:** Coach
**Component:** `pages/CoachMyParticipants.tsx`
**Hooks:** `useUsers`, `useUnreadCounts`

- Header with participant count badge
- Table: participant initials + unread message indicator (red dot)
- Click row → `CoachAttendance` detail view (attendance chart + chat with `showChat=true`)
- Back button to return to list

---

## /kontakt — Kontakt

**Roles:** Coach
**Component:** `pages/CoachContact.tsx`
**Hooks:** `useUsers`

- Grid of contact cards for admins/teachers (active, authLevel 1-2)
- Shows: name, email, phone (if available)

---

## /coach-projekt — Projekt (Coach read-only)

**Roles:** Coach
**Component:** `pages/CoachProjects.tsx`
**Hooks:** `useProjects`

- Header with project count badge
- Grid of project cards (read-only)
- Shows: title, type badge, difficulty badge, description (truncated)

---

## /coach-installningar — Installningar (Coach)

**Roles:** Coach
**Component:** `pages/CoachSettings.tsx`

- Profile section: avatar, name, email (readonly), phone (editable)
- Theme toggle: light/dark
- Feedback form: bug report/idea submission

---

## /preferenser — Profil & Installningar

**Roles:** Admin, Coach, Student
**Component:** `pages/Preferenser.tsx`
**Hooks:** `useUpdateUser`, `useUpdateStudentProfile`

### Role-based differences:
- **Student:** Can edit email + phone only (via `updateStudentProfile`)
- **Admin/Coach:** Can edit firstName, lastName, email, phone (via `updateUser`)

### Shared sections:
- Profile: avatar, name, email, phone (edit mode with save/cancel)
- Theme: light/dark toggle
- Notifications: email notifications toggle switch
- Min coach: shows assigned coach info (student only, if coach assigned)
- Feedback form: bug report/idea submission

---

## /terminal — Terminal

**Roles:** All logged-in + Guest
**Component:** `pages/Terminal.tsx`

- Interactive terminal emulator with filesystem simulation
- Left panel: lesson progression
  - Lesson 1: Navigera i filsystemet (pwd, ls, cd)
  - Lesson 2: Hantera mappar och filer (mkdir, touch)
  - Lesson 3: Utforska fritt
- Right panel: terminal input (monospace)
- Commands: pwd, ls, cd, mkdir, touch, clear, help
- Auto-advance on correct command input
- Mobile responsive (toggle lessons panel)

---

## /login — Login

**Component:** `pages/Login.tsx`

- Email input → sends passcode
- Passcode input → validates, sets JWT cookie
- Redirects to `/` on success
- "Ga vidare som gast" option (Guest mode, homepage only)
