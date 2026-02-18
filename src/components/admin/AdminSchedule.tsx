import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, type NavigateAction } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addWeeks, subWeeks, addDays } from 'date-fns';
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './BookingCalendar.css';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
import { getAllAvailabilities, getBookings, addAvailability, updateBookingStatus, type Availability, type Booking } from '@/api/BookingService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

const WORKDAY_START_HOUR = 8;
const WORKDAY_END_HOUR = 15;

const DAY_NAMES = ['', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => format(date, formatStr, { locale: sv }),
  parse: (value: string, formatStr: string) => parse(value, formatStr, new Date(), { locale: sv }),
  startOfWeek: () => startOfWeek(new Date(), { locale: sv }),
  getDay: (date: Date) => getDay(date),
  locales: { sv },
});

// Custom 4-day view (Mon–Thu)
function fourDayRange(date: Date) {
  const start = startOfWeek(date, { locale: sv }); // Monday
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

interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    type: 'availability' | 'pending' | 'accepted' | 'declined';
    availabilityId?: number;
    booking?: Booking;
  };
}

/** Given an availability and its active (non-declined) bookings, return the free time segments */
function getFreeSegments(avail: Availability, bookings: Booking[]): { start: Date; end: Date }[] {
  const aStart = new Date(avail.startTime);
  const aEnd = new Date(avail.endTime);

  const sorted = bookings
    .filter((b) => b.adminAvailabilityId === avail.id && b.status !== 'declined')
    .map((b) => ({ start: new Date(b.startTime), end: new Date(b.endTime) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const segments: { start: Date; end: Date }[] = [];
  let cursor = aStart;

  for (const booking of sorted) {
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

  return segments;
}

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

  const coachNameMap = useMemo(() => {
    const map = new Map<number, string>();
    allUsers.forEach((u) => { map.set(u.id, `${u.firstName} ${u.lastName}`); });
    return map;
  }, [allUsers]);

  const load = async () => {
    try {
      const [availData, bookingData] = await Promise.all([getAllAvailabilities(), getBookings()]);
      setAvailabilities(availData.filter((a) => a.adminId === adminId));
      setBookings(bookingData.filter((b) => b.adminId === adminId));
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte ladda data.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    load();
  }, [adminId, currentDate]);

  const SEVEN_DAYS_AGO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const events = useMemo((): ScheduleEvent[] => {
    const result: ScheduleEvent[] = [];

    for (const avail of availabilities) {
      const freeSegs = getFreeSegments(avail, bookings);
      for (let i = 0; i < freeSegs.length; i++) {
        const seg = freeSegs[i];
        result.push({
          id: `avail-${avail.id}-${i}`,
          title: 'Tillgänglig',
          start: seg.start,
          end: seg.end,
          allDay: false,
          resource: { type: 'availability', availabilityId: avail.id },
        });
      }
    }

    for (const b of bookings) {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);

      // Hide declined bookings older than 7 days
      if (b.status === 'declined' && new Date(b.bookedAt) < SEVEN_DAYS_AGO) continue;

      const coachName = coachNameMap.get(b.coachId) || `Coach ${b.coachId}`;
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
        },
      });
    }

    return result;
  }, [availabilities, bookings, coachNameMap, SEVEN_DAYS_AGO]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (
      window.confirm(
        `Lägg till tillgänglighet: ${format(start, 'yyyy-MM-dd HH:mm')} – ${format(end, 'HH:mm')}?`
      )
    ) {
      addAvailability({ adminId, startTime: start, endTime: end }).then(load);
    }
  };

  const handleSelectEvent = (event: ScheduleEvent) => {
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

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Card className="bg-card space-y-6 p-6">
        <section>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Veckoschema &amp; Bokningar
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Klicka på en tom tid i kalendern för att lägga till tillgänglighet.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 mb-4">
            <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
              ← Föregående vecka
            </Button>
            <span className="text-sm font-semibold text-foreground min-w-[100px] text-center">
              {format(weekStart, 'd/M')} – {format(weekEnd, 'd/M')}
            </span>
            <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
              Nästa vecka →
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2563eb' }} />
              <span>Tillgänglig</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
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
              }}
            />
          </div>
        </section>
      </Card>

      {/* Booking details dialog */}
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
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminSchedule;
