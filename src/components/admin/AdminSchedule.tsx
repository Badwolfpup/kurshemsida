import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, type NavigateAction } from 'react-big-calendar';
<<<<<<< HEAD
import { format, parse, startOfWeek, getDay, addWeeks, subWeeks, addDays, startOfDay, isBefore } from 'date-fns';
=======
import { format, parse, startOfWeek, getDay, addWeeks, subWeeks, addDays } from 'date-fns';
>>>>>>> 1e58298 (Improvements to the bookin feature)
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './BookingCalendar.css';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
<<<<<<< HEAD
import { getAllAvailabilities, getBookings, addAvailability, updateAvailability, deleteAvailability, createAdminAppointment, updateBookingStatus, cancelBooking, rescheduleBooking, type Availability, type Booking, type BookingConflictError } from '@/api/BookingService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Trash2, Plus } from 'lucide-react';
=======
import { getAllAvailabilities, getBookings, addAvailability, updateBookingStatus, type Availability, type Booking } from '@/api/BookingService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';
>>>>>>> 1e58298 (Improvements to the bookin feature)

const WORKDAY_START_HOUR = 8;
const WORKDAY_END_HOUR = 15;

const DAY_NAMES = ['', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
<<<<<<< HEAD

const ADMIN_COLORS = ['#2563eb', '#c6a04a', '#b45309', '#be123c', '#4338ca', '#0369a1', '#8b5cf6', '#7c2d12'];
=======
>>>>>>> 1e58298 (Improvements to the bookin feature)

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => format(date, formatStr, { locale: sv }),
  parse: (value: string, formatStr: string) => parse(value, formatStr, new Date(), { locale: sv }),
  startOfWeek: () => startOfWeek(new Date(), { locale: sv }),
  getDay: (date: Date) => getDay(date),
  locales: { sv },
});

<<<<<<< HEAD
function fourDayRange(date: Date) {
  const start = startOfWeek(date, { locale: sv });
=======
// Custom 4-day view (Mon–Thu)
function fourDayRange(date: Date) {
  const start = startOfWeek(date, { locale: sv }); // Monday
>>>>>>> 1e58298 (Improvements to the bookin feature)
  return [start, addDays(start, 1), addDays(start, 2), addDays(start, 3)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class FourDayView extends React.Component<any> {
  render() {
    const { date, localizer: loc, min, max, scrollToTime, enableAutoScroll, ...props } = this.props;
    const range = fourDayRange(date);
    return React.createElement(TimeGrid, {
      ...props,
      range,
      eventOffset: 15,
      localizer: loc,
      min: min || loc.startOf(new Date(), 'day'),
      max: max || loc.endOf(new Date(), 'day'),
      scrollToTime: scrollToTime || loc.startOf(new Date(), 'day'),
      enableAutoScroll: enableAutoScroll ?? true,
    });
  }
}

<<<<<<< HEAD
=======
// Static methods required by react-big-calendar
>>>>>>> 1e58298 (Improvements to the bookin feature)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FourDayView as any).range = fourDayRange;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FourDayView as any).navigate = (date: Date, action: NavigateAction) => {
  switch (action) {
    case 'PREV': return addDays(date, -7);
    case 'NEXT': return addDays(date, 7);
    default: return date;
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FourDayView as any).title = () => '';

interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
<<<<<<< HEAD
    type: 'availability' | 'pending' | 'accepted' | 'declined' | 'rescheduled';
    availabilityId?: number;
    availability?: Availability;
    booking?: Booking;
    adminId?: number;
    color?: string;
    isOwn?: boolean;
  };
}

/** Subtract only accepted bookings from availability to get free segments */
=======
    type: 'availability' | 'pending' | 'accepted' | 'declined';
    availabilityId?: number;
    booking?: Booking;
  };
}

