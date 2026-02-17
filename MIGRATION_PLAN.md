# Plan: Migrate kurshemsida UI to shadcn/Tailwind + Add Vicky's Features

## Context
Adam's `kurshemsida` uses custom CSS (5-skin theme system) and traditional component structure. Vicky's `cul-learn-hub` is a rework with shadcn/ui + Tailwind CSS, a cleaner layout, and several new features. Goal: adopt her UI design and new features while keeping Kursserver as the sole backend (remove all Supabase).

**Source (reference):** `C:\Users\adam_\source\repos\React\Vickys sida\cul-learn-hub\`
**Target (to modify):** `C:\Users\adam_\source\repos\React\kurshemsida\`
**Backend:** `C:\Users\adam_\source\repos\Kursserver\`

## Decisions
- **Data source:** Kursserver only. All Supabase calls removed/replaced.
- **New features:** Terminal page, CodeEditor, Ticket system, Coach routes
- **Dropped features:** 5-skin themes (→ simple light/dark), Quill editor, Language selector

---

## Phase 0: Scaffolding (install dependencies, config files)

1. Install Tailwind CSS 3 + postcss + autoprefixer + tailwindcss-animate
2. Install shadcn deps: class-variance-authority, clsx, tailwind-merge, lucide-react, framer-motion, sonner, cmdk, input-otp, embla-carousel-react, recharts, vaul, next-themes
3. Install all @radix-ui packages from Vicky's package.json
4. Remove: quill, react-quill, quill-resize-image, styled-components, react-calendar
5. Copy from cul-learn-hub (as-is):
   - `tailwind.config.ts`, `postcss.config.js`, `components.json`
   - `src/lib/utils.ts`
   - `src/components/ui/` (entire directory — standard shadcn components)
   - `src/index.css` (HSL variable theme system)
6. Set up `@` path alias in `tsconfig.json` + `vite.config.ts`

## Phase 1: Auth + Layout Shell

1. Copy `AuthContext.tsx` from cul-learn-hub → replaces `UserContext.tsx`. Already uses Kursserver endpoints (`/api/me`, `/api/logout`).
2. Copy `AuthService.ts` from cul-learn-hub (same endpoints as current, just cleaner).
3. Copy layout components (as-is, no Supabase):
   - `AppLayout.tsx` + CSS
   - `AppSidebar.tsx` + CSS (role-based nav: admin/coach/student)
   - `TopNav.tsx` + CSS
   - `NavLink.tsx`
   - `KomIgangDialog.tsx`
4. Copy hooks (no Supabase):
   - `useTheme.ts` (light/dark only) — replaces ThemeContext
   - `useUserRole.ts`
   - `use-mobile.tsx`
5. Rewrite `App.tsx` with Vicky's routing structure (auth-gated routes, AppLayout shell)
6. Copy `Login.tsx` + CSS from cul-learn-hub
7. Delete old files: `ThemeContext.tsx`, `LanguageContext.tsx`, `themes.css`, all old CSS files (sidebar.css, button.css, containers.css, etc.), `Sidebar.tsx`, `AdminSidebar.tsx`, `MainContent.tsx`

## Phase 2: Core Pages (already Kursserver-compatible)

These pages from cul-learn-hub use TanStack Query hooks that call Kursserver. Copy and adjust as needed:

1. **Index.tsx** — Hero page with card dialog. `CardDialog.tsx` fetches posts via Supabase → rewire to use existing `usePosts()` hook (PostService already exists in kurshemsida).
2. **Projekt.tsx** — AI project generator. Uses `AssertService` (Kursserver). Copy as-is.
3. **Ovningar.tsx** (student view) — Exercise list. Uses `useExercises()`. Copy as-is.
4. **Portfolio.tsx** — Local state only. Copy as-is.
5. **Admin.tsx** — Menu grid. Copy as-is (just a menu, no data).
6. **AdminUsers.tsx** — Uses `useUsersApi`. No Supabase. Copy as-is.
7. **AdminAttendance.tsx** — Uses `useAttendance`. No Supabase. Copy as-is.
8. **CoachAttendance.tsx** — Uses attendance hooks. Copy as-is.
9. **NotFound.tsx** — Copy as-is.

Copy supporting files:
- API services from cul-learn-hub: `UserService.ts`, `AttendanceService.ts`, `ExerciseService.ts`, `ProjectService.ts`, `NoClassService.ts`, `AssertService.ts`
- All hooks from cul-learn-hub's `src/hooks/`
- Types from `src/Types/` and `src/Types/Dto/`

## Phase 3: Self-Contained New Features

1. **Terminal.tsx** — Virtual bash terminal with guided lessons. Zero API calls. Copy as-is.
2. **CodeEditor.tsx** — Multi-tab code editor with live preview. Zero API calls. Copy as-is.

## Phase 4: Supabase-to-Kursserver Rewiring

### 4A: Pages that can use EXISTING Kursserver endpoints

| Page | Supabase usage | Kursserver replacement |
|------|---------------|----------------------|
| **AdminPosts.tsx** | `supabase.from("posts")` | Use existing `PostService` + `usePosts()` hook. Posts model has: Html, Delta, PublishedAt, Author, Pinned. Vicky's version has Title+Content (simpler). **Adapt to use existing Post model fields.** |
| **AdminProjects.tsx** | `supabase.from("projects")` | Use existing `ProjectService`. Kursserver Project model: Title, Description, Html, Css, Javascript, Difficulty, ProjectType. Map fields. |
| **Preferenser.tsx** | Reads Supabase profiles | Replace with `UserService.updateUser()` for profile edits. Theme toggle uses `useTheme` (no backend). |
| **CoachSettings.tsx** | Same as Preferenser | Same approach. |
| **CardDialog.tsx** | Reads Supabase posts | Use `usePosts()` hook instead. |

### 4B: Pages that need NEW Kursserver endpoints

| Page | What's needed |
|------|--------------|
| **AdminTickets.tsx + CoachTickets.tsx** | New `Ticket` model + CRUD endpoints (see Phase 5) |
| **AdminExercises.tsx** (admin CRUD) | Kursserver Exercise model is simpler (no StarterCode, SolutionCode, Explanation, Category, LearningGoal, Topics, Hints). **Simplify the admin UI to match the existing model** — map: `Javascript` = starter code, `Clues` = hints, `GoodToKnow` = explanation. Add missing fields to backend later if needed. |
| **CoachMyParticipants.tsx** | Needs users filtered by coach_id. Kursserver User model has `CoachId`. **Add query param** to `fetch-users` endpoint or filter client-side. |
| **CoachContact.tsx** | Needs admin/teacher contact info. Can filter from `fetch-users` client-side. |
| **CoachProjects.tsx** | Can use existing `fetch-projects` endpoint. |
| **AdminSettings.tsx** | Profile edit (existing endpoints) + no-class days (existing `NoClassService`). Simplify. |
| **AdminEvents.tsx** | Fold into AdminPosts or skip for now. |

## Phase 5: New Backend Endpoints (Kursserver)

### 5A: Ticket System
- New model: `Ticket` with Id, Subject, Message, Type (string), Status (Open/InProgress/Closed), SenderId (FK→User), RecipientId (FK→User), CreatedAt, UpdatedAt
- New model: `TicketReply` with Id, TicketId (FK→Ticket), SenderId (FK→User), Message, CreatedAt
- New file: `Endpoints/TicketEndpoints.cs`
  - `GET /api/fetch-tickets` (admin: all, coach: own)
  - `POST /api/add-ticket`
  - `PUT /api/update-ticket` (status changes)
  - `POST /api/add-ticket-reply`
- EF migration

### 5B: Coach User Filtering
- Add optional `?coachId={id}` query param to existing `GET /api/fetch-users` endpoint in `UserEndpoints.cs`
- No new model needed (User already has CoachId)

## Phase 6: Cleanup

1. Remove `src/integrations/supabase/` directory
2. Remove old CSS files no longer used
3. Remove unused dependencies from package.json
4. Test all routes end-to-end
5. Verify dark mode works globally
6. Update Kursserver to copy new Vite build to wwwroot

---

## Execution Order

```
Phase 0 → Phase 1 → [Phase 2, Phase 3, Phase 4A in parallel] → Phase 5 → Phase 4B → Phase 6
```

Phases 2, 3, and 4A can proceed in parallel after Phase 1. Phase 4B (tickets, coach pages) is blocked on Phase 5 (backend endpoints).

## Verification

After each phase:
- `npm run dev` in kurshemsida and verify no build errors
- Navigate all routes in browser against running Kursserver
- Verify login flow works (email → passcode → JWT cookie)
- Dark mode toggle works on all pages
- Admin/Coach/Student see correct nav items in sidebar

Final:
- `npm run build` succeeds
- `npm run lint` passes
- `npm run test` passes
- Copy build to Kursserver wwwroot and test in production mode
