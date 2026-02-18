import React, { useEffect, useMemo, useState } from 'react';
<<<<<<< HEAD
import {
  Calendar,
  dateFnsLocalizer,
  type NavigateAction,
} from 'react-big-calendar';
import {
  addDays,
  addWeeks,
  format,
  getDay,
  isBefore,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
=======
import { Calendar, dateFnsLocalizer, type NavigateAction } from 'react-big-calendar';
import { addDays, addWeeks, format, getDay, isBefore, startOfWeek, subWeeks } from 'date-fns';
>>>>>>> 1e58298 (Improvements to the bookin feature)
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/components/admin/BookingCalendar.css';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
<<<<<<< HEAD
import {
  bookAvailability,
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus,
  getAvailabilities,
  getAvailabilityById,
  getVisibleBookings,
  type Availability,
  type Booking,
} from '@/api/BookingService';
=======
import { bookAvailability, getAvailabilities, getVisibleBookings, type Availability, type Booking } from '@/api/BookingService';
>>>>>>> 1e58298 (Improvements to the bookin feature)
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';

const WORKDAY_START_HOUR = 8;
const WORKDAY_END_HOUR = 15;

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) =>
    format(date, formatStr, { locale: sv }),
  parse: (value: string) => new Date(value),
  startOfWeek: () => startOfWeek(new Date(), { locale: sv }),
  getDay: (date: Date) => getDay(date),
  locales: { sv },
});

