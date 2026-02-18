# Schedule/Booking Feature Overview

This file documents the implementation of the admin availability and coach booking feature.

---

## Backend (Kursserver)

### Data Models
- **AdminAvailability.cs**
  - Represents admin's available times.
  - Fields: Id, AdminId, StartTime, EndTime, IsBooked.
- **Booking.cs**
  - Represents a booking made by a coach for a student.
  - Fields: Id, AdminAvailabilityId, CoachId, StudentId, BookedAt, Note.

### DTOs
- **AdminAvailabilityDto.cs**
  - AddAdminAvailabilityDto: For creating new availability.
  - UpdateAdminAvailabilityDto: For updating existing availability.
  - AddBookingDto: For creating a booking.

### Endpoints
- **AdminAvailabilityEndpoints.cs**
  - `/api/admin-availability/add`: Add new admin availability.
  - `/api/admin-availability/update`: Update admin availability.
  - `/api/admin-availability/all`: Get all availabilities.
  - `/api/admin-availability/free`: Get free (not booked) availabilities.
  - `/api/admin-availability/book`: Book an available time.
  - `/api/admin-availability/bookings`: Get all bookings.

---

## Frontend (kurshemsida)

### Components
- **CalenderAvailability.tsx**
  - Admins can add/update their available times.
  - Uses backend endpoints to fetch, add, and update availability.
- **CoachBookingView.tsx** (to be created)
  - Coaches can view available times and make bookings.
  - Uses BookingService to interact with backend.
- **AdminSchedule.tsx**
  - Admins see their schedule and get notified of new bookings ("Ny bokning!").

### API Service
- **BookingService.ts** (to be created)
  - getAvailabilities: Fetches free admin availabilities.
  - bookAvailability: Books a time slot.
  - getBookings: Fetches all bookings.

---

## Integration
- Components should be added to app routes/pages for visibility.
- Admins access CalenderAvailability and AdminSchedule.
- Coaches access CoachBookingView.

---

## Next Steps
- Add CoachBookingView.tsx and BookingService.ts.
- Integrate components into app routing.
- Optional: Add "seen" logic for bookings in backend and frontend.

---

## Summary
This feature allows admins to set/update their available times, coaches to view and book those times, and admins to be notified of new bookings. All data is handled via new backend models, DTOs, and endpoints, and new frontend components and services.


//AdminSchedule:


// import React, { useEffect, useState } from 'react';
// import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
// import { format, parse, startOfWeek, getDay, addWeeks, subWeeks } from 'date-fns';
// import { sv } from 'date-fns/locale';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import { getBookings, getAvailabilities, addAvailability } from '../../api/BookingService';
// import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';

// const localizer = dateFnsLocalizer({
//   format: (date, formatStr) => format(date, formatStr, { locale: sv }),
//   parse: (value, formatStr) => parse(value, formatStr, new Date(), { locale: sv }),
//   startOfWeek: () => startOfWeek(new Date(), { locale: sv }),
//   getDay: date => getDay(date),
//   locales: { sv },
// });

// function AdminSchedule({ adminId }: { adminId: number }) {
//   const [bookings, setBookings] = useState([]);
//   const [availabilities, setAvailabilities] = useState([]);
//   const [currentDate, setCurrentDate] = useState(new Date());

//   // Fetch bookings and availabilities
//   useEffect(() => {
//     getBookings().then(data => setBookings(data.filter(b => b.adminId === adminId)));
//     getAvailabilities().then(data => setAvailabilities(data.filter(a => a.adminId === adminId)));
//   }, [adminId, currentDate]);

//   // Combine events for the calendar
//   const events = [
//     ...availabilities.map(a => ({
//       id: `avail-${a.id}`,
//       title: a.isBooked ? 'Bokad' : 'Tillgänglig',
//       start: new Date(a.startTime),
//       end: new Date(a.endTime),
//       allDay: false,
//       resource: { type: a.isBooked ? 'booked' : 'availability', availabilityId: a.id }
//     })),
//     ...bookings.map(b => ({
//       id: `booking-${b.id}`,
//       title: `Coach ${b.coachId}: ${b.note}`,
//       start: new Date(b.bookedAt),
//       end: new Date(b.bookedAt),
//       allDay: false,
//       resource: { type: 'booking' }
//     })),
//   ];

