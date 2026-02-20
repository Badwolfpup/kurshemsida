import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, type NavigateAction } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addWeeks, subWeeks, addDays, startOfDay, isBefore } from 'date-fns';
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './BookingCalendar.css';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
import { getAllAvailabilities, getBookings, addAvailability, updateAvailability, updateBookingStatus, cancelBooking, rescheduleBooking, type Availability, type Booking } from '@/api/BookingService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

const WORKDAY_START_HOUR = 8;
const WORKDAY_END_HOUR = 15;

const DAY_NAMES = ['', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

const ADMIN_COLORS = ['#2563eb', '#c6a04a', '#b45309', '#be123c', '#4338ca', '#0369a1', '#8b5cf6', '#7c2d12'];

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => format(date, formatStr, { locale: sv }),
  parse: (value: string, formatStr: string) => parse(value, formatStr, new Date(), { locale: sv }),
  startOfWeek: () => startOfWeek(new Date(), { locale: sv }),
  getDay: (date: Date) => getDay(date),
  locales: { sv },
});

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
    type: 'availability' | 'pending' | 'accepted' | 'declined';
    availabilityId?: number;
    availability?: Availability;
    booking?: Booking;
    adminId?: number;
    color?: string;
    isOwn?: boolean;
  };
}

/** Subtract only accepted bookings from availability to get free segments */
function getFreeSegments(avail: Availability, bookings: Booking[]): { start: Date; end: Date }[] {
  const aStart = new Date(avail.startTime);
  const aEnd = new Date(avail.endTime);

  const sorted = bookings
    .filter((b) => b.adminAvailabilityId === avail.id && b.status === 'accepted')
    .map((b) => ({ start: new Date(b.startTime), end: new Date(b.endTime) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const segments: { start: Date; end: Date }[] = [];
  let cursor = aStart;

  for (const booking of sorted) {
    if (booking.start > cursor) segments.push({ start: cursor, end: booking.start });
    if (booking.end > cursor) cursor = booking.end;
  }

  if (cursor < aEnd) segments.push({ start: cursor, end: aEnd });

  return segments;
}

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

function AdminSchedule() {
  const { user } = useAuth();
  const { data: allUsers = [] } = useUsers();
  const { toast } = useToast();
  const adminId = user?.id || 0;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

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
    const map = new Map<number, string>();
    allUsers.forEach((u) => { map.set(u.id, `${u.firstName} ${u.lastName}`); });
    return map;
  }, [allUsers]);

  const load = async () => {
    try {
      const [availData, bookingData] = await Promise.all([getAllAvailabilities(), getBookings()]);
      setAvailabilities(availData);
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

  const today = useMemo(() => startOfDay(new Date()), []);

  const events = useMemo((): ScheduleEvent[] => {
    const result: ScheduleEvent[] = [];

    for (const avail of availabilities) {
      const isOwn = avail.adminId === adminId;
      const color = adminColorMap.get(avail.adminId) || '#6b7280';
      const adminName = adminNameMap.get(avail.adminId) || `Admin ${avail.adminId}`;
      // Only subtract accepted bookings — pending stay as overlays
      const freeSegs = getFreeSegments(avail, bookings);
      for (let i = 0; i < freeSegs.length; i++) {
        const seg = freeSegs[i];
        result.push({
          id: `avail-${avail.id}-${i}`,
          title: isOwn ? 'Tillgänglig' : `${adminName} – Tillgänglig`,
          start: seg.start,
          end: seg.end,
          allDay: false,
          resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color, isOwn },
        });
      }
    }

    for (const b of bookings) {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);

      // Hide declined bookings older than 7 days
      if (b.status === 'declined' && new Date(b.bookedAt) < SEVEN_DAYS_AGO) continue;

      const coachName = adminNameMap.get(b.coachId) || `Coach ${b.coachId}`;
      const typeLabel = b.status === 'pending' ? 'Förfrågan' : b.status === 'accepted' ? 'Godkänd' : 'Nekad';

      result.push({
        id: `booking-${b.id}`,
        title: `${coachName} – ${typeLabel}`,
        start: bStart,
        end: bEnd,
        allDay: false,
        resource: {
          type: b.status as 'pending' | 'accepted' | 'declined',
          booking: b,
          isOwn: true,
        },
      });
    }

    return result;
  }, [availabilities, bookings, adminColorMap, adminNameMap, adminId, SEVEN_DAYS_AGO]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (isBefore(startOfDay(start), today)) return;
    if (window.confirm(`Lägg till tillgänglighet: ${format(start, 'yyyy-MM-dd HH:mm')} – ${format(end, 'HH:mm')}?`)) {
      addAvailability({ adminId, startTime: start, endTime: end }).then(load);
    }
  };

  const handleSelectEvent = (event: ScheduleEvent) => {
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

    if (event.resource.booking) {
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
        bookingReason || undefined
      );
      toast({ title: 'Ombokning skickad', description: 'Ny tid sparad, bokning återställd till förfrågan.' });
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

  const eventStyleGetter = (event: ScheduleEvent) => {
    const base = { borderRadius: '6px', border: 'none', padding: '2px 6px', cursor: 'pointer' };
    switch (event.resource.type) {
      case 'availability': {
        const color = event.resource.color || '#2563eb';
        return { style: { ...base, backgroundColor: color, color: '#fff', cursor: event.resource.isOwn ? 'pointer' : 'default' } };
      }
      case 'pending':
        return { style: { ...base, backgroundColor: '#f59e0b', color: '#fff', opacity: 0.75 } };
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

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Card className="bg-card space-y-6 p-6">
        <section>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Veckoschema &amp; Bokningar</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Klicka på en tom tid i kalendern för att lägga till tillgänglighet.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 mb-4">
            <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>← Föregående vecka</Button>
            <span className="text-sm font-semibold text-foreground min-w-[100px] text-center">
              {format(weekStart, 'd/M')} – {format(weekEnd, 'd/M')}
            </span>
            <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>Nästa vecka →</Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
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
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span>Godkänd</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span>Nekad</span>
            </div>
          </div>

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
              dayPropGetter={dayPropGetter}
              formats={{
                timeGutterFormat: 'HH:mm',
                dayFormat: (date: Date) => `${DAY_NAMES[getDay(date)] || ''} ${format(date, 'd/M')}`,
              }}
              messages={{ today: 'Idag', next: 'Nästa', previous: 'Föregående', month: 'Månad', week: 'Vecka', day: 'Dag' }}
            />
          </div>
        </section>
      </Card>

      {/* Booking details dialog */}
      <Dialog open={showBookingDialog} onOpenChange={(open) => { setShowBookingDialog(open); if (!open) setBookingDialogMode('view'); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bookingDialogMode === 'reschedule' ? 'Ändra tid' :
                selectedBooking?.status === 'pending' ? 'Bokningsförfrågan' :
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
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

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
            <Button variant="outline" onClick={() => setShowEditAvailDialog(false)}>Avbryt</Button>
            <Button onClick={handleSaveAvailability}>Spara</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminSchedule;