const ADMIN_COLORS = [
  '#2563eb',
  '#c6a04a',
  '#b45309',
  '#be123c',
  '#4338ca',
  '#0369a1',
  '#8b5cf6',
  '#7c2d12',
];
const DAY_NAMES = ['', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

function fourDayRange(date: Date) {
  const start = startOfWeek(date, { locale: sv });
  return [start, addDays(start, 1), addDays(start, 2), addDays(start, 3)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class FourDayView extends React.Component<any> {
  render() {
    const {
      date,
      localizer: loc,
      min,
      max,
      scrollToTime,
      enableAutoScroll,
      ...props
    } = this.props;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FourDayView as any).range = fourDayRange;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FourDayView as any).navigate = (date: Date, action: NavigateAction) => {
  switch (action) {
    case 'PREV':
      return addDays(date, -7);
    case 'NEXT':
      return addDays(date, 7);
    default:
      return date;
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FourDayView as any).title = () => '';

const DAY_NAMES = ['', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

// Custom 4-day view (Mon–Thu)
function fourDayRange(date: Date) {
  const start = startOfWeek(date, { locale: sv });
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

// Static methods required by react-big-calendar
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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    type: 'free' | 'my-booking' | 'other-booking';
    availability?: Availability;
    booking?: Booking;
    adminId: number;
    adminName: string;
    color: string;
    freeStart?: Date;
    freeEnd?: Date;
  };
}

const isWithinWorkHours = (start: Date, end: Date) => {
  const s = start.getHours() * 60 + start.getMinutes();
  const e = end.getHours() * 60 + end.getMinutes();
  return (
    s >= WORKDAY_START_HOUR * 60 && e <= WORKDAY_END_HOUR * 60 && start < end
  );
};

/** Subtract only accepted bookings — pending/declined stay as overlays */
function getFreeSegments(
  avail: Availability,
  bookings: Booking[]
): { start: Date; end: Date }[] {
  const aStart = new Date(avail.startTime);
  const aEnd = new Date(avail.endTime);

  const sorted = bookings
<<<<<<< HEAD
    .filter(
      (b) => b.adminAvailabilityId === avail.id && b.status === 'accepted'
    )
=======
    .filter((b) => b.adminAvailabilityId === avail.id && b.status !== 'declined')
>>>>>>> 1e58298 (Improvements to the bookin feature)
    .map((b) => ({ start: new Date(b.startTime), end: new Date(b.endTime) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const segments: { start: Date; end: Date }[] = [];
  let cursor = aStart;
  for (const booking of sorted) {
    if (booking.start > cursor)
      segments.push({ start: cursor, end: booking.start });
    if (booking.end > cursor) cursor = booking.end;
  }
  if (cursor < aEnd) segments.push({ start: cursor, end: aEnd });
  return segments;
}

function generate30MinOptions(
  fromH: number,
  fromM: number,
  toH: number,
  toM: number
) {
  const opts: { hour: number; minute: number; label: string }[] = [];
  const fromTotal = fromH * 60 + fromM;
  const toTotal = toH * 60 + toM;
  for (let total = fromTotal; total <= toTotal; total += 30) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    opts.push({
      hour: h,
      minute: m,
      label: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
    });
  }
  return opts;
}

function CoachBookingView() {
  const { user } = useAuth();
  const { data: allUsers = [], isLoading: usersLoading } = useUsers();
  const { toast } = useToast();
  const coachId = user?.id || 0;

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // New booking dialog
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedFreeSlot, setSelectedFreeSlot] = useState<{
    availability: Availability;
    start: Date;
    end: Date;
  } | null>(null);
  const [note, setNote] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const [meetingType, setMeetingType] = useState<'intro' | 'followup' | null>(
    null
  );
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(9);
  const [endMinute, setEndMinute] = useState(0);

  // Booking details dialog
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [bookingDetailsMode, setBookingDetailsMode] = useState<
    'view' | 'reschedule'
  >('view');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState<{
    hour: number;
    minute: number;
  }>({ hour: 8, minute: 0 });
  const [rescheduleEnd, setRescheduleEnd] = useState<{
    hour: number;
    minute: number;
  }>({ hour: 9, minute: 0 });
  const [fetchedParentAvail, setFetchedParentAvail] =
    useState<Availability | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);

  const admins = useMemo(
    () => allUsers.filter((u) => u.authLevel <= 2 && u.isActive),
    [allUsers]
  );

  const adminColorMap = useMemo(() => {
    const map = new Map<number, string>();
    admins.forEach((admin, i) =>
      map.set(admin.id, ADMIN_COLORS[i % ADMIN_COLORS.length])
    );
    return map;
  }, [admins]);

  const adminNameMap = useMemo(() => {
    const map = new Map<number, string>();
    admins.forEach((admin) =>
      map.set(admin.id, `${admin.firstName} ${admin.lastName}`)
    );
    return map;
  }, [admins]);

  const students = useMemo(
    () =>
      allUsers.filter(
        (u) => u.authLevel === 4 && u.isActive && u.coachId === coachId
      ),
    [allUsers, coachId]
  );

  const studentNameMap = useMemo(() => {
    const map = new Map<number, string>();
    allUsers
      .filter((u) => u.authLevel === 4)
      .forEach((s) => map.set(s.id, `${s.firstName} ${s.lastName}`));
    return map;
  }, [allUsers]);

  const loadData = async () => {
    try {
      const [availData, bookingData] = await Promise.all([
        getAvailabilities(),
        getVisibleBookings(),
      ]);
      setAvailabilities(
<<<<<<< HEAD
        availData.filter((a: Availability) =>
          isWithinWorkHours(new Date(a.startTime), new Date(a.endTime))
        )
=======
        availData.filter((a: Availability) => {
          const start = new Date(a.startTime);
          const end = new Date(a.endTime);
          return isWithinWorkHours(start, end);
        })
>>>>>>> 1e58298 (Improvements to the bookin feature)
      );
      setBookings(bookingData);
    } catch {
      toast({
        title: 'Fel',
        description: 'Kunde inte ladda data.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDate]);
  useEffect(() => {
    const pollId = window.setInterval(loadData, 15000);
    return () => window.clearInterval(pollId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const events = useMemo((): CalendarEvent[] => {
    const result: CalendarEvent[] = [];

    for (const avail of availabilities) {
      const adminName =
        adminNameMap.get(avail.adminId) || `Admin ${avail.adminId}`;
      const color = adminColorMap.get(avail.adminId) || '#6b7280';
      const freeSegs = getFreeSegments(avail, bookings);

      for (let i = 0; i < freeSegs.length; i++) {
        const seg = freeSegs[i];
        if (!isWithinWorkHours(seg.start, seg.end)) continue;
        result.push({
          id: `free-${avail.id}-${i}`,
          title: `${adminName} - Tillgänglig`,
          start: seg.start,
          end: seg.end,
          allDay: false,
          resource: {
            type: 'free',
            availability: avail,
            adminId: avail.adminId,
            adminName,
            color,
            freeStart: seg.start,
            freeEnd: seg.end,
          },
        });
      }
    }

    for (const b of bookings) {
<<<<<<< HEAD
=======
      // Declined bookings from others are not shown
>>>>>>> 1e58298 (Improvements to the bookin feature)
      if (b.status === 'declined' && b.coachId !== coachId) continue;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      if (!isWithinWorkHours(bStart, bEnd)) continue;

      const isOwn = b.coachId === coachId;
      const adminName = adminNameMap.get(b.adminId) || `Admin ${b.adminId}`;
      const color = adminColorMap.get(b.adminId) || '#6b7280';
      const titleMap: Record<string, string> = {
        pending: 'Inväntar svar',
        accepted: 'Godkänd',
        declined: 'Nekad',
        rescheduled: 'Ombokning – svar krävs',
      };

      const titleMap: Record<string, string> = {
        pending: 'Inväntar svar',
        accepted: 'Godkänd',
        declined: 'Nekad',
      };

      result.push({
        id: `booking-${b.id}`,
        title: isOwn ? titleMap[b.status] || 'Din bokning' : 'Bokad',
        start: bStart,
        end: bEnd,
        allDay: false,
        resource: {
          type: isOwn ? 'my-booking' : 'other-booking',
          booking: b,
          adminId: b.adminId,
          adminName,
          color,
        },
      });
    }

    return result;
  }, [availabilities, bookings, adminNameMap, adminColorMap, coachId]);

<<<<<<< HEAD
  const openBookingDialog = (
    avail: Availability,
    freeStart: Date,
    freeEnd: Date,
    clickedTime: Date
  ) => {
    if (isBefore(startOfDay(freeStart), today)) return;

    const freeStartTotal = freeStart.getHours() * 60 + freeStart.getMinutes();
    const freeEndTotal = freeEnd.getHours() * 60 + freeEnd.getMinutes();
    const totalMinutes = clickedTime.getHours() * 60 + clickedTime.getMinutes();
    const snapped = Math.floor(totalMinutes / 30) * 30;
    const startTotal = Math.max(
      freeStartTotal,
      Math.min(snapped, freeEndTotal - 30)
    );
    const endTotal = Math.min(startTotal + 30, freeEndTotal);

    setSelectedFreeSlot({
      availability: avail,
      start: freeStart,
      end: freeEnd,
    });
=======
  const openBookingDialog = (avail: Availability, freeStart: Date, freeEnd: Date, clickedTime: Date) => {
    const freeStartTotal = freeStart.getHours() * 60 + freeStart.getMinutes();
    const freeEndTotal = freeEnd.getHours() * 60 + freeEnd.getMinutes();

    // Snap clicked time down to nearest 30-min boundary
    const totalMinutes = clickedTime.getHours() * 60 + clickedTime.getMinutes();
    const snapped = Math.floor(totalMinutes / 30) * 30;

    const startTotal = Math.max(freeStartTotal, Math.min(snapped, freeEndTotal - 30));
    const endTotal = Math.min(startTotal + 30, freeEndTotal);

    setSelectedFreeSlot({ availability: avail, start: freeStart, end: freeEnd });
>>>>>>> 1e58298 (Improvements to the bookin feature)
    setStartHour(Math.floor(startTotal / 60));
    setStartMinute(startTotal % 60);
    setEndHour(Math.floor(endTotal / 60));
    setEndMinute(endTotal % 60);
    setShowBookingDialog(true);
    setNote('');
    setStudentId(null);
    setMeetingType(null);
  };

<<<<<<< HEAD
=======
  // Custom event component for free slots — intercepts click to get Y position → clicked time
>>>>>>> 1e58298 (Improvements to the bookin feature)
  const FreeEventComponent = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ({ event }: { event: any }) => {
      const calEvent = event as CalendarEvent;
<<<<<<< HEAD
      if (calEvent.resource.type !== 'free')
        return <span>{calEvent.title}</span>;
      const isPast = isBefore(
        startOfDay(calEvent.start),
        startOfDay(new Date())
      );

      const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPast) return;
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const fraction = Math.max(
          0,
          Math.min(1, (e.clientY - rect.top) / rect.height)
        );
        const freeStart = calEvent.resource.freeStart!;
        const freeEnd = calEvent.resource.freeEnd!;
        const durationMinutes =
          (freeEnd.getTime() - freeStart.getTime()) / 60000;
        const clickedTime = new Date(
          freeStart.getTime() + fraction * durationMinutes * 60000
        );
        openBookingDialog(
          calEvent.resource.availability!,
          freeStart,
          freeEnd,
          clickedTime
        );
      };

      return (
        <div
          onClick={handleClick}
          style={{
            height: '100%',
            width: '100%',
            cursor: isPast ? 'default' : 'pointer',
          }}
        >
=======
      if (calEvent.resource.type !== 'free') return <span>{calEvent.title}</span>;

      const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const fraction = Math.max(0, Math.min(1, relativeY / rect.height));

        const freeStart = calEvent.resource.freeStart!;
        const freeEnd = calEvent.resource.freeEnd!;
        const durationMinutes = (freeEnd.getTime() - freeStart.getTime()) / 60000;
        const clickedOffsetMinutes = fraction * durationMinutes;
        const clickedTime = new Date(freeStart.getTime() + clickedOffsetMinutes * 60000);

        openBookingDialog(calEvent.resource.availability!, freeStart, freeEnd, clickedTime);
      };

      return (
        <div onClick={handleClick} style={{ height: '100%', width: '100%', cursor: 'pointer' }}>
>>>>>>> 1e58298 (Improvements to the bookin feature)
          {calEvent.title}
        </div>
      );
    };
<<<<<<< HEAD
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (isBefore(startOfDay(start), today)) return;
    for (const avail of availabilities) {
      const freeSegs = getFreeSegments(avail, bookings);
      for (const seg of freeSegs) {
        if (
          start >= seg.start &&
          start < seg.end &&
          isWithinWorkHours(seg.start, seg.end)
        ) {
=======
  // openBookingDialog is stable (defined inline, depends on state setters only)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // Handles clicks on empty grid cells (not on events)
    for (const avail of availabilities) {
      const freeSegs = getFreeSegments(avail, bookings);
      for (const seg of freeSegs) {
        if (start >= seg.start && start < seg.end && isWithinWorkHours(seg.start, seg.end)) {
>>>>>>> 1e58298 (Improvements to the bookin feature)
          openBookingDialog(avail, seg.start, seg.end, start);
          return;
        }
      }
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
<<<<<<< HEAD
=======
    // Only handles non-free events (my-booking)
>>>>>>> 1e58298 (Improvements to the bookin feature)
    if (event.resource.type === 'my-booking' && event.resource.booking) {
      setSelectedBooking(event.resource.booking);
      setBookingDetailsMode('view');
      setActionReason('');
      setShowBookingDetails(true);
    }
  };

  const handleBook = async () => {
    if (!selectedFreeSlot || !coachId || !meetingType) return;
    if (meetingType === 'followup' && !studentId) {
      toast({
        title: 'Fel',
        description: 'Välj en student för uppföljningsmöte.',
        variant: 'destructive',
      });
      return;
    }
    const baseDate = selectedFreeSlot.start;
    const bookingStart = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      startHour,
      startMinute
    );
    const bookingEnd = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      endHour,
      endMinute
    );
    if (bookingStart >= bookingEnd) {
      toast({
        title: 'Fel',
        description: 'Starttid måste vara före sluttid.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await bookAvailability({
        adminAvailabilityId: selectedFreeSlot.availability.id,
        coachId,
        studentId: meetingType === 'intro' ? null : studentId,
        note,
        meetingType,
        startTime: format(bookingStart, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: format(bookingEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      toast({ title: 'Bokning skickad' });
      setShowBookingDialog(false);
      setSelectedFreeSlot(null);
      setNote('');
      setMeetingType(null);
      loadData();
    } catch {
      toast({
        title: 'Fel',
        description: 'Kunde inte boka tiden.',
        variant: 'destructive',
      });
      loadData();
    }
  };

  const handleCancelAccepted = async () => {
    if (!selectedBooking) return;
    try {
      await cancelBooking(selectedBooking.id, actionReason || undefined);
      toast({ title: 'Avbokad' });
      setShowBookingDetails(false);
      setActionReason('');
      loadData();
    } catch (err) {
      toast({ title: 'Fel', description: String(err), variant: 'destructive' });
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking) return;
    const base = new Date(selectedBooking.startTime);
    const newStart = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      rescheduleStart.hour,
      rescheduleStart.minute
    );
    const newEnd = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      rescheduleEnd.hour,
      rescheduleEnd.minute
    );
    try {
      await rescheduleBooking(
        selectedBooking.id,
        format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
        format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
        actionReason || undefined,
        'coach'
      );
      toast({
        title: 'Ombokning skickad',
        description: 'Ny tid sparad. Adminen behöver godkänna den nya tiden.',
      });
      setShowBookingDetails(false);
      setBookingDetailsMode('view');
      setActionReason('');
      loadData();
    } catch (err) {
      toast({ title: 'Fel', description: String(err), variant: 'destructive' });
    }
  };

  const handleAcceptReschedule = async () => {
    if (!selectedBooking) return;
    try {
      await updateBookingStatus(
        selectedBooking.id,
        'accepted',
        actionReason || undefined
      );
      toast({
        title: 'Tid godkänd',
        description: 'Den nya tiden är bekräftad.',
      });
      setShowBookingDetails(false);
      setActionReason('');
      loadData();
    } catch {
      toast({
        title: 'Fel',
        description: 'Kunde inte godkänna tiden.',
        variant: 'destructive',
      });
    }
  };

  const timeOptions = useMemo(() => {
    if (!selectedFreeSlot) return [];
    const slotStart = selectedFreeSlot.start;
    const slotEnd = selectedFreeSlot.end;
    const options: { hour: number; minute: number; label: string }[] = [];
    let cursor = new Date(slotStart);
    while (cursor <= slotEnd) {
      const h = cursor.getHours();
      const m = cursor.getMinutes();
      options.push({
        hour: h,
        minute: m,
        label: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
      });
      cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
    }
    return options;
  }, [selectedFreeSlot]);

  const endTimeOptions = useMemo(() => {
    const startTotal = startHour * 60 + startMinute;
    return timeOptions.filter((o) => o.hour * 60 + o.minute > startTotal);
  }, [timeOptions, startHour, startMinute]);

  const rescheduleOptions = useMemo(() => {
    if (!selectedBooking) return [];
    const avail =
      availabilities.find(
        (a) => a.id === selectedBooking.adminAvailabilityId
      ) ?? fetchedParentAvail;
    if (!avail) return [];
    const aStart = new Date(avail.startTime);
    const aEnd = new Date(avail.endTime);
    return generate30MinOptions(
      aStart.getHours(),
      aStart.getMinutes(),
      aEnd.getHours(),
      aEnd.getMinutes()
    );
  }, [selectedBooking, availabilities, fetchedParentAvail]);

  const rescheduleEndOptions = useMemo(() => {
    const startTotal = rescheduleStart.hour * 60 + rescheduleStart.minute;
    return rescheduleOptions.filter((o) => o.hour * 60 + o.minute > startTotal);
  }, [rescheduleOptions, rescheduleStart]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const base = {
      borderRadius: '6px',
      border: 'none',
      padding: '2px 6px',
      cursor: 'pointer',
    };
    if (event.resource.type === 'free') {
      return {
        style: {
          ...base,
          backgroundColor: event.resource.color || '#6b7280',
          color: '#fff',
        },
      };
    }
    if (event.resource.type === 'my-booking') {
      const status = event.resource.booking?.status;
<<<<<<< HEAD
      const colorMap: Record<string, string> = {
        pending: '#f59e0b',
        accepted: '#22c55e',
        declined: '#ef4444',
        rescheduled: '#8b5cf6',
      };
      const opacity =
        status === 'pending'
          ? 0.75
          : status === 'declined'
            ? 0.6
            : status === 'rescheduled'
              ? 0.9
              : 1;
      return {
        style: {
          ...base,
          backgroundColor: colorMap[status || ''] || '#6b7280',
          color: '#fff',
          opacity,
        },
      };
=======
      const colorMap: Record<string, string> = { pending: '#f59e0b', accepted: '#22c55e', declined: '#ef4444' };
      return { style: { ...base, backgroundColor: colorMap[status || ''] || '#6b7280', color: '#fff' } };
>>>>>>> 1e58298 (Improvements to the bookin feature)
    }
    if (event.resource.type === 'other-booking') {
      return {
        style: {
          ...base,
          backgroundColor: '#ef4444',
          color: '#fff',
          opacity: 0.6,
          cursor: 'default',
        },
      };
    }
    return {};
  };

  const dayPropGetter = (date: Date) => {
    if (isBefore(startOfDay(date), today))
      return { className: 'rbc-day--past' };
    return {};
  };

  const isBookingInPast = (b: Booking) =>
    isBefore(startOfDay(new Date(b.startTime)), today);

  if (usersLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <CalendarIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Boka möte
        </h1>
      </div>

      <Card className="bg-card space-y-6 p-6">
        <section>
          <p className="text-muted-foreground text-sm mb-4">
            Klicka på en tillgänglig tid för att boka. Gröna = dina bokningar,
            röda = andras.
          </p>

          {admins.length > 0 && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-semibold text-foreground mb-2">
                Tillgängliga admins:
              </p>
              <div className="flex flex-wrap gap-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor:
                          adminColorMap.get(admin.id) || '#6b7280',
                      }}
                    />
                    <span className="text-sm text-foreground">
                      {admin.firstName} {admin.lastName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const weekStart = startOfWeek(currentDate, { locale: sv });
<<<<<<< HEAD
            const weekEnd = addDays(weekStart, 3);
=======
            const weekEnd = addDays(weekStart, 3); // Mon-Thu
            const thisWeekStart = startOfWeek(new Date(), { locale: sv });
            const canGoBack = isBefore(thisWeekStart, weekStart);
>>>>>>> 1e58298 (Improvements to the bookin feature)
            return (
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                >
                  ← Föregående vecka
                </Button>
                <span className="text-sm font-semibold text-foreground min-w-[100px] text-center">
                  {format(weekStart, 'd/M')} – {format(weekEnd, 'd/M')}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                >
                  Nästa vecka →
                </Button>
              </div>
            );
          })()}

          <div style={{ height: 600 }}>
            {/* @ts-expect-error custom fourDay view not in type defs */}
            <Calendar<CalendarEvent>
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
              components={{ event: FreeEventComponent }}
              formats={{
                timeGutterFormat: 'HH:mm',
                dayFormat: (date: Date) =>
                  `${DAY_NAMES[getDay(date)] || ''} ${format(date, 'd/M')}`,
=======
              components={{ event: FreeEventComponent }}
              formats={{
                timeGutterFormat: 'HH:mm',
                dayFormat: (date: Date) => `${DAY_NAMES[getDay(date)] || ''} ${format(date, 'd/M')}`,
>>>>>>> 1e58298 (Improvements to the bookin feature)
              }}
              messages={{
                today: 'Idag',
                next: 'Nästa',
                previous: 'Föregående',
                month: 'Månad',
                week: 'Vecka',
                day: 'Dag',
              }}
            />
          </div>
        </section>

        {availabilities.length === 0 && bookings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Inga tillgängliga tider just nu.</p>
            <p className="text-sm mt-2">
              Kontakta en admin om du saknar bokningsbara tider.
            </p>
          </div>
        )}
      </Card>

      {/* New booking dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {!meetingType
                ? 'Välj mötestyp'
                : meetingType === 'intro'
                  ? 'Boka intromöte'
                  : 'Boka uppföljningsmöte'}
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {selectedFreeSlot && (
                  <>
                    <p className="mt-2">
                      <strong>Admin:</strong>{' '}
                      {adminNameMap.get(
                        selectedFreeSlot.availability.adminId
                      ) || 'Okänd'}
                    </p>
                    <p>
                      <strong>Datum:</strong>{' '}
                      {format(selectedFreeSlot.start, 'yyyy-MM-dd')}
                    </p>
                    <p>
                      <strong>Tillgänglig:</strong>{' '}
                      {format(selectedFreeSlot.start, 'HH:mm')} –{' '}
                      {format(selectedFreeSlot.end, 'HH:mm')}
                    </p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {!meetingType ? (
            <div className="flex flex-col gap-3 py-4">
              <Button
                variant="outline"
                className="h-16 text-base"
                onClick={() => setMeetingType('intro')}
              >
                Intromöte
                <span className="block text-xs text-muted-foreground font-normal ml-2">
                  Ny möjlig deltagare
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-16 text-base"
                onClick={() => {
                  setMeetingType('followup');
                  setStudentId(students.length > 0 ? students[0].id : null);
                }}
              >
                Uppföljningsmöte
                <span className="block text-xs text-muted-foreground font-normal ml-2">
                  Befintlig deltagare
                </span>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Starttid</Label>
                  <Select
                    value={`${startHour}:${startMinute}`}
                    onValueChange={(val) => {
                      const [h, m] = val.split(':').map(Number);
                      setStartHour(h);
                      setStartMinute(m);
                      const newStartTotal = h * 60 + m;
                      if (endHour * 60 + endMinute <= newStartTotal) {
                        const next = timeOptions.find(
                          (o) => o.hour * 60 + o.minute > newStartTotal
                        );
                        if (next) {
                          setEndHour(next.hour);
                          setEndMinute(next.minute);
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.slice(0, -1).map((o) => (
                        <SelectItem
                          key={o.label}
                          value={`${o.hour}:${o.minute}`}
                        >
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sluttid</Label>
                  <Select
                    value={`${endHour}:${endMinute}`}
                    onValueChange={(val) => {
                      const [h, m] = val.split(':').map(Number);
                      setEndHour(h);
                      setEndMinute(m);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {endTimeOptions.map((o) => (
                        <SelectItem
                          key={o.label}
                          value={`${o.hour}:${o.minute}`}
                        >
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {meetingType === 'followup' &&
                  (students.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Välj student</Label>
                      <Select
                        value={studentId?.toString() || ''}
                        onValueChange={(v) => setStudentId(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj en student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.firstName.charAt(0)}.{s.lastName.charAt(0)}.
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Du har inga aktiva studenter just nu.
                      </p>
                    </div>
                  ))}
                <div className="space-y-2">
                  <Label htmlFor="note">Meddelande (valfritt)</Label>
                  <Textarea
                    id="note"
                    placeholder={
                      meetingType === 'intro'
                        ? 'Lägg till ett meddelande om intromötet...'
                        : 'Lägg till ett meddelande om uppföljningen...'
                    }
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMeetingType(null)}>
                  Tillbaka
                </Button>
                <Button
                  onClick={handleBook}
                  disabled={
                    meetingType === 'followup' &&
                    (!studentId || students.length === 0)
                  }
                >
                  Bekräfta bokning
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking details dialog */}
      <Dialog
        open={showBookingDetails}
        onOpenChange={(open) => {
          setShowBookingDetails(open);
          if (!open) {
            setBookingDetailsMode('view');
            setFetchedParentAvail(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bookingDetailsMode === 'reschedule'
                ? 'Ändra tid'
                : selectedBooking?.meetingType === 'intro'
                  ? 'Intromöte'
                  : 'Uppföljningsmöte'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 mt-2">
                {selectedBooking && bookingDetailsMode === 'view' && (
                  <>
                    <p>
                      <strong>Admin:</strong>{' '}
                      {adminNameMap.get(selectedBooking.adminId) || 'Okänd'}
                    </p>
                    <p>
                      <strong>Tid:</strong>{' '}
                      {format(
                        new Date(selectedBooking.startTime),
                        'yyyy-MM-dd HH:mm'
                      )}{' '}
                      – {format(new Date(selectedBooking.endTime), 'HH:mm')}
                    </p>
                    {selectedBooking.studentId && (
                      <p>
                        <strong>Student:</strong>{' '}
                        {studentNameMap.get(selectedBooking.studentId) ||
                          `ID ${selectedBooking.studentId}`}
                      </p>
                    )}
                    {selectedBooking.note && (
                      <p>
                        <strong>Meddelande:</strong> {selectedBooking.note}
                      </p>
                    )}
                    {selectedBooking.reason && (
                      <p>
                        <strong>Anledning:</strong> {selectedBooking.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Bokad:{' '}
                      {format(
                        new Date(selectedBooking.bookedAt),
                        'yyyy-MM-dd HH:mm'
                      )}
                    </p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {bookingDetailsMode === 'reschedule' && selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Starttid</Label>
                <Select
                  value={`${rescheduleStart.hour}:${rescheduleStart.minute}`}
                  onValueChange={(val) => {
                    const [h, m] = val.split(':').map(Number);
                    setRescheduleStart({ hour: h, minute: m });
                    const newTotal = h * 60 + m;
                    if (
                      rescheduleEnd.hour * 60 + rescheduleEnd.minute <=
                      newTotal
                    ) {
                      const next = rescheduleOptions.find(
                        (o) => o.hour * 60 + o.minute > newTotal
                      );
                      if (next)
                        setRescheduleEnd({
                          hour: next.hour,
                          minute: next.minute,
                        });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rescheduleOptions.slice(0, -1).map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sluttid</Label>
                <Select
                  value={`${rescheduleEnd.hour}:${rescheduleEnd.minute}`}
                  onValueChange={(val) => {
                    const [h, m] = val.split(':').map(Number);
                    setRescheduleEnd({ hour: h, minute: m });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rescheduleEndOptions.map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Anledning (valfritt)</Label>
                <Textarea
                  placeholder="Ange anledning till tidsändringen..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {bookingDetailsMode === 'view' &&
            selectedBooking?.status === 'accepted' &&
            !isBookingInPast(selectedBooking) && (
              <div className="space-y-2 pt-2">
                <Label>Anledning (valfritt)</Label>
                <Textarea
                  placeholder="Ange anledning till ändringen..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}

          {bookingDetailsMode === 'view' &&
            selectedBooking?.status === 'rescheduled' &&
            selectedBooking.rescheduledBy === 'admin' &&
            !isBookingInPast(selectedBooking) && (
              <div className="space-y-2 pt-2">
                <Label>Anledning (valfritt)</Label>
                <Textarea
                  placeholder="Ange anledning till ditt svar..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}

          {bookingDetailsMode === 'view' &&
            selectedBooking?.status === 'pending' &&
            !isBookingInPast(selectedBooking) && (
              <div className="space-y-2 pt-2">
                <Label>Anledning (valfritt)</Label>
                <Textarea
                  placeholder="Ange anledning till nekande eller tidsändring..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}

          <DialogFooter>
            {bookingDetailsMode === 'reschedule' ? (
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="outline"
                  onClick={() => setBookingDetailsMode('view')}
                >
                  Tillbaka
                </Button>
                <Button onClick={handleReschedule}>Spara tid</Button>
              </div>
            ) : selectedBooking?.status === 'rescheduled' &&
              selectedBooking.rescheduledBy === 'admin' &&
              !isBookingInPast(selectedBooking) ? (
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => handleCancelAccepted()}
                >
                  <X className="h-4 w-4 mr-1" /> Neka
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const s = new Date(selectedBooking.startTime);
                    const e = new Date(selectedBooking.endTime);
                    setRescheduleStart({
                      hour: s.getHours(),
                      minute: s.getMinutes(),
                    });
                    setRescheduleEnd({
                      hour: e.getHours(),
                      minute: e.getMinutes(),
                    });
                    if (
                      !availabilities.find(
                        (a) => a.id === selectedBooking.adminAvailabilityId
                      )
                    ) {
                      try {
                        const avail = await getAvailabilityById(
                          selectedBooking.adminAvailabilityId
                        );
                        setFetchedParentAvail(avail);
                      } catch {
                        /* fallback to current booking times */
                      }
                    }
                    setBookingDetailsMode('reschedule');
                  }}
                >
                  Föreslå annan tid
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleAcceptReschedule}
                >
                  <Check className="h-4 w-4 mr-1" /> Godkänn
                </Button>
              </div>
            ) : selectedBooking?.status === 'pending' &&
              !isBookingInPast(selectedBooking) ? (
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => handleCancelAccepted()}
                >
                  <X className="h-4 w-4 mr-1" /> Neka
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const s = new Date(selectedBooking.startTime);
                    const e = new Date(selectedBooking.endTime);
                    setRescheduleStart({
                      hour: s.getHours(),
                      minute: s.getMinutes(),
                    });
                    setRescheduleEnd({
                      hour: e.getHours(),
                      minute: e.getMinutes(),
                    });
                    if (
                      !availabilities.find(
                        (a) => a.id === selectedBooking.adminAvailabilityId
                      )
                    ) {
                      try {
                        const avail = await getAvailabilityById(
                          selectedBooking.adminAvailabilityId
                        );
                        setFetchedParentAvail(avail);
                      } catch {
                        /* fallback */
                      }
                    }
                    setBookingDetailsMode('reschedule');
                  }}
                >
                  Föreslå annan tid
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleAcceptReschedule()}
                >
                  <Check className="h-4 w-4 mr-1" /> Godkänn
                </Button>
              </div>
            ) : selectedBooking?.status === 'accepted' &&
              !isBookingInPast(selectedBooking) ? (
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={handleCancelAccepted}
                >
                  <X className="h-4 w-4 mr-1" /> Avboka
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const s = new Date(selectedBooking.startTime);
                    const e = new Date(selectedBooking.endTime);
                    setRescheduleStart({
                      hour: s.getHours(),
                      minute: s.getMinutes(),
                    });
                    setRescheduleEnd({
                      hour: e.getHours(),
                      minute: e.getMinutes(),
                    });
                    setBookingDetailsMode('reschedule');
                  }}
                >
                  Ändra tid
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowBookingDetails(false)}
              >
                Stäng
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CoachBookingView;
