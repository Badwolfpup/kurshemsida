import { useMemo } from 'react';
import { Calendar } from 'react-big-calendar';
import { format, getDay, addWeeks, subWeeks, addDays, startOfWeek, startOfDay, isBefore } from 'date-fns';
import { sv } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './BookingCalendar.css';
import FourDayView, { localizer, fourDayRange } from './FourDayView';
import { WORKDAY_START_HOUR, WORKDAY_END_HOUR, DAY_NAMES, RECURRING_EVENT_COLOR, STATUS_COLORS } from './calendarUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CalendarEvent } from '@/Types/CalendarTypes';

function RecurringEventBlock({ event, nameMap }: { event: CalendarEvent; nameMap?: Map<number, string> }) {
  const { title, resource } = event;
  const teacherName = resource.adminId != null ? nameMap?.get(resource.adminId) : undefined;
  const classroom = resource.classroom;
  return (
    <div style={{ lineHeight: '1.2', fontSize: '0.78rem' }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {teacherName && <div style={{ opacity: 0.85 }}>{teacherName}</div>}
      {classroom != null && <div style={{ opacity: 0.85 }}>Sal {classroom}</div>}
    </div>
  );
}

interface CalendarShellProps {
  title: string;
  subtitle?: string;
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  selectable?: boolean;
  noClassDates?: Date[];
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  legend?: React.ReactNode;
  helpButton?: React.ReactNode;
  children?: React.ReactNode;
  nameMap?: Map<number, string>;
}

export default function CalendarShell({
  title,
  subtitle,
  events,
  currentDate,
  onDateChange,
  onSelectSlot,
  onSelectEvent,
  selectable = false,
  noClassDates = [],
  leftActions,
  rightActions,
  legend,
  helpButton,
  children,
  nameMap,
}: CalendarShellProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const noClassSet = useMemo(
    () => new Set(noClassDates.map((d) => d.getTime())),
    [noClassDates]
  );

  const weekStart = startOfWeek(currentDate, { locale: sv });
  const weekEnd = addDays(weekStart, 3);

  const eventStyleGetter = (event: CalendarEvent) => {
    const isOwn = event.resource.isOwn !== false;
    const base = { borderRadius: '6px', border: 'none', padding: '2px 6px', cursor: isOwn ? 'pointer' : 'default' };

    if (event.resource.type === 'recurring') {
      return { style: { ...base, backgroundColor: RECURRING_EVENT_COLOR, color: '#fff', opacity: 0.85 } };
    }

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
        return { style: { ...base, backgroundColor: STATUS_COLORS.pending.bg, color: '#fff', opacity: STATUS_COLORS.pending.opacity } };
      case 'rescheduled':
        return { style: { ...base, backgroundColor: STATUS_COLORS.rescheduled.bg, color: '#fff', opacity: STATUS_COLORS.rescheduled.opacity } };
      case 'accepted':
        return { style: { ...base, backgroundColor: STATUS_COLORS.accepted.bg, color: '#fff' } };
      case 'declined':
        return {
          style: { ...base, backgroundColor: STATUS_COLORS.declined.bg, color: '#fff', opacity: STATUS_COLORS.declined.opacity },
          className: 'rbc-event--declined',
        };
      default:
        return {};
    }
  };

  const dayPropGetter = (date: Date) => {
    const classes: string[] = [];
    if (isBefore(startOfDay(date), today)) classes.push('rbc-day--past');
    if (noClassSet.has(startOfDay(date).getTime())) classes.push('rbc-day--noclass');
    return classes.length > 0 ? { className: classes.join(' ') } : {};
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Card className="bg-card space-y-6 p-6">
        <section>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
              {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
            </div>
            {helpButton}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 mb-4">
            {leftActions}
            <Button variant="outline" onClick={() => onDateChange(subWeeks(currentDate, 1))}>← Föregående vecka</Button>
            <span className="text-sm font-semibold text-foreground min-w-[100px] text-center">
              {format(weekStart, 'd/M')} – {format(weekEnd, 'd/M')}
            </span>
            <Button variant="outline" onClick={() => onDateChange(addWeeks(currentDate, 1))}>Nästa vecka →</Button>
            {rightActions}
          </div>

          {legend}

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
              onNavigate={onDateChange}
              selectable={selectable}
              onSelectSlot={onSelectSlot}
              onSelectEvent={onSelectEvent}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              formats={{
                timeGutterFormat: 'HH:mm',
                dayFormat: (date: Date) => `${DAY_NAMES[getDay(date)] || ''} ${format(date, 'd/M')}`,
              }}
              messages={{ today: 'Idag', next: 'Nästa', previous: 'Föregående', month: 'Månad', week: 'Vecka', day: 'Dag' }}
              components={{
                event: (props: { event: CalendarEvent }) =>
                  props.event.resource.type === 'recurring'
                    ? <RecurringEventBlock event={props.event} nameMap={nameMap} />
                    : <span>{props.event.title}</span>,
              }}
            />
          </div>
        </section>
        {children}
      </Card>
    </div>
  );
}