//   // Add new availability by clicking empty slot
//   const handleSelectSlot = ({ start, end }) => {
//     const startTime = start.toISOString();
//     const endTime = end.toISOString();
//     if (window.confirm(`Lägg till tillgänglighet: ${format(start, 'yyyy-MM-dd HH:mm')} - ${format(end, 'HH:mm')}?`)) {
//       addAvailability({ adminId, startTime, endTime }).then(() => {
//         getAvailabilities().then(data => setAvailabilities(data.filter(a => a.adminId === adminId)));
//       });
//     }
//   };

//   // Optional: update/delete slots via modal or inline forms

//   // Custom event styling
//   const eventStyleGetter = (event) => {
//     if (event.resource?.type === 'booking') {
//       return { style: { backgroundColor: '#e55e5e', color: '#fff', borderRadius: '6px' } };
//     }
//     if (event.resource?.type === 'availability') {
//       return { style: { backgroundColor: '#48bb78', color: '#fff', borderRadius: '6px' } };
//     }
//     if (event.resource?.type === 'booked') {
//       return { style: { backgroundColor: '#a0aec0', color: '#222', borderRadius: '6px' } };
//     }
//     return {};
//   };

//   const hasNew = bookings.some(b => !b.seen);

//   return (
//     <Card className="max-w-4xl mx-auto bg-card space-y-6 p-6">
//       <section>
//         <div className="flex items-center justify-between">
//           <h2 className="font-display text-2xl font-bold mb-1 text-foreground">
//             Veckoschema & Bokningar
//           </h2>
//           <div className="flex gap-2">
//             <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>← Föregående vecka</Button>
//             <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>Nästa vecka →</Button>
//           </div>
//         </div>
//         <p className="text-muted-foreground text-sm mb-6">
//           Klicka på en tom tid i kalendern för att lägga till tillgänglighet.
//         </p>
//         <div className="mt-8" style={{ height: 550 }}>
//           <Calendar
//             localizer={localizer}
//             events={events}
//             startAccessor="start"
//             endAccessor="end"
//             titleAccessor="title"
//             defaultView="week"
//             views={['week']}
//             step={30}
//             timeslots={2}
//             date={currentDate}
//             onNavigate={setCurrentDate}
//             selectable
//             onSelectSlot={handleSelectSlot}
//             eventPropGetter={eventStyleGetter}
//             messages={{
//               today: 'Idag',
//               next: 'Nästa',
//               previous: 'Föregående',
//               month: 'Månad',
//               week: 'Vecka',
//               day: 'Dag',
//             }}
//           />
//         </div>
//       </section>
//       <hr className="border-border" />
//       <section>
//         <div className="flex items-center gap-3 mb-2">
//           <h3 className="font-display text-lg font-semibold text-foreground">
//             Bokningar
//           </h3>
//           {hasNew && (
//             <Badge className="bg-destructive text-destructive-foreground">
//               Ny bokning
//             </Badge>
//           )}
//         </div>
//         {bookings.length === 0 ? (
//           <div className="text-muted-foreground text-sm py-3">
//             Inga bokningar registrerade.<br />
//             Nya bokningar kommer att listas här.
//           </div>
//         ) : (
//           <ul className="space-y-2 mt-2">
//             {bookings.map(b => (
//               <li key={b.id} className="text-sm text-foreground flex gap-2 items-baseline">
//                 <span className="font-bold">{b.bookedAt}</span>
//                 <span className="text-muted-foreground">| Coach</span>
//                 <Badge variant="secondary" className="text-xs">{b.coachId}</Badge>
//                 <span className="italic text-muted-foreground">{b.note}</span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>
//     </Card>
//   );
// }

// export default AdminSchedule;

//CoachBookingView:
// import React, { useEffect, useMemo, useState } from 'react';
// import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
// import { addWeeks, format, getDay, startOfWeek, subWeeks } from 'date-fns';
// import { sv } from 'date-fns/locale';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import '@/components/admin/BookingCalendar.css';
// import { bookAvailability, getAvailabilities, type Availability } from '../api/BookingService';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useAuth } from '@/contexts/AuthContext';
// import { useUsers } from '@/hooks/useUsers';
// import { useToast } from '@/hooks/use-toast';
// import { Calendar as CalendarIcon } from 'lucide-react';

// const WORKDAY_START_HOUR = 8;
// const WORKDAY_END_HOUR = 15;

