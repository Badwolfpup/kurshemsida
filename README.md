# Kurshemsida

The React frontend for a full-stack Learning Management System (LMS) used by real students. This application is the companion frontend to the [Kursserver](https://github.com/Badwolfpup/Kursserver) backend API.

## About

A feature-rich course management interface for students and instructors. Students can browse exercises, projects, course information, and track attendance. Instructors get a full admin panel for managing users, creating posts, and generating AI-powered exercises and projects.

## Technologies

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **State Management:** React Context API (Theme, Language, User)
- **Rich Text:** Quill editor for post creation
- **Styling:** CSS with theme support (light/dark)

## Features

- **Multi-language support** via LanguageContext
- **Theme switching** (light/dark) via ThemeContext
- **Role-based views** for students, coaches, and admins
- **Attendance tracking** with dedicated coach interface
- **Rich text posts** using Quill editor
- **Exercise and project browsing** with full CRUD in admin
- **Student portfolio pages**
- **AI-generated content management** (exercises and projects via Anthropic/DeepSeek)
- **User management** with permission levels

## Project Structure

```
src/
+-- components/
|   +-- AdminSidebar.tsx
|   +-- MainContent.tsx
|   +-- Sidebar.tsx
+-- context/
|   +-- LanguageContext.tsx
|   +-- ThemeContext.tsx
|   +-- UserContext.tsx
+-- hooks/
|   +-- useAttendance.ts
|   +-- useExercises.ts
|   +-- useNoClass.ts
|   +-- usePosts.ts
|   +-- useProjects.ts
|   +-- useUsers.ts
+-- api/
|   +-- AttendanceService.ts
|   +-- ExerciseService.ts
|   +-- PostService.ts
|   +-- ProjectService.ts
|   +-- UserService.ts
|   +-- ...
+-- pages/
|   +-- AboutContent/        # Course info pages
|   +-- admin/               # Admin panel pages
|   +-- Exercises.tsx
|   +-- Projects.tsx
|   +-- Portfolio.tsx
|   +-- Settings.tsx
|   +-- Login.tsx
+-- Types/                   # TypeScript interfaces and DTOs
+-- styles/                  # Themed CSS
+-- utils/                   # Quill editor, toast messages, image utils
+-- App.tsx
+-- main.tsx
```

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default. Requires the [Kursserver](https://github.com/Badwolfpup/Kursserver) backend to be running.

## Building for Production

```bash
npm run build
```

The output in `dist/` is deployed to the Kursserver's `wwwroot/` folder.

## Related

- **Backend:** [Kursserver](https://github.com/Badwolfpup/Kursserver) - ASP.NET Core API that powers this frontend
