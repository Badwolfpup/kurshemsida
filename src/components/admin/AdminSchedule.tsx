import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addWeeks, subWeeks } from 'date-fns';
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getAllAvailabilities, getBookings, addAvailability, type Availability, type Booking } from '@/api/BookingService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => format(date, formatStr, { locale: sv }),
  parse: (value: string, formatStr: string) => parse(value, formatStr, new Date(), { locale: sv }),
  startOfWeek: () => startOfWeek(new Date(), { locale: sv }),
  getDay: (date: Date) => getDay(date),
  locales: { sv },
});

function AdminSchedule() {
  const { user } = useAuth();
  const adminId = user?.id || 0;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const load = () => {
    getAllAvailabilities().then((data) =>
      setAvailabilities(data.filter((a) => a.adminId === adminId))
    );
    getBookings().then((data) =>
      setBookings(data.filter((b) => b.adminId === adminId))
    );
  };

  useEffect(() => {
    load();
  }, [adminId, currentDate]);

  interface ScheduleEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: { type: string; availabilityId?: number };
  }

  const events: ScheduleEvent[] = [
    ...availabilities.map((a) => ({
      id: `avail-${a.id}`,
      title: a.isBooked ? 'Bokad' : 'Tillgänglig',
      start: new Date(a.startTime),
      end: new Date(a.endTime),
      allDay: false,
      resource: { type: a.isBooked ? 'booked' : 'availability', availabilityId: a.id },
    })),
    ...bookings.map((b) => ({
      id: `booking-${b.id}`,
      title: `Coach ${b.coachId}: ${b.note}`,
      start: new Date(b.bookedAt),
      end: new Date(b.bookedAt),
      allDay: false,
      resource: { type: 'booking' },
    })),
  ];

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (
      window.confirm(
        `Lägg till tillgänglighet: ${format(start, 'yyyy-MM-dd HH:mm')} - ${format(end, 'HH:mm')}?`
      )
    ) {
      addAvailability({ adminId, startTime: start, endTime: end }).then(load);
    }
  };

  const eventStyleGetter = (event: { resource?: { type: string } }) => {
    if (event.resource?.type === 'booking') {
      return { style: { backgroundColor: '#e55e5e', color: '#fff', borderRadius: '6px' } };
    }
    if (event.resource?.type === 'availability') {
      return { style: { backgroundColor: '#48bb78', color: '#fff', borderRadius: '6px' } };
    }
    if (event.resource?.type === 'booked') {
      return { style: { backgroundColor: '#a0aec0', color: '#222', borderRadius: '6px' } };
    }
    return {};
  };

  const hasNew = bookings.some((b) => !b.seen);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Card className="bg-card space-y-6 p-6">
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Veckoschema &amp; Bokningar
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Klicka på en tom tid i kalendern för att lägga till tillgänglighet.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                ← Föregående vecka
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                Nästa vecka →
              </Button>
            </div>
          </div>
          <div className="mt-6" style={{ height: 550 }}>
            <Calendar<ScheduleEvent>
              localizer={localizer}
              events={events}
              startAccessor={(e) => e.start}
              endAccessor={(e) => e.end}
              titleAccessor={(e) => e.title}
              defaultView="week"
              views={['week']}
              step={30}
              timeslots={2}
              min={new Date(1970, 0, 1, 8, 0, 0)}
              max={new Date(1970, 0, 1, 17, 0, 0)}
              date={currentDate}
              onNavigate={setCurrentDate}
              selectable
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
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

        <hr className="border-border" />

        <section>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-lg font-semibold text-foreground">Bokningar</h3>
            {hasNew && (
              <Badge className="bg-destructive text-destructive-foreground">Ny bokning!</Badge>
            )}
          </div>
          {bookings.length === 0 ? (
            <div className="text-muted-foreground text-sm py-3">
              Inga bokningar registrerade.
              <br />
              Nya bokningar kommer att listas här.
            </div>
          ) : (
            <ul className="space-y-2 mt-2">
              {bookings.map((b) => (
                <li key={b.id} className="text-sm text-foreground flex gap-2 items-baseline">
                  <span className="font-bold">{format(new Date(b.bookedAt), 'yyyy-MM-dd HH:mm')}</span>
                  <span className="text-muted-foreground">| Coach</span>
                  <Badge variant="secondary" className="text-xs">{b.coachId}</Badge>
                  <span className="italic text-muted-foreground">{b.note}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Card>
    </div>
  );
}

export default AdminSchedule;
