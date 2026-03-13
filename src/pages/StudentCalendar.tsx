import { useMemo, useState } from 'react';
import { startOfWeek, addDays, startOfDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import CalendarShell from '@/components/calendar/CalendarShell';
import BookingDetailsDialog from '@/components/calendar/BookingDetailsDialog';
import StudentBookingDialog from '@/components/calendar/StudentBookingDialog';
import RecurringEventClickDialog from '@/components/calendar/RecurringEventClickDialog';
import { RECURRING_EVENT_COLOR, STATUS_COLORS } from '@/components/calendar/calendarUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { useBookings, useCreateBooking, useCancelBooking } from '@/hooks/useBookings';
import { useRecurringEvents } from '@/hooks/useRecurringEvents';
import { useNoClasses } from '@/hooks/useNoClass';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import HelpDialog from '@/components/HelpDialog';
import type { CalendarEvent, RecurringEventInstance } from '@/Types/CalendarTypes';
import type { Booking, BookingConflictError } from '@/api/BookingService';
import ConflictDialog from '@/components/calendar/ConflictDialog';
import { useUpdateBookingStatus } from '@/hooks/useBookings';

export default function StudentCalendar() {
  const { user } = useAuth();
  const { data: allUsers = [] } = useUsers();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());

  // Data queries
  const { data: allBookings = [] } = useBookings();
  const weekStart = startOfWeek(currentDate, { locale: sv });
  const weekEnd = addDays(weekStart, 6);
  const { data: recurringInstances = [] } = useRecurringEvents(weekStart, weekEnd);
  const { data: noClassDates = [] } = useNoClasses();

  // Mutations
  const createBookingMut = useCreateBooking();
  const cancelBookingMut = useCancelBooking();
  const updateStatus = useUpdateBookingStatus();

  // Dialog state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedRecurringInstance, setSelectedRecurringInstance] = useState<RecurringEventInstance | null>(null);
  const [showRecurringClickDialog, setShowRecurringClickDialog] = useState(false);

  // Conflict dialogs
  const [conflictErrorBookings, setConflictErrorBookings] = useState<Booking[]>([]);
  const [showConflictError, setShowConflictError] = useState(false);
  const [conflictWarningBookings, setConflictWarningBookings] = useState<Booking[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<Parameters<typeof createBookingMut.mutateAsync>[0] | null>(null);

  // Derived data
  const admins = useMemo(() => allUsers.filter((u) => u.authLevel <= 2 && u.isActive), [allUsers]);
  const nameMap = useMemo(() => {
    const map = new Map<number, string>();
    allUsers.forEach((u) => map.set(u.id, `${u.firstName} ${u.lastName}`));
    return map;
  }, [allUsers]);

  const noClassDateObjects = useMemo(() => {
    return noClassDates.map((d) => startOfDay(new Date(d)));
  }, [noClassDates]);

  // Student only sees their own bookings (backend already filters)
  const myBookings = useMemo(() => allBookings.filter((b) => b.studentId === user?.id), [allBookings, user?.id]);

  const SEVEN_DAYS_AGO = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; }, []);

  // Build calendar events
  const events = useMemo((): CalendarEvent[] => {
    const result: CalendarEvent[] = [];

    // Own bookings
    for (const b of myBookings) {
      if (b.status === 'declined' && new Date(b.bookedAt) < SEVEN_DAYS_AGO) continue;
      const adminName = nameMap.get(b.adminId) || `Admin ${b.adminId}`;
      const typeLabel = b.status === 'pending' ? 'Förfrågan' : b.status === 'accepted' ? 'Godkänd' : b.status === 'rescheduled' ? 'Ombokning' : 'Nekad';
      result.push({
        id: `booking-${b.id}`,
        title: `${adminName} – ${typeLabel}`,
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        allDay: false,
        resource: { type: b.status as CalendarEvent['resource']['type'], booking: b, isOwn: true },
      });
    }

    // Recurring events (read-only)
    for (const inst of recurringInstances) {
      result.push({
        id: `recurring-${inst.eventId}-${inst.date}`,
        title: inst.name,
        start: new Date(inst.start),
        end: new Date(inst.end),
        allDay: false,
        resource: { type: 'recurring', recurringEventId: inst.eventId, recurringEventName: inst.name, color: RECURRING_EVENT_COLOR, isOwn: false, adminId: inst.adminId, classroom: inst.classroom },
      });
    }

    return result;
  }, [myBookings, recurringInstances, nameMap, SEVEN_DAYS_AGO]);

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource.type === 'recurring') {
      const inst = recurringInstances.find((i) => i.eventId === event.resource.recurringEventId && new Date(i.date).getTime() === startOfDay(event.start).getTime());
      if (inst) {
        setSelectedRecurringInstance(inst);
        setShowRecurringClickDialog(true);
      }
      return;
    }
    if (event.resource.booking) {
      setSelectedBooking(event.resource.booking);
      setShowBookingDetails(true);
    }
  };

  const handleCreateBooking = async (data: { adminId: number; note: string; startTime: string; endTime: string; force?: boolean }) => {
    try {
      await createBookingMut.mutateAsync({
        adminId: data.adminId,
        meetingType: 'session',
        note: data.note,
        startTime: data.startTime,
        endTime: data.endTime,
        force: data.force,
      });
      toast({ title: 'Bokning skapad' });
    } catch (err) {
      const conflictErr = err as BookingConflictError;
      if (conflictErr.conflictData?.type === 'conflict') {
        setConflictErrorBookings(conflictErr.conflictData.bookings);
        setShowConflictError(true);
      } else if (conflictErr.conflictData?.type === 'warning') {
        setPendingBookingData({ adminId: data.adminId, meetingType: 'session', note: data.note, startTime: data.startTime, endTime: data.endTime, force: true });
        setConflictWarningBookings(conflictErr.conflictData.bookings);
        setShowConflictWarning(true);
      } else {
        toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte skapa bokningen.', variant: 'destructive' });
      }
      throw err;
    }
  };

  const handleConfirmConflictWarning = async () => {
    if (!pendingBookingData) return;
    setShowConflictWarning(false);
    try {
      await createBookingMut.mutateAsync(pendingBookingData);
      toast({ title: 'Bokning skapad' });
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte skapa bokningen.', variant: 'destructive' });
    } finally {
      setPendingBookingData(null);
      setConflictWarningBookings([]);
    }
  };

  // Legend
  const legend = (
    <div className="flex flex-wrap gap-4 mb-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.pending.bg, opacity: STATUS_COLORS.pending.opacity }} />
        <span>Förfrågan</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.rescheduled.bg, opacity: STATUS_COLORS.rescheduled.opacity }} />
        <span>Ombokning</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.accepted.bg }} />
        <span>Godkänd</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.declined.bg }} />
        <span>Nekad</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: RECURRING_EVENT_COLOR }} />
        <span>Återkommande</span>
      </div>
    </div>
  );

  return (
    <>
      <CalendarShell
        title="Min kalender"
        subtitle="Se dina bokningar och boka handledning."
        events={events}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onSelectEvent={handleSelectEvent}
        noClassDates={noClassDateObjects}
        nameMap={nameMap}
        helpButton={<HelpDialog helpKey="student-calendar" />}
        rightActions={
          <Button onClick={() => setShowBookingDialog(true)} className="ml-4">
            <Plus className="h-4 w-4 mr-1" /> Boka handledning
          </Button>
        }
        legend={legend}
      />

      {/* Booking details */}
      <BookingDetailsDialog
        open={showBookingDetails}
        onOpenChange={setShowBookingDetails}
        booking={selectedBooking}
        role="student"
        nameMap={nameMap}
        onAccept={async (id, reason) => {
          await updateStatus.mutateAsync({ id, status: 'accepted', reason });
          toast({ title: 'Godkänd' });
        }}
        onDecline={async (id, reason) => {
          await updateStatus.mutateAsync({ id, status: 'declined', reason });
          toast({ title: 'Nekad' });
        }}
        onCancel={async (id, reason) => {
          await cancelBookingMut.mutateAsync({ id, reason });
          toast({ title: 'Avbokad' });
        }}
      />

      {/* Recurring event details (read-only) */}
      <RecurringEventClickDialog
        open={showRecurringClickDialog}
        onOpenChange={setShowRecurringClickDialog}
        instance={selectedRecurringInstance}
        canEdit={false}
        adminName={selectedRecurringInstance ? (nameMap.get(selectedRecurringInstance.adminId) || undefined) : undefined}
      />

      {/* Student booking dialog */}
      <StudentBookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        currentDate={currentDate}
        admins={admins}
        bookings={allBookings}
        recurringInstances={recurringInstances}
        onSubmit={handleCreateBooking}
      />

      {/* Conflict dialogs */}
      <ConflictDialog
        open={showConflictError}
        onOpenChange={(o) => { setShowConflictError(o); if (!o) setConflictErrorBookings([]); }}
        type="error"
        bookings={conflictErrorBookings}
        nameMap={nameMap}
      />
      <ConflictDialog
        open={showConflictWarning}
        onOpenChange={(o) => { setShowConflictWarning(o); if (!o) { setPendingBookingData(null); setConflictWarningBookings([]); } }}
        type="warning"
        bookings={conflictWarningBookings}
        nameMap={nameMap}
        onConfirm={handleConfirmConflictWarning}
      />
    </>
  );
}