// const localizer = dateFnsLocalizer({
//   format: (date, formatStr) => format(date, formatStr, { locale: sv }),
//   parse: (value) => new Date(value),
//   startOfWeek: () => startOfWeek(new Date(), { locale: sv }),
//   getDay: (date) => getDay(date),
//   locales: { sv },
// });

// const ADMIN_COLORS = ['#2563eb', '#0f766e', '#b45309', '#be123c', '#4338ca', '#0369a1', '#166534', '#7c2d12'];

// const isWithinWorkHours = (start: Date, end: Date) => {
//   const startMinutes = start.getHours() * 60 + start.getMinutes();
//   const endMinutes = end.getHours() * 60 + end.getMinutes();
//   const minMinutes = WORKDAY_START_HOUR * 60;
//   const maxMinutes = WORKDAY_END_HOUR * 60;

//   return startMinutes >= minMinutes && endMinutes <= maxMinutes && start < end;
// };

// function CoachBookingView() {
//   const { user } = useAuth();
//   const { data: allUsers = [], isLoading: usersLoading } = useUsers();
//   const { toast } = useToast();
//   const coachId = user?.id || 0;

//   const [availabilities, setAvailabilities] = useState<Availability[]>([]);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [showBookingDialog, setShowBookingDialog] = useState(false);
//   const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
//   const [note, setNote] = useState('');
//   const [studentId, setStudentId] = useState<number | null>(null);

//   const admins = useMemo(() => allUsers.filter((u) => u.authLevel <= 2 && u.isActive), [allUsers]);

//   const adminColorMap = useMemo(() => {
//     const map = new Map<number, string>();
//     admins.forEach((admin, index) => {
//       map.set(admin.id, ADMIN_COLORS[index % ADMIN_COLORS.length]);
//     });
//     return map;
//   }, [admins]);

//   const adminNameMap = useMemo(() => {
//     const map = new Map<number, string>();
//     admins.forEach((admin) => {
//       map.set(admin.id, `${admin.firstName} ${admin.lastName}`);
//     });
//     return map;
//   }, [admins]);

//   const students = useMemo(
//     () => allUsers.filter((u) => u.authLevel === 4 && u.isActive && u.coachId === coachId),
//     [allUsers, coachId]
//   );

//   useEffect(() => {
//     loadAvailabilities();
//   }, [currentDate]);

//   useEffect(() => {
//     const pollId = window.setInterval(loadAvailabilities, 15000);
//     return () => window.clearInterval(pollId);
//   }, []);

//   const loadAvailabilities = async () => {
//     try {
//       const data = await getAvailabilities();
//       setAvailabilities(
//         data.filter((a: Availability) => {
//           const start = new Date(a.startTime);
//           const end = new Date(a.endTime);
//           return !a.isBooked && isWithinWorkHours(start, end);
//         })
//       );
//     } catch {
//       toast({ title: 'Fel', description: 'Kunde inte ladda tillgangliga tider.', variant: 'destructive' });
//     }
//   };

//   const events = useMemo(
//     () =>
//       availabilities.map((a) => {
//         const adminName = adminNameMap.get(a.adminId) || `Admin ${a.adminId}`;
//         const color = adminColorMap.get(a.adminId) || '#6b7280';
//         return {
//           id: `avail-${a.id}`,
//           title: `${adminName} - Tillganglig`,
//           start: new Date(a.startTime),
//           end: new Date(a.endTime),
//           allDay: false,
//           resource: {
//             type: 'availability',
//             availability: a,
//             adminId: a.adminId,
//             adminName,
//             color,
//           },
//         };
//       }),
//     [availabilities, adminNameMap, adminColorMap]
//   );

//   const handleSelectEvent = (event: any) => {
//     if (event.resource?.type !== 'availability') return;
//     setSelectedAvailability(event.resource.availability);
//     setShowBookingDialog(true);
//     setNote('');
//     setStudentId(students.length > 0 ? students[0].id : null);
//   };

//   const handleBook = async () => {
//     if (!selectedAvailability || !coachId || !studentId) {
//       toast({ title: 'Fel', description: 'Valj en student for att boka.', variant: 'destructive' });
//       return;
//     }

//     const selectedId = selectedAvailability.id;
//     setAvailabilities((prev) => prev.filter((a) => a.id !== selectedId));

