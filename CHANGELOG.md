# Changelog

## 2026-02-24

- **Bookings:** Replaced admin color legend with a tab selector — coaches now filter the booking calendar by admin instead of seeing all slots at once

## 2026-02-23

- **Tickets:** Accepted time suggestions now create a Booking, making the slot visible in the admin calendar and blocked for coach scheduling
- **Attendance:** Sort attendance table by attended days (last 3 weeks), then by first name
- **Exercises:** Added Python and C# as language options (pending testing)
- **Navigation:** Removed duplicate Profil link; renamed Inställningar to Profil
- **Bugfixes:** Various minor fixes (#49)
- **Tickets:** Styling improvements to the ticket UI

## 2026-02-22

- **Tickets:** Added reply threads, time suggestions from admin, and unread indicators
- **Tickets:** Students can now create tickets for Handledning or Other
- **Projects:** Added feedback flow and multi-image upload support
- **Exercises:** Mandatory feedback dialog when submitting; simplified AI model selection
- **Responsiveness:** Fixed hero subtitle size, hamburger menu aria-label, sidebar Escape key
- **Users:** Fixed active/inactive filtering for admin, coach, and teacher tabs
- **Git:** Added build artifacts and local settings to .gitignore

## 2026-02-21

- **Email:** Implemented Resend email service
- **Admin schedule:** Delete availability slots, create standalone appointments with conflict checking, shared calendar view for all admins/teachers

## 2026-02-20

- **Bookings:** Bookings can now be rescheduled (with approval flow)
- **Bookings:** Fixed various booking issues
- **Users:** Admins can now add users of different roles (admin, teacher, coach, student)
- **Admin settings:** Various improvements
- **Responsiveness:** Improved start page responsiveness

## 2026-02-18

- **Bookings:** Initial booking feature implemented — coaches can book sessions with students
- **Bookings:** Improvements and bugfixes to booking flow
- **Coach view:** SVG icons added to coach/student views
- **Coach view:** Attendance view restructured with tabs; initials shown for coaches
- **Coach view:** Renamed "Närvarohantering" to "Deltagarprofiler"
- **Coach view:** Removed Projekt from coach sidebar
- **Users:** Filter users by role/status
- **Login:** Autocomplete added to email input
- **News:** Dialog added for news items

## 2026-02-17

- **Attendance:** Fixed date offset bug (dates were off by 1 day)
- **Attendance:** Added ability to mark a day as no-class
- **Projects/Exercises:** Students can now choose between AI-generated and premade content
- **Calendar:** Booking calendar for intro sessions (Vixis)

## 2026-02-16

- **UI:** Migrated UI to shadcn/ui + Tailwind CSS design system

## 2026-02-14

- **Docs:** Replaced auto-generated README with project documentation

## 2026-02-10

- **Events:** Added events page and statistics view

## 2026-02-09

- **Portfolio:** Added portfolio page and start page

## 2026-02-08

- **Users:** Fixed delete user bug
- **AI:** Added AI integration

## 2026-02-05 – 2026-02-06

- Minor CSS cleanup and small fixes