/** Given an availability and its active (non-declined) bookings, return the free time segments */
>>>>>>> 1e58298 (Improvements to the bookin feature)
function getFreeSegments(avail: Availability, bookings: Booking[]): { start: Date; end: Date }[] {
  const aStart = new Date(avail.startTime);
  const aEnd = new Date(avail.endTime);

  const sorted = bookings
<<<<<<< HEAD
    .filter((b) => b.adminAvailabilityId === avail.id && b.status === 'accepted')
=======
    .filter((b) => b.adminAvailabilityId === avail.id && b.status !== 'declined')
>>>>>>> 1e58298 (Improvements to the bookin feature)
    .map((b) => ({ start: new Date(b.startTime), end: new Date(b.endTime) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const segments: { start: Date; end: Date }[] = [];
  let cursor = aStart;

  for (const booking of sorted) {
<<<<<<< HEAD
    if (booking.start > cursor) segments.push({ start: cursor, end: booking.start });
    if (booking.end > cursor) cursor = booking.end;
  }

  if (cursor < aEnd) segments.push({ start: cursor, end: aEnd });
=======
    if (booking.start > cursor) {
      segments.push({ start: cursor, end: booking.start });
    }
    if (booking.end > cursor) {
      cursor = booking.end;
    }
  }

  if (cursor < aEnd) {
    segments.push({ start: cursor, end: aEnd });
  }
>>>>>>> 1e58298 (Improvements to the bookin feature)

  return segments;
}

<<<<<<< HEAD
function generate30MinOptions() {
  const opts: { hour: number; minute: number; label: string }[] = [];
  for (let h = WORKDAY_START_HOUR; h <= WORKDAY_END_HOUR; h++) {
    for (const m of [0, 30]) {
      if (h === WORKDAY_END_HOUR && m > 0) break;
      opts.push({ hour: h, minute: m, label: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` });
    }
  }
  return opts;
}

const ALL_TIME_OPTIONS = generate30MinOptions();

=======
>>>>>>> 1e58298 (Improvements to the bookin feature)
function AdminSchedule() {
  const { user } = useAuth();
  const { data: allUsers = [] } = useUsers();
  const { toast } = useToast();
  const adminId = user?.id || 0;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

<<<<<<< HEAD
  // Booking details dialog
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingDialogMode, setBookingDialogMode] = useState<'view' | 'reschedule'>('view');
  const [bookingReason, setBookingReason] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState<{ hour: number; minute: number }>({ hour: 8, minute: 0 });
  const [rescheduleEnd, setRescheduleEnd] = useState<{ hour: number; minute: number }>({ hour: 9, minute: 0 });

  // Edit availability dialog
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [showEditAvailDialog, setShowEditAvailDialog] = useState(false);
  const [editAvailStartHour, setEditAvailStartHour] = useState(8);
  const [editAvailStartMinute, setEditAvailStartMinute] = useState(0);
  const [editAvailEndHour, setEditAvailEndHour] = useState(9);
  const [editAvailEndMinute, setEditAvailEndMinute] = useState(0);

  // Standalone appointment dialog
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [appointCoachId, setAppointCoachId] = useState<number | null>(null);
  const [appointDay, setAppointDay] = useState<string>('');
  const [appointStartHour, setAppointStartHour] = useState(9);
  const [appointStartMinute, setAppointStartMinute] = useState(0);
  const [appointEndHour, setAppointEndHour] = useState(9);
  const [appointEndMinute, setAppointEndMinute] = useState(30);
  const [appointNote, setAppointNote] = useState('');

  // Shared calendar: which other admins' bookings to show
  const [visibleAdminIds, setVisibleAdminIds] = useState<Set<number>>(new Set());

  // Store all bookings (unfiltered) for shared calendar
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  // Hard-conflict error dialog (accepted bookings — cannot proceed)
  const [conflictErrorBookings, setConflictErrorBookings] = useState<Booking[]>([]);
  const [showConflictError, setShowConflictError] = useState(false);

  // Pending-conflict warning dialog (when coach already has pending bookings at requested time)
  const [conflictWarningBookings, setConflictWarningBookings] = useState<Booking[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [pendingAppointmentData, setPendingAppointmentData] = useState<{
    coachId: number; startTime: string; endTime: string; note: string;
  } | null>(null);

  const allAdmins = useMemo(
    () => allUsers.filter((u) => u.authLevel <= 2 && u.isActive),
    [allUsers]
  );

  const adminColorMap = useMemo(() => {
    const map = new Map<number, string>();
    allAdmins.forEach((admin, index) => {
      map.set(admin.id, ADMIN_COLORS[index % ADMIN_COLORS.length]);
    });
    return map;
  }, [allAdmins]);

  const adminNameMap = useMemo(() => {
=======
  const coachNameMap = useMemo(() => {
>>>>>>> 1e58298 (Improvements to the bookin feature)
    const map = new Map<number, string>();
    allUsers.forEach((u) => { map.set(u.id, `${u.firstName} ${u.lastName}`); });
    return map;
  }, [allUsers]);

<<<<<<< HEAD
  const coaches = useMemo(
    () => allUsers.filter((u) => u.authLevel === 3 && u.isActive),
    [allUsers]
  );

  const load = async () => {
    try {
      const [availData, bookingData] = await Promise.all([getAllAvailabilities(), getBookings()]);
      setAvailabilities(availData);
      setAllBookings(bookingData);
=======
  const load = async () => {
    try {
      const [availData, bookingData] = await Promise.all([getAllAvailabilities(), getBookings()]);
      setAvailabilities(availData.filter((a) => a.adminId === adminId));
>>>>>>> 1e58298 (Improvements to the bookin feature)
      setBookings(bookingData.filter((b) => b.adminId === adminId));
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte ladda data.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId, currentDate]);

  const SEVEN_DAYS_AGO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

<<<<<<< HEAD
  const today = useMemo(() => startOfDay(new Date()), []);

=======
>>>>>>> 1e58298 (Improvements to the bookin feature)
  const events = useMemo((): ScheduleEvent[] => {
    const result: ScheduleEvent[] = [];

    for (const avail of availabilities) {
<<<<<<< HEAD
      const isOwn = avail.adminId === adminId;
      const color = adminColorMap.get(avail.adminId) || '#6b7280';
      const adminName = adminNameMap.get(avail.adminId) || `Admin ${avail.adminId}`;
      // Only subtract accepted bookings — pending stay as overlays
=======
>>>>>>> 1e58298 (Improvements to the bookin feature)
      const freeSegs = getFreeSegments(avail, bookings);
      for (let i = 0; i < freeSegs.length; i++) {
        const seg = freeSegs[i];
        result.push({
          id: `avail-${avail.id}-${i}`,
<<<<<<< HEAD
          title: isOwn ? 'Tillgänglig' : `${adminName} – Tillgänglig`,
          start: seg.start,
          end: seg.end,
          allDay: false,
          resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color, isOwn },
=======
          title: 'Tillgänglig',
          start: seg.start,
          end: seg.end,
          allDay: false,
          resource: { type: 'availability', availabilityId: avail.id },
>>>>>>> 1e58298 (Improvements to the bookin feature)
        });
      }
    }

    for (const b of bookings) {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);

      // Hide declined bookings older than 7 days
      if (b.status === 'declined' && new Date(b.bookedAt) < SEVEN_DAYS_AGO) continue;

<<<<<<< HEAD
      const coachName = adminNameMap.get(b.coachId) || `Coach ${b.coachId}`;
      const typeLabel = b.status === 'pending' ? 'Förfrågan' : b.status === 'accepted' ? 'Godkänd' : b.status === 'rescheduled' ? 'Ombokning' : 'Nekad';
=======
      const coachName = coachNameMap.get(b.coachId) || `Coach ${b.coachId}`;
      const typeLabel = b.status === 'pending' ? 'Förfrågan' : b.status === 'accepted' ? 'Godkänd' : 'Nekad';
>>>>>>> 1e58298 (Improvements to the bookin feature)

      result.push({
        id: `booking-${b.id}`,
        title: `${coachName} – ${typeLabel}`,
        start: bStart,
        end: bEnd,
        allDay: false,
        resource: {
<<<<<<< HEAD
          type: b.status as 'pending' | 'accepted' | 'declined' | 'rescheduled',
          booking: b,
          isOwn: true,
=======
          type: b.status as 'pending' | 'accepted' | 'declined',
          booking: b,
>>>>>>> 1e58298 (Improvements to the bookin feature)
        },
      });
    }

<<<<<<< HEAD
    // Add other visible admins' bookings
    for (const otherId of visibleAdminIds) {
      if (otherId === adminId) continue;
      const otherBookings = allBookings.filter((b) => b.adminId === otherId);
      const color = adminColorMap.get(otherId) || '#6b7280';
      const otherAdminName = adminNameMap.get(otherId) || `Admin ${otherId}`;

      for (const b of otherBookings) {
        if (b.status === 'declined' && new Date(b.bookedAt) < SEVEN_DAYS_AGO) continue;
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        const coachName = adminNameMap.get(b.coachId) || `Coach ${b.coachId}`;
        const typeLabel = b.status === 'pending' ? 'Förfrågan' : b.status === 'accepted' ? 'Godkänd' : b.status === 'rescheduled' ? 'Ombokning' : 'Nekad';

        result.push({
          id: `other-booking-${b.id}`,
          title: `[${otherAdminName}] ${coachName} – ${typeLabel}`,
          start: bStart,
          end: bEnd,
          allDay: false,
          resource: {
            type: b.status as 'pending' | 'accepted' | 'declined' | 'rescheduled',
            booking: b,
            color,
            isOwn: false,
          },
        });
      }
    }

    return result;
  }, [availabilities, bookings, allBookings, visibleAdminIds, adminColorMap, adminNameMap, adminId, SEVEN_DAYS_AGO]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (isBefore(startOfDay(start), today)) return;
    if (window.confirm(`Lägg till tillgänglighet: ${format(start, 'yyyy-MM-dd HH:mm')} – ${format(end, 'HH:mm')}?`)) {
=======
    return result;
  }, [availabilities, bookings, coachNameMap, SEVEN_DAYS_AGO]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (
      window.confirm(
        `Lägg till tillgänglighet: ${format(start, 'yyyy-MM-dd HH:mm')} – ${format(end, 'HH:mm')}?`
      )
    ) {
>>>>>>> 1e58298 (Improvements to the bookin feature)
      addAvailability({ adminId, startTime: start, endTime: end }).then(load);
    }
  };

  const handleSelectEvent = (event: ScheduleEvent) => {
<<<<<<< HEAD
    if (event.resource.type === 'availability') {
      const avail = event.resource.availability;
      if (!avail || !event.resource.isOwn) return;
      if (isBefore(startOfDay(new Date(avail.startTime)), today)) return;

      setSelectedAvailability(avail);
      const s = new Date(avail.startTime);
      const e = new Date(avail.endTime);
      setEditAvailStartHour(s.getHours());
      setEditAvailStartMinute(s.getMinutes());
      setEditAvailEndHour(e.getHours());
      setEditAvailEndMinute(e.getMinutes());
      setShowEditAvailDialog(true);
      return;
    }

    if (event.resource.booking && event.resource.isOwn) {
      setSelectedBooking(event.resource.booking);
      setBookingDialogMode('view');
      setBookingReason('');
      setShowBookingDialog(true);
    }
  };

  const handleStatusUpdate = async (status: 'accepted' | 'declined') => {
    if (!selectedBooking) return;
    try {
      await updateBookingStatus(selectedBooking.id, status, bookingReason || undefined);
      toast({ title: status === 'accepted' ? 'Godkänd' : 'Nekad' });
      setShowBookingDialog(false);
      setSelectedBooking(null);
      setBookingReason('');
      load();
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte uppdatera status.', variant: 'destructive' });
    }
  };

  const handleCancelAccepted = async () => {
    if (!selectedBooking) return;
    try {
      await cancelBooking(selectedBooking.id, bookingReason || undefined);
      toast({ title: 'Avbokad' });
      setShowBookingDialog(false);
      setSelectedBooking(null);
      setBookingReason('');
      load();
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte avboka.', variant: 'destructive' });
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking) return;
    const base = new Date(selectedBooking.startTime);
    const newStart = new Date(base.getFullYear(), base.getMonth(), base.getDate(), rescheduleStart.hour, rescheduleStart.minute);
    const newEnd = new Date(base.getFullYear(), base.getMonth(), base.getDate(), rescheduleEnd.hour, rescheduleEnd.minute);
    try {
      await rescheduleBooking(
        selectedBooking.id,
        format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
        format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
        bookingReason || undefined,
        'admin'
      );
      toast({ title: 'Ombokning skickad', description: 'Ny tid sparad. Coachen behöver godkänna den nya tiden.' });
      setShowBookingDialog(false);
      setBookingDialogMode('view');
      setBookingReason('');
      load();
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte omboka.', variant: 'destructive' });
    }
  };

  const handleSaveAvailability = async () => {
    if (!selectedAvailability) return;
    const base = new Date(selectedAvailability.startTime);
    const newStart = new Date(base.getFullYear(), base.getMonth(), base.getDate(), editAvailStartHour, editAvailStartMinute);
    const newEnd = new Date(base.getFullYear(), base.getMonth(), base.getDate(), editAvailEndHour, editAvailEndMinute);
    if (newStart >= newEnd) {
      toast({ title: 'Fel', description: 'Starttid måste vara före sluttid.', variant: 'destructive' });
      return;
    }
    if (editAvailConstraints) {
      const newStartTotal = editAvailStartHour * 60 + editAvailStartMinute;
      const newEndTotal = editAvailEndHour * 60 + editAvailEndMinute;
      if (newStartTotal > editAvailConstraints.maxStartTotal || newEndTotal < editAvailConstraints.minEndTotal) {
        toast({ title: 'Fel', description: 'Det nya tidsfönstret täcker inte alla godkända bokningar.', variant: 'destructive' });
        return;
      }
    }
    try {
      await updateAvailability({
        id: selectedAvailability.id,
        startTime: format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
        isBooked: false,
      });
      toast({ title: 'Sparad' });
      setShowEditAvailDialog(false);
      setSelectedAvailability(null);
      load();
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte uppdatera tillgängligheten.', variant: 'destructive' });
    }
  };

  const handleDeleteAvailability = async () => {
    if (!selectedAvailability) return;
    if (!window.confirm('Är du säker på att du vill ta bort denna tillgänglighet?')) return;
    try {
      await deleteAvailability(selectedAvailability.id);
      toast({ title: 'Borttagen' });
      setShowEditAvailDialog(false);
      setSelectedAvailability(null);
      load();
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte ta bort tillgängligheten.', variant: 'destructive' });
    }
  };

  const submitAppointment = async (coachId: number, startTime: string, endTime: string, note: string, force = false) => {
    await createAdminAppointment({
      coachId,
      note,
      meetingType: 'intro',
      startTime,
      endTime,
      force,
    });
    toast({ title: 'Möte skickat', description: 'Coachen behöver godkänna mötet.' });
    setShowAppointmentDialog(false);
    setAppointCoachId(null);
    setAppointDay('');
    setAppointNote('');
    load();
  };

  const handleCreateAppointment = async () => {
    if (!appointCoachId || !appointDay) {
      toast({ title: 'Fel', description: 'Välj coach och dag.', variant: 'destructive' });
      return;
    }
    const dayDate = new Date(appointDay);
    const startTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), appointStartHour, appointStartMinute);
    const endTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), appointEndHour, appointEndMinute);
    if (startTime >= endTime) {
      toast({ title: 'Fel', description: 'Starttid måste vara före sluttid.', variant: 'destructive' });
      return;
    }
    const startIso = format(startTime, "yyyy-MM-dd'T'HH:mm:ss");
    const endIso = format(endTime, "yyyy-MM-dd'T'HH:mm:ss");
    try {
      await submitAppointment(appointCoachId, startIso, endIso, appointNote);
    } catch (err) {
      const conflictErr = err as BookingConflictError;
      if (conflictErr.conflictData?.type === 'conflict') {
        setConflictErrorBookings(conflictErr.conflictData.bookings);
        setShowConflictError(true);
      } else if (conflictErr.conflictData?.type === 'warning') {
        setPendingAppointmentData({ coachId: appointCoachId, startTime: startIso, endTime: endIso, note: appointNote });
        setConflictWarningBookings(conflictErr.conflictData.bookings);
        setShowConflictWarning(true);
      } else {
        toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte boka mötet.', variant: 'destructive' });
      }
    }
  };

  const handleConfirmConflictWarning = async () => {
    if (!pendingAppointmentData) return;
    setShowConflictWarning(false);
    try {
      await submitAppointment(pendingAppointmentData.coachId, pendingAppointmentData.startTime, pendingAppointmentData.endTime, pendingAppointmentData.note, true);
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte boka mötet.', variant: 'destructive' });
    } finally {
      setPendingAppointmentData(null);
      setConflictWarningBookings([]);
    }
  };

  const toggleVisibleAdmin = (id: number) => {
    setVisibleAdminIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const eventStyleGetter = (event: ScheduleEvent) => {
    const isOwn = event.resource.isOwn !== false;
    const base = { borderRadius: '6px', border: 'none', padding: '2px 6px', cursor: isOwn ? 'pointer' : 'default' };

    // Other admins' bookings: use their admin color with reduced opacity
    if (!isOwn && event.resource.type !== 'availability') {
      const color = event.resource.color || '#6b7280';
      return { style: { ...base, backgroundColor: color, color: '#fff', opacity: 0.5, border: '2px dashed rgba(255,255,255,0.5)' } };
    }

    switch (event.resource.type) {
      case 'availability': {
        const color = event.resource.color || '#2563eb';
        return { style: { ...base, backgroundColor: color, color: '#fff' } };
      }
      case 'pending':
        return { style: { ...base, backgroundColor: '#f59e0b', color: '#fff', opacity: 0.75 } };
      case 'rescheduled':
        return { style: { ...base, backgroundColor: '#8b5cf6', color: '#fff', opacity: 0.9 } };
      case 'accepted':
        return { style: { ...base, backgroundColor: '#22c55e', color: '#fff' } };
      case 'declined':
        return {
          style: { ...base, backgroundColor: '#ef4444', color: '#fff', opacity: 0.6 },
          className: 'rbc-event--declined',
        };
      default:
        return {};
    }
  };

  const dayPropGetter = (date: Date) => {
    if (isBefore(startOfDay(date), today)) return { className: 'rbc-day--past' };
    return {};
  };

  const weekStart = startOfWeek(currentDate, { locale: sv });
  const weekEnd = addDays(weekStart, 3);

  const rescheduleOptions = useMemo(() => {
    if (!selectedBooking) return ALL_TIME_OPTIONS;
    const avail = availabilities.find((a) => a.id === selectedBooking.adminAvailabilityId);
    if (!avail) return ALL_TIME_OPTIONS;
    const aStart = new Date(avail.startTime);
    const aEnd = new Date(avail.endTime);
    return ALL_TIME_OPTIONS.filter((o) => {
      const total = o.hour * 60 + o.minute;
      return total >= aStart.getHours() * 60 + aStart.getMinutes() &&
             total <= aEnd.getHours() * 60 + aEnd.getMinutes();
    });
  }, [selectedBooking, availabilities]);

  const rescheduleEndOptions = useMemo(() => {
    const startTotal = rescheduleStart.hour * 60 + rescheduleStart.minute;
    return rescheduleOptions.filter((o) => o.hour * 60 + o.minute > startTotal);
  }, [rescheduleOptions, rescheduleStart]);

  const isBookingInPast = (b: Booking) => isBefore(startOfDay(new Date(b.startTime)), today);

  // For the edit-availability dialog: the new window must contain all accepted bookings.
  // Compute the earliest accepted booking start and latest accepted booking end for the selected availability.
  const editAvailConstraints = useMemo(() => {
    if (!selectedAvailability) return null;
    const accepted = bookings.filter(
      (b) => b.adminAvailabilityId === selectedAvailability.id && b.status === 'accepted'
    );
    if (accepted.length === 0) return null;
    const earliestStart = Math.min(...accepted.map((b) => {
      const d = new Date(b.startTime);
      return d.getHours() * 60 + d.getMinutes();
    }));
    const latestEnd = Math.max(...accepted.map((b) => {
      const d = new Date(b.endTime);
      return d.getHours() * 60 + d.getMinutes();
    }));
    return { maxStartTotal: earliestStart, minEndTotal: latestEnd };
  }, [selectedAvailability, bookings]);
=======
    if (event.resource.booking) {
      setSelectedBooking(event.resource.booking);
      setShowBookingDialog(true);
    }
  };

  const handleStatusUpdate = async (status: 'accepted' | 'declined') => {
    if (!selectedBooking) return;
    try {
      await updateBookingStatus(selectedBooking.id, status);
      toast({ title: status === 'accepted' ? 'Godkänd' : 'Nekad', description: `Bokningen har ${status === 'accepted' ? 'godkänts' : 'nekats'}.` });
      setShowBookingDialog(false);
      setSelectedBooking(null);
      load();
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte uppdatera status.', variant: 'destructive' });
    }
  };

  const eventStyleGetter = (event: ScheduleEvent) => {
    const base = { borderRadius: '6px', border: 'none', padding: '2px 6px', cursor: 'pointer' };
    switch (event.resource.type) {
      case 'availability':
        return { style: { ...base, backgroundColor: '#2563eb', color: '#fff' } };
      case 'pending':
        return { style: { ...base, backgroundColor: '#f59e0b', color: '#fff' } };
      case 'accepted':
        return { style: { ...base, backgroundColor: '#22c55e', color: '#fff' } };
      case 'declined':
        return {
          style: { ...base, backgroundColor: '#ef4444', color: '#fff', opacity: 0.7 },
          className: 'rbc-event--declined',
        };
      default:
        return {};
    }
  };

  const weekStart = startOfWeek(currentDate, { locale: sv });
  const weekEnd = addDays(weekStart, 3); // Mon-Thu
>>>>>>> 1e58298 (Improvements to the bookin feature)

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Card className="bg-card space-y-6 p-6">
        <section>
          <div>
<<<<<<< HEAD
            <h2 className="font-display text-2xl font-bold text-foreground">Veckoschema &amp; Bokningar</h2>
=======
            <h2 className="font-display text-2xl font-bold text-foreground">
              Veckoschema &amp; Bokningar
            </h2>
>>>>>>> 1e58298 (Improvements to the bookin feature)
            <p className="text-muted-foreground text-sm mt-1">
              Klicka på en tom tid i kalendern för att lägga till tillgänglighet.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 mb-4">
<<<<<<< HEAD
            <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>← Föregående vecka</Button>
            <span className="text-sm font-semibold text-foreground min-w-[100px] text-center">
              {format(weekStart, 'd/M')} – {format(weekEnd, 'd/M')}
            </span>
            <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>Nästa vecka →</Button>
            <Button onClick={() => setShowAppointmentDialog(true)} className="ml-4">
              <Plus className="h-4 w-4 mr-1" /> Boka möte
=======
            <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
              ← Föregående vecka
            </Button>
            <span className="text-sm font-semibold text-foreground min-w-[100px] text-center">
              {format(weekStart, 'd/M')} – {format(weekEnd, 'd/M')}
            </span>
            <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
              Nästa vecka →
>>>>>>> 1e58298 (Improvements to the bookin feature)
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
<<<<<<< HEAD
            {allAdmins.map((admin) => {
              const color = adminColorMap.get(admin.id) || '#6b7280';
              return (
                <div key={admin.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                  <span>{admin.firstName} {admin.lastName}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b', opacity: 0.75 }} />
              <span>Förfrågan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6', opacity: 0.9 }} />
              <span>Ombokning</span>
=======
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2563eb' }} />
              <span>Tillgänglig</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
              <span>Förfrågan</span>
>>>>>>> 1e58298 (Improvements to the bookin feature)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span>Godkänd</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span>Nekad</span>
            </div>
          </div>

<<<<<<< HEAD
          {allAdmins.length > 1 && (
            <div className="flex flex-wrap gap-4 mb-4 text-sm items-center">
              <span className="text-muted-foreground font-medium">Visa bokningar:</span>
              {allAdmins.filter((a) => a.id !== adminId).map((admin) => {
                const color = adminColorMap.get(admin.id) || '#6b7280';
                return (
                  <label key={admin.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={visibleAdminIds.has(admin.id)}
                      onCheckedChange={() => toggleVisibleAdmin(admin.id)}
                    />
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: color, opacity: 0.5, border: '1px dashed rgba(0,0,0,0.3)' }} />
                    <span>{admin.firstName} {admin.lastName}</span>
                  </label>
                );
              })}
            </div>
          )}

=======
>>>>>>> 1e58298 (Improvements to the bookin feature)
          <div style={{ height: 600 }}>
            {/* @ts-expect-error custom fourDay view not in type defs */}
            <Calendar<ScheduleEvent>
              localizer={localizer}
              className="booking-calendar--workhours"
              events={events}
              startAccessor={(e) => e.start}
              endAccessor={(e) => e.end}
              titleAccessor={(e) => e.title}
              defaultView="fourDay"
              views={{ fourDay: FourDayView as never }}
              step={30}
              timeslots={1}
              toolbar={false}
              min={new Date(1970, 0, 1, WORKDAY_START_HOUR, 0, 0)}
              max={new Date(1970, 0, 1, WORKDAY_END_HOUR, 0, 0)}
              date={currentDate}
              onNavigate={setCurrentDate}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
<<<<<<< HEAD
              dayPropGetter={dayPropGetter}
              formats={{
                timeGutterFormat: 'HH:mm',
                dayFormat: (date: Date) => `${DAY_NAMES[getDay(date)] || ''} ${format(date, 'd/M')}`,
=======
              formats={{
                timeGutterFormat: 'HH:mm',
                dayFormat: (date: Date) => `${DAY_NAMES[getDay(date)] || ''} ${format(date, 'd/M')}`,
              }}
              messages={{
                today: 'Idag',
                next: 'Nästa',
                previous: 'Föregående',
                month: 'Månad',
                week: 'Vecka',
                day: 'Dag',
>>>>>>> 1e58298 (Improvements to the bookin feature)
              }}
              messages={{ today: 'Idag', next: 'Nästa', previous: 'Föregående', month: 'Månad', week: 'Vecka', day: 'Dag' }}
            />
          </div>
        </section>
      </Card>

      {/* Booking details dialog */}
<<<<<<< HEAD
      <Dialog open={showBookingDialog} onOpenChange={(open) => { setShowBookingDialog(open); if (!open) setBookingDialogMode('view'); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bookingDialogMode === 'reschedule' ? 'Ändra tid' :
                selectedBooking?.status === 'pending' ? 'Bokningsförfrågan' :
                selectedBooking?.status === 'rescheduled' ? 'Ombokning – svar krävs' :
                selectedBooking?.status === 'accepted' ? 'Godkänd bokning' : 'Nekad bokning'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 mt-2">
                {selectedBooking && bookingDialogMode === 'view' && (
                  <>
                    <p><strong>Coach:</strong> {adminNameMap.get(selectedBooking.coachId) || `ID ${selectedBooking.coachId}`}</p>
                    <p>
                      <strong>Tid:</strong>{' '}
                      {format(new Date(selectedBooking.startTime), 'yyyy-MM-dd HH:mm')} – {format(new Date(selectedBooking.endTime), 'HH:mm')}
                    </p>
                    <p><strong>Mötestyp:</strong> {selectedBooking.meetingType === 'intro' ? 'Intromöte' : 'Uppföljningsmöte'}</p>
                    {selectedBooking.studentId && (
                      <p><strong>Student:</strong> {adminNameMap.get(selectedBooking.studentId) || `ID ${selectedBooking.studentId}`}</p>
                    )}
                    {selectedBooking.note && <p><strong>Meddelande:</strong> {selectedBooking.note}</p>}
                    {selectedBooking.reason && <p><strong>Anledning:</strong> {selectedBooking.reason}</p>}
                    <p className="text-xs text-muted-foreground">Bokad: {format(new Date(selectedBooking.bookedAt), 'yyyy-MM-dd HH:mm')}</p>
=======
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBooking?.status === 'pending' ? 'Bokningsförfrågan' : selectedBooking?.status === 'accepted' ? 'Godkänd bokning' : 'Nekad bokning'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 mt-2">
                {selectedBooking && (
                  <>
                    <p>
                      <strong>Coach:</strong> {coachNameMap.get(selectedBooking.coachId) || `ID ${selectedBooking.coachId}`}
                    </p>
                    <p>
                      <strong>Tid:</strong>{' '}
                      {format(new Date(selectedBooking.startTime), 'yyyy-MM-dd HH:mm')} –{' '}
                      {format(new Date(selectedBooking.endTime), 'HH:mm')}
                    </p>
                    <p>
                      <strong>Mötestyp:</strong>{' '}
                      {selectedBooking.meetingType === 'intro' ? 'Intromöte' : 'Uppföljningsmöte'}
                    </p>
                    {selectedBooking.studentId && (
                      <p>
                        <strong>Student:</strong>{' '}
                        {coachNameMap.get(selectedBooking.studentId) || `ID ${selectedBooking.studentId}`}
                      </p>
                    )}
                    {selectedBooking.note && (
                      <p>
                        <strong>Meddelande:</strong> {selectedBooking.note}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Bokad: {format(new Date(selectedBooking.bookedAt), 'yyyy-MM-dd HH:mm')}
                    </p>
>>>>>>> 1e58298 (Improvements to the bookin feature)
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
<<<<<<< HEAD

          {bookingDialogMode === 'reschedule' && selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Starttid</Label>
                <Select
                  value={`${rescheduleStart.hour}:${rescheduleStart.minute}`}
                  onValueChange={(val) => {
                    const [h, m] = val.split(':').map(Number);
                    setRescheduleStart({ hour: h, minute: m });
                    const newTotal = h * 60 + m;
                    if (rescheduleEnd.hour * 60 + rescheduleEnd.minute <= newTotal) {
                      const next = rescheduleOptions.find((o) => o.hour * 60 + o.minute > newTotal);
                      if (next) setRescheduleEnd({ hour: next.hour, minute: next.minute });
                    }
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {rescheduleOptions.slice(0, -1).map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sluttid</Label>
                <Select
                  value={`${rescheduleEnd.hour}:${rescheduleEnd.minute}`}
                  onValueChange={(val) => { const [h, m] = val.split(':').map(Number); setRescheduleEnd({ hour: h, minute: m }); }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {rescheduleEndOptions.map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Anledning (valfritt)</Label>
                <Textarea
                  placeholder="Ange anledning till tidsändringen..."
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {bookingDialogMode === 'view' && selectedBooking?.status === 'accepted' && !isBookingInPast(selectedBooking) && (
            <div className="space-y-2 pt-2">
              <Label>Anledning (valfritt)</Label>
              <Textarea
                placeholder="Ange anledning till ändringen..."
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {bookingDialogMode === 'view' && selectedBooking?.status === 'rescheduled' && selectedBooking.rescheduledBy === 'coach' && !isBookingInPast(selectedBooking) && (
            <div className="space-y-2 pt-2">
              <Label>Anledning (valfritt)</Label>
              <Textarea
                placeholder="Ange anledning till ditt svar..."
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {bookingDialogMode === 'view' && selectedBooking?.status === 'pending' && !isBookingInPast(selectedBooking) && (
            <div className="space-y-2 pt-2">
              <Label>Anledning (valfritt)</Label>
              <Textarea
                placeholder="Ange anledning till nekande..."
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                rows={2}
              />
            </div>
          )}

          <DialogFooter>
            {bookingDialogMode === 'reschedule' ? (
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline" onClick={() => setBookingDialogMode('view')}>Tillbaka</Button>
                <Button onClick={handleReschedule}>Spara tid</Button>
              </div>
            ) : selectedBooking?.status === 'pending' ? (
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate('declined')}>
                  <X className="h-4 w-4 mr-1" /> Neka
                </Button>
                <Button variant="outline" onClick={() => {
                  const s = new Date(selectedBooking.startTime);
                  const e = new Date(selectedBooking.endTime);
                  setRescheduleStart({ hour: s.getHours(), minute: s.getMinutes() });
                  setRescheduleEnd({ hour: e.getHours(), minute: e.getMinutes() });
                  setBookingDialogMode('reschedule');
                }}>
                  Föreslå annan tid
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate('accepted')}>
                  <Check className="h-4 w-4 mr-1" /> Godkänn
                </Button>
              </div>
            ) : selectedBooking?.status === 'rescheduled' && selectedBooking.rescheduledBy === 'coach' && !isBookingInPast(selectedBooking) ? (
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate('declined')}>
                  <X className="h-4 w-4 mr-1" /> Neka
                </Button>
                <Button variant="outline" onClick={() => {
                  const s = new Date(selectedBooking.startTime);
                  const e = new Date(selectedBooking.endTime);
                  setRescheduleStart({ hour: s.getHours(), minute: s.getMinutes() });
                  setRescheduleEnd({ hour: e.getHours(), minute: e.getMinutes() });
                  setBookingDialogMode('reschedule');
                }}>
                  Föreslå annan tid
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate('accepted')}>
                  <Check className="h-4 w-4 mr-1" /> Godkänn
                </Button>
              </div>
            ) : selectedBooking?.status === 'accepted' && !isBookingInPast(selectedBooking) ? (
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleCancelAccepted}>
                  <X className="h-4 w-4 mr-1" /> Avboka
                </Button>
                <Button variant="outline" onClick={() => {
                  const s = new Date(selectedBooking.startTime);
                  const e = new Date(selectedBooking.endTime);
                  setRescheduleStart({ hour: s.getHours(), minute: s.getMinutes() });
                  setRescheduleEnd({ hour: e.getHours(), minute: e.getMinutes() });
                  setBookingDialogMode('reschedule');
                }}>
                  Ändra tid
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>Stäng</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit availability dialog */}
      <Dialog open={showEditAvailDialog} onOpenChange={setShowEditAvailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redigera tillgänglighet</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-1">
                {selectedAvailability && (
                  <p className="text-sm">{format(new Date(selectedAvailability.startTime), 'yyyy-MM-dd')}</p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editAvailConstraints && (
              <p className="text-xs text-muted-foreground">
                Det finns godkända bokningar inom detta pass. Starttid kan vara senast {
                  `${Math.floor(editAvailConstraints.maxStartTotal / 60).toString().padStart(2, '0')}:${(editAvailConstraints.maxStartTotal % 60).toString().padStart(2, '0')}`
                } och sluttid minst {
                  `${Math.floor(editAvailConstraints.minEndTotal / 60).toString().padStart(2, '0')}:${(editAvailConstraints.minEndTotal % 60).toString().padStart(2, '0')}`
                }.
              </p>
            )}
            <div className="space-y-2">
              <Label>Starttid</Label>
              <Select
                value={`${editAvailStartHour}:${editAvailStartMinute}`}
                onValueChange={(val) => {
                  const [h, m] = val.split(':').map(Number);
                  setEditAvailStartHour(h); setEditAvailStartMinute(m);
                  const newTotal = h * 60 + m;
                  if (editAvailEndHour * 60 + editAvailEndMinute <= newTotal) {
                    const next = ALL_TIME_OPTIONS.find((o) => o.hour * 60 + o.minute > newTotal);
                    if (next) { setEditAvailEndHour(next.hour); setEditAvailEndMinute(next.minute); }
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TIME_OPTIONS.slice(0, -1)
                    .filter((o) => !editAvailConstraints || o.hour * 60 + o.minute <= editAvailConstraints.maxStartTotal)
                    .map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sluttid</Label>
              <Select
                value={`${editAvailEndHour}:${editAvailEndMinute}`}
                onValueChange={(val) => { const [h, m] = val.split(':').map(Number); setEditAvailEndHour(h); setEditAvailEndMinute(m); }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TIME_OPTIONS
                    .filter((o) => {
                      const total = o.hour * 60 + o.minute;
                      return total > editAvailStartHour * 60 + editAvailStartMinute &&
                             (!editAvailConstraints || total >= editAvailConstraints.minEndTotal);
                    })
                    .map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-3 w-full justify-between">
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={handleDeleteAvailability}
                disabled={!!editAvailConstraints}
                title={editAvailConstraints ? 'Kan inte ta bort: det finns godkända bokningar' : undefined}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Ta bort
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEditAvailDialog(false)}>Avbryt</Button>
                <Button onClick={handleSaveAvailability}>Spara</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Standalone appointment dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Boka möte med coach</DialogTitle>
            <DialogDescription>
              Välj coach, dag och tid för mötet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Coach</Label>
              <Select
                value={appointCoachId?.toString() || ''}
                onValueChange={(val) => setAppointCoachId(Number(val))}
              >
                <SelectTrigger><SelectValue placeholder="Välj coach..." /></SelectTrigger>
                <SelectContent>
                  {coaches.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dag</Label>
              <Select value={appointDay} onValueChange={setAppointDay}>
                <SelectTrigger><SelectValue placeholder="Välj dag..." /></SelectTrigger>
                <SelectContent>
                  {fourDayRange(currentDate)
                    .filter((d) => !isBefore(startOfDay(d), today))
                    .map((d) => (
                      <SelectItem key={d.toISOString()} value={d.toISOString()}>
                        {DAY_NAMES[getDay(d)]} {format(d, 'd/M')}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Starttid</Label>
              <Select
                value={`${appointStartHour}:${appointStartMinute}`}
                onValueChange={(val) => {
                  const [h, m] = val.split(':').map(Number);
                  setAppointStartHour(h); setAppointStartMinute(m);
                  const newTotal = h * 60 + m;
                  if (appointEndHour * 60 + appointEndMinute <= newTotal) {
                    const next = ALL_TIME_OPTIONS.find((o) => o.hour * 60 + o.minute > newTotal);
                    if (next) { setAppointEndHour(next.hour); setAppointEndMinute(next.minute); }
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TIME_OPTIONS.slice(0, -1)
                    .filter((o) => o.hour * 60 + o.minute >= 9 * 60)
                    .map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sluttid</Label>
              <Select
                value={`${appointEndHour}:${appointEndMinute}`}
                onValueChange={(val) => { const [h, m] = val.split(':').map(Number); setAppointEndHour(h); setAppointEndMinute(m); }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TIME_OPTIONS
                    .filter((o) => {
                      const total = o.hour * 60 + o.minute;
                      return total > appointStartHour * 60 + appointStartMinute && total <= 15 * 60 + 30;
                    })
                    .map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meddelande (valfritt)</Label>
              <Textarea
                placeholder="Lägg till ett meddelande..."
                value={appointNote}
                onChange={(e) => setAppointNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>Avbryt</Button>
            <Button onClick={handleCreateAppointment}>Boka</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Hard-conflict error dialog (accepted bookings — cannot proceed) */}
      <Dialog open={showConflictError} onOpenChange={(open) => { setShowConflictError(open); if (!open) setConflictErrorBookings([]); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tidskollision</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 mt-2">
                <p>Det finns redan godkända möten den här tiden:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {conflictErrorBookings.map((b) => (
                    <li key={b.id}>
                      {format(new Date(b.startTime), 'yyyy-MM-dd HH:mm')}–{format(new Date(b.endTime), 'HH:mm')}
                      {' '}– {adminNameMap.get(b.coachId) || `Coach ${b.coachId}`}
                    </li>
                  ))}
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowConflictError(false); setConflictErrorBookings([]); }}>Stäng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending-conflict warning dialog */}
      <Dialog open={showConflictWarning} onOpenChange={(open) => { setShowConflictWarning(open); if (!open) { setPendingAppointmentData(null); setConflictWarningBookings([]); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Väntande möten kolliderar</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 mt-2">
                <p>Det finns redan väntande möten den här tiden:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {conflictWarningBookings.map((b) => (
                    <li key={b.id}>
                      {format(new Date(b.startTime), 'yyyy-MM-dd HH:mm')}–{format(new Date(b.endTime), 'HH:mm')}
                      {' '}– {adminNameMap.get(b.coachId) || `Coach ${b.coachId}`}
                    </li>
                  ))}
                </ul>
                <p>Vill du fortsätta ändå?</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowConflictWarning(false); setPendingAppointmentData(null); setConflictWarningBookings([]); }}>Avbryt</Button>
            <Button onClick={handleConfirmConflictWarning}>Fortsätt</Button>
=======
          <DialogFooter>
            {selectedBooking?.status === 'pending' ? (
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => handleStatusUpdate('declined')}
                >
                  <X className="h-4 w-4 mr-1" /> Neka
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusUpdate('accepted')}
                >
                  <Check className="h-4 w-4 mr-1" /> Godkänn
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Stäng
              </Button>
            )}
>>>>>>> 1e58298 (Improvements to the bookin feature)
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminSchedule;