//     try {
//       await bookAvailability(selectedId, coachId, studentId, note);
//       toast({
//         title: 'Bokning skickad',
//         description: 'Tiden ar reserverad och admin ser nu en pending-forfragan.',
//       });
//       setShowBookingDialog(false);
//       setSelectedAvailability(null);
//       setNote('');
//       loadAvailabilities();
//     } catch {
//       toast({ title: 'Fel', description: 'Kunde inte boka tiden.', variant: 'destructive' });
//       loadAvailabilities();
//     }
//   };

//   const eventStyleGetter = (event: any) => {
//     if (event.resource?.type === 'availability') {
//       const color = event.resource.color || '#6b7280';
//       return {
//         style: {
//           backgroundColor: color,
//           color: '#fff',
//           borderRadius: '6px',
//           border: 'none',
//           padding: '2px 4px',
//         },
//       };
//     }
//     return {};
//   };

//   if (usersLoading) {
//     return (
//       <div className="p-6 lg:p-10 max-w-6xl mx-auto">
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 lg:p-10 max-w-6xl mx-auto">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
//           <CalendarIcon className="h-5 w-5 text-primary-foreground" />
//         </div>
//         <h1 className="font-display text-2xl font-bold text-foreground">Boka in intro</h1>
//       </div>

//       <Card className="bg-card space-y-6 p-6">
//         <section>
//           <div className="flex items-center justify-between mb-4">
//             <p className="text-muted-foreground text-sm">
//               Valj en tillganglig tid mellan 08:00 och 15:00. Varje admin har egen farg.
//             </p>
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
//                 Foregaende vecka
//               </Button>
//               <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
//                 Nasta vecka
//               </Button>
//             </div>
//           </div>

//           {admins.length > 0 && (
//             <div className="mb-4 p-4 bg-muted/50 rounded-lg">
//               <p className="text-sm font-semibold text-foreground mb-2">Tillgangliga admins:</p>
//               <div className="flex flex-wrap gap-3">
//                 {admins.map((admin) => {
//                   const color = adminColorMap.get(admin.id) || '#6b7280';
//                   return (
//                     <div key={admin.id} className="flex items-center gap-2">
//                       <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
//                       <span className="text-sm text-foreground">
//                         {admin.firstName} {admin.lastName}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           <div style={{ height: 600 }}>
//             <Calendar
//               localizer={localizer}
//               className="booking-calendar--workhours"
//               events={events}
//               startAccessor="start"
//               endAccessor="end"
//               titleAccessor="title"
//               defaultView="week"
//               views={['week']}
//               step={30}
//               timeslots={2}
//               scrollToTime={new Date(1970, 0, 1, WORKDAY_START_HOUR, 0, 0)}
//               date={currentDate}
//               onNavigate={setCurrentDate}
//               onSelectEvent={handleSelectEvent}
//               eventPropGetter={eventStyleGetter}
//               formats={{ timeGutterFormat: 'HH:mm' }}
//               messages={{
//                 today: 'Idag',
//                 next: 'Nasta',
//                 previous: 'Foregaende',
//                 month: 'Manad',
//                 week: 'Vecka',
//                 day: 'Dag',
//               }}
//             />
//           </div>
//         </section>

//         {availabilities.length === 0 && (
//           <div className="text-center py-8 text-muted-foreground">
//             <p>Inga tillgangliga tider just nu.</p>
//             <p className="text-sm mt-2">Kontakta en admin om du saknar bokningsbara tider.</p>
//           </div>
//         )}
//       </Card>

//       <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Boka intro-mote</DialogTitle>
//             <DialogDescription>
//               {selectedAvailability && (
//                 <>
//                   <p className="mt-2">
//                     <strong>Admin:</strong> {adminNameMap.get(selectedAvailability.adminId) || 'Okand'}
//                   </p>
//                   <p>
//                     <strong>Tid:</strong> {format(new Date(selectedAvailability.startTime), 'yyyy-MM-dd HH:mm')} -{' '}
//                     {format(new Date(selectedAvailability.endTime), 'HH:mm')}
//                   </p>
//                 </>
//               )}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             {students.length > 0 ? (
//               <div className="space-y-2">
//                 <Label>Valj student</Label>
//                 <Select value={studentId?.toString() || ''} onValueChange={(value) => setStudentId(Number(value))}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Valj en student" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {students.map((student) => (
//                       <SelectItem key={student.id} value={student.id.toString()}>
//                         {student.firstName} {student.lastName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             ) : (
//               <div className="p-3 bg-muted rounded-md">
//                 <p className="text-sm text-muted-foreground">Du har inga aktiva studenter just nu.</p>
//               </div>
//             )}
//             <div className="space-y-2">
//               <Label htmlFor="note">Meddelande (valfritt)</Label>
//               <Textarea
//                 id="note"
//                 placeholder="Lagg till ett meddelande om intro-motet..."
//                 value={note}
//                 onChange={(e) => setNote(e.target.value)}
//                 rows={3}
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
//               Avbryt
//             </Button>
//             <Button onClick={handleBook} disabled={!studentId || students.length === 0}>
//               Bekrafta bokning
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default CoachBookingView;

//BookingCalendar.css:
/* .booking-calendar--workhours .rbc-time-view .rbc-time-gutter .rbc-timeslot-group:nth-child(-n + 8),
.booking-calendar--workhours .rbc-time-view .rbc-day-slot .rbc-timeslot-group:nth-child(-n + 8),
.booking-calendar--workhours .rbc-time-view .rbc-time-gutter .rbc-timeslot-group:nth-child(n + 16),
.booking-calendar--workhours .rbc-time-view .rbc-day-slot .rbc-timeslot-group:nth-child(n + 16) {
  display: none;
}

.booking-calendar--workhours .rbc-time-content,
.booking-calendar--workhours .rbc-time-gutter {
  border-top: 0;
}

.booking-calendar--workhours .rbc-time-gutter .rbc-label {
  font-size: 12px;
  font-weight: 600;
}

.booking-calendar--workhours .rbc-event {
  border: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
} */


//CalenderAvailability:
// import React, { useEffect, useState } from 'react';
// import { addAvailability, getAvailabilities, updateAvailability } from '../../api/BookingService';

// interface Availability {
//   id?: number;
//   adminId: number;
//   startTime: string;
//   endTime: string;
//   isBooked?: boolean;
// }

// const WORKDAY_START_HOUR = 8;
// const WORKDAY_END_HOUR = 15;

// const isValidWorkHours = (startIso: string, endIso: string) => {
//   const start = new Date(startIso);
//   const end = new Date(endIso);
//   const startMinutes = start.getHours() * 60 + start.getMinutes();
//   const endMinutes = end.getHours() * 60 + end.getMinutes();
//   return start < end && startMinutes >= WORKDAY_START_HOUR * 60 && endMinutes <= WORKDAY_END_HOUR * 60;
// };

// function CalenderAvailability({ adminId }: { adminId: number }) {
//   const [availabilities, setAvailabilities] = useState<Availability[]>([]);
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');
//   const [error, setError] = useState('');

//   const loadAvailabilities = async () => {
//     const data = await getAvailabilities();
//     setAvailabilities(data.filter((a: Availability) => a.adminId === adminId));
//   };

//   useEffect(() => {
//     loadAvailabilities();
//   }, [adminId]);

//   const handleAdd = async () => {
//     if (!isValidWorkHours(startTime, endTime)) {
//       setError('Tid maste vara mellan 08:00 och 15:00 och sluttid maste vara efter starttid.');
//       return;
//     }

//     setError('');
//     await addAvailability({ adminId, startTime, endTime });
//     setStartTime('');
//     setEndTime('');
//     loadAvailabilities();
//   };

//   const handleUpdate = async (id: number, start: string, end: string, isBooked: boolean) => {
//     if (!isValidWorkHours(start, end)) {
//       setError('Uppdatering stoppad: tider utanfor 08:00 till 15:00 ar inte tillatna.');
//       return;
//     }

//     setError('');
//     await updateAvailability({ id, startTime: start, endTime: end, isBooked });
//     loadAvailabilities();
//   };

//   return (
//     <div>
//       <h2>Min tillganglighet (08:00-15:00)</h2>
//       <div>
//         <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
//         <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
//         <button onClick={handleAdd}>Lagg till tid</button>
//       </div>
//       {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
//       <ul>
//         {availabilities.map((a) => (
//           <li key={a.id}>
//             {a.startTime} - {a.endTime} {a.isBooked ? '(Bokad)' : ''}
//             <button onClick={() => handleUpdate(a.id!, a.startTime, a.endTime, a.isBooked ?? false)}>Uppdatera</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default CalenderAvailability;
