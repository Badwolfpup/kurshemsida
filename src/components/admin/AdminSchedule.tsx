import { useMemo, useState } from 'react';
import { format, isBefore, startOfDay, startOfWeek, addDays } from 'date-fns';
import { sv } from 'date-fns/locale';
import CalendarShell from '@/components/calendar/CalendarShell';
import BookingDetailsDialog from '@/components/calendar/BookingDetailsDialog';
import RecurringEventDialog from '@/components/calendar/RecurringEventDialog';
import RecurringEventClickDialog from '@/components/calendar/RecurringEventClickDialog';
import AdminBookingDialog from './AdminBookingDialog';
import { getFreeSegments, getAdminColorMap, RECURRING_EVENT_COLOR, BUSY_TIME_COLOR, STATUS_COLORS, ALL_TIME_OPTIONS } from '@/components/calendar/calendarUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import {
  useBookings, useAvailabilities, useCreateBooking, useUpdateBookingStatus, useCancelBooking, useRescheduleBooking,
  useTransferBooking, useAddAvailability, useUpdateAvailability, useDeleteAvailability,
  useBusyTimes, useAddBusyTime, useUpdateBusyTime, useDeleteBusyTime,
} from '@/hooks/useBookings';
import { useRecurringEvents, useCreateRecurringEvent, useUpdateRecurringEvent, useDeleteRecurringEvent, useSetRecurringEventException } from '@/hooks/useRecurringEvents';
import { useNoClasses } from '@/hooks/useNoClass';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import HelpDialog from '@/components/HelpDialog';
import type { CalendarEvent } from '@/Types/CalendarTypes';
import type { Booking, Availability, BusyTime } from '@/api/BookingService';
import type { RecurringEventInstance } from '@/Types/CalendarTypes';

function AdminSchedule() {
  const { user } = useAuth();
  const { data: allUsers = [] } = useUsers();
  const { toast } = useToast();
  const adminId = user?.id || 0;

  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: allBookings = [] } = useBookings();
  const { data: availabilities = [] } = useAvailabilities();

  const weekStart = startOfWeek(currentDate, { locale: sv });
  const weekEnd = addDays(weekStart, 6);
  const { data: recurringInstances = [] } = useRecurringEvents(weekStart, weekEnd);
  const { data: noClassDates = [] } = useNoClasses();

  const { data: busyTimes = [] } = useBusyTimes();

  const createBooking = useCreateBooking();
  const updateStatus = useUpdateBookingStatus();
  const cancelBookingMut = useCancelBooking();
  const rescheduleMut = useRescheduleBooking();
  const transferMut = useTransferBooking();
  const addAvailMut = useAddAvailability();
  const updateAvailMut = useUpdateAvailability();
  const deleteAvailMut = useDeleteAvailability();
  const addBusyTimeMut = useAddBusyTime();
  const updateBusyTimeMut = useUpdateBusyTime();
  const deleteBusyTimeMut = useDeleteBusyTime();
  const createRecurring = useCreateRecurringEvent();
  const updateRecurring = useUpdateRecurringEvent();
  const deleteRecurring = useDeleteRecurringEvent();
  const setException = useSetRecurringEventException();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [selectedRecurringInstance, setSelectedRecurringInstance] = useState<RecurringEventInstance | null>(null);
  const [showRecurringClickDialog, setShowRecurringClickDialog] = useState(false);

  const [showSlotChoiceDialog, setShowSlotChoiceDialog] = useState(false);
  const [slotChoiceStart, setSlotChoiceStart] = useState<Date | null>(null);
  const [slotChoiceEnd, setSlotChoiceEnd] = useState<Date | null>(null);

  const [selectedBusyTime, setSelectedBusyTime] = useState<BusyTime | null>(null);
  const [showEditBusyDialog, setShowEditBusyDialog] = useState(false);
  const [editBusyStartHour, setEditBusyStartHour] = useState(8);
  const [editBusyStartMinute, setEditBusyStartMinute] = useState(30);
  const [editBusyEndHour, setEditBusyEndHour] = useState(9);
  const [editBusyEndMinute, setEditBusyEndMinute] = useState(0);

  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [showEditAvailDialog, setShowEditAvailDialog] = useState(false);
  const [editAvailStartHour, setEditAvailStartHour] = useState(8);
  const [editAvailStartMinute, setEditAvailStartMinute] = useState(30);
  const [editAvailEndHour, setEditAvailEndHour] = useState(9);
  const [editAvailEndMinute, setEditAvailEndMinute] = useState(0);

  const [visibleAdminIds, setVisibleAdminIds] = useState<string[]>([adminId.toString()]);

  const allAdmins = useMemo(() => allUsers.filter((u) => u.authLevel <= 2 && u.isActive), [allUsers]);
  const coaches = useMemo(() => allUsers.filter((u) => u.authLevel === 3 && u.isActive), [allUsers]);
  const students = useMemo(() => allUsers.filter((u) => u.authLevel === 4 && u.isActive), [allUsers]);
  const adminColorMap = useMemo(() => getAdminColorMap(allAdmins), [allAdmins]);
  const otherTeachers = useMemo(() => allAdmins, [allAdmins]);
  const nameMap = useMemo(() => {
    const map = new Map<number, string>();
    allUsers.forEach((u) => map.set(u.id, `${u.firstName} ${u.lastName}`));
    return map;
  }, [allUsers]);

  const noClassDateObjects = useMemo(() => noClassDates.map((d) => startOfDay(new Date(d))), [noClassDates]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const SEVEN_DAYS_AGO = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; }, []);

  const events = useMemo((): CalendarEvent[] => {
    const result: CalendarEvent[] = [];

    for (const avail of availabilities) {
      const isOwn = avail.adminId === adminId;
      if (!isOwn && !visibleAdminIds.includes(avail.adminId.toString())) continue;
      const color = adminColorMap.get(avail.adminId) || '#6b7280';
      const adminName = nameMap.get(avail.adminId) || `Admin ${avail.adminId}`;
      const freeSegs = getFreeSegments(avail, allBookings);
      for (let i = 0; i < freeSegs.length; i++) {
        result.push({
          id: `avail-${avail.id}-${i}`,
          title: isOwn ? 'Tillgänglig' : `${adminName} – Tillgänglig`,
          start: freeSegs[i].start,
          end: freeSegs[i].end,
          allDay: false,
          resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color, isOwn },
        });
      }
    }

    for (const visId of visibleAdminIds) {
      const id = Number(visId);
      const isOwn = id === adminId;
      const adminBookings = allBookings.filter((b) => b.adminId === id);
      const color = adminColorMap.get(id) || '#6b7280';
      const adminName = nameMap.get(id) || `Admin ${id}`;

      for (const b of adminBookings) {
        if (b.status === 'Declined' && new Date(b.bookedAt) < SEVEN_DAYS_AGO) continue;
        const personName = b.coachId ? (nameMap.get(b.coachId) || `Coach ${b.coachId}`) : (b.studentId ? (nameMap.get(b.studentId) || `Elev ${b.studentId}`) : '');
        const typeLabel = b.status === 'Pending' ? (b.rescheduledBy ? 'Ombokning' : 'Förfrågan') : b.status === 'Accepted' ? 'Godkänd' : 'Nekad';
        result.push({
          id: `booking-${b.id}`,
          title: isOwn ? `${personName} – ${typeLabel}` : `[${adminName}] ${personName} – ${typeLabel}`,
          start: new Date(b.startTime),
          end: new Date(b.endTime),
          allDay: false,
          resource: { type: b.status.toLowerCase() as CalendarEvent['resource']['type'], booking: b, color: isOwn ? undefined : color, isOwn },
        });
      }
    }

    for (const bt of busyTimes) {
      const isOwn = bt.adminId === adminId;
      if (!isOwn && !visibleAdminIds.includes(bt.adminId.toString())) continue;
      result.push({
        id: `busy-${bt.id}`,
        title: isOwn ? 'Upptagen' : `${nameMap.get(bt.adminId) || ''} – Upptagen`,
        start: new Date(bt.startTime),
        end: new Date(bt.endTime),
        allDay: false,
        resource: { type: 'busy', busyTimeId: bt.id, adminId: bt.adminId, isOwn },
      });
    }

    for (const inst of recurringInstances) {
      result.push({
        id: `recurring-${inst.eventId}-${inst.date}`,
        title: inst.name,
        start: new Date(inst.start),
        end: new Date(inst.end),
        allDay: false,
        resource: { type: 'recurring', recurringEventId: inst.eventId, recurringEventName: inst.name, color: RECURRING_EVENT_COLOR, isOwn: true, adminId: inst.adminId, classroom: inst.classroom },
      });
    }

    return result;
  }, [availabilities, allBookings, visibleAdminIds, adminColorMap, nameMap, adminId, SEVEN_DAYS_AGO, recurringInstances, busyTimes]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (isBefore(startOfDay(start), today)) return;
    setSlotChoiceStart(start);
    setSlotChoiceEnd(end);
    setShowSlotChoiceDialog(true);
  };

  const handleSlotChoice = async (choice: 'availability' | 'busy') => {
    setShowSlotChoiceDialog(false);
    if (!slotChoiceStart || !slotChoiceEnd) return;
    try {
      if (choice === 'availability') {
        await addAvailMut.mutateAsync({ adminId, startTime: slotChoiceStart, endTime: slotChoiceEnd });
        toast({ title: 'Tillgänglighet tillagd' });
      } else {
        await addBusyTimeMut.mutateAsync({ adminId, startTime: slotChoiceStart, endTime: slotChoiceEnd });
        toast({ title: 'Upptagen tid tillagd' });
      }
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte lägga till.', variant: 'destructive' });
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource.type === 'recurring') {
      const inst = recurringInstances.find((i) => i.eventId === event.resource.recurringEventId && new Date(i.date).getTime() === startOfDay(event.start).getTime());
      if (inst) {
        setSelectedRecurringInstance(inst);
        setShowRecurringClickDialog(true);
      }
      return;
    }

    if (event.resource.type === 'busy') {
      if (!event.resource.isOwn) return;
      const bt = busyTimes.find((b) => b.id === event.resource.busyTimeId);
      if (!bt) return;
      if (isBefore(startOfDay(new Date(bt.startTime)), today)) return;
      setSelectedBusyTime(bt);
      const s = new Date(bt.startTime);
      const e = new Date(bt.endTime);
      setEditBusyStartHour(s.getHours()); setEditBusyStartMinute(s.getMinutes());
      setEditBusyEndHour(e.getHours()); setEditBusyEndMinute(e.getMinutes());
      setShowEditBusyDialog(true);
      return;
    }

    if (event.resource.type === 'availability') {
      const avail = event.resource.availability;
      if (!avail || !event.resource.isOwn) return;
      if (isBefore(startOfDay(new Date(avail.startTime)), today)) return;
      setSelectedAvailability(avail);
      const s = new Date(avail.startTime);
      const e = new Date(avail.endTime);
      setEditAvailStartHour(s.getHours()); setEditAvailStartMinute(s.getMinutes());
      setEditAvailEndHour(e.getHours()); setEditAvailEndMinute(e.getMinutes());
      setShowEditAvailDialog(true);
      return;
    }

    if (event.resource.booking && event.resource.isOwn) {
      setSelectedBooking(event.resource.booking);
      setShowBookingDetails(true);
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
    try {
      await updateAvailMut.mutateAsync({
        id: selectedAvailability.id,
        startTime: format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      toast({ title: 'Sparad' });
      setShowEditAvailDialog(false);
      setSelectedAvailability(null);
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte uppdatera.', variant: 'destructive' });
    }
  };

  const handleDeleteAvailability = async () => {
    if (!selectedAvailability) return;
    if (!window.confirm('Är du säker på att du vill ta bort denna tillgänglighet?')) return;
    try {
      await deleteAvailMut.mutateAsync(selectedAvailability.id);
      toast({ title: 'Borttagen' });
      setShowEditAvailDialog(false);
      setSelectedAvailability(null);
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte ta bort.', variant: 'destructive' });
    }
  };

  const handleSaveBusyTime = async () => {
    if (!selectedBusyTime) return;
    const base = new Date(selectedBusyTime.startTime);
    const newStart = new Date(base.getFullYear(), base.getMonth(), base.getDate(), editBusyStartHour, editBusyStartMinute);
    const newEnd = new Date(base.getFullYear(), base.getMonth(), base.getDate(), editBusyEndHour, editBusyEndMinute);
    if (newStart >= newEnd) {
      toast({ title: 'Fel', description: 'Starttid måste vara före sluttid.', variant: 'destructive' });
      return;
    }
    try {
      await updateBusyTimeMut.mutateAsync({
        id: selectedBusyTime.id,
        startTime: format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      toast({ title: 'Sparad' });
      setShowEditBusyDialog(false);
      setSelectedBusyTime(null);
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte uppdatera.', variant: 'destructive' });
    }
  };

  const handleDeleteBusyTime = async () => {
    if (!selectedBusyTime) return;
    if (!window.confirm('Är du säker på att du vill ta bort denna upptagna tid?')) return;
    try {
      await deleteBusyTimeMut.mutateAsync(selectedBusyTime.id);
      toast({ title: 'Borttagen' });
      setShowEditBusyDialog(false);
      setSelectedBusyTime(null);
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte ta bort.', variant: 'destructive' });
    }
  };

  const handleCreateAppointment = async (data: Parameters<React.ComponentProps<typeof AdminBookingDialog>['onSubmit']>[0]) => {
    try {
      await createBooking.mutateAsync({
        coachId: data.coachId,
        studentId: data.studentId ?? null,
        meetingType: data.meetingType,
        note: data.note,
        startTime: data.startTime,
        endTime: data.endTime,
      });
      toast({ title: 'Förfrågan skickad' });
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte skapa mötet.', variant: 'destructive' });
      throw err;
    }
  };

  const sortedAdmins = useMemo(() => {
    const self = allAdmins.find((a) => a.id === adminId);
    const others = allAdmins.filter((a) => a.id !== adminId);
    return self ? [self, ...others] : others;
  }, [allAdmins, adminId]);

  const legend = (
    <>
      <div className="flex flex-wrap gap-4 mb-4 text-sm justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.Pending.bg, opacity: STATUS_COLORS.Pending.opacity }} />
          <span>Förfrågan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.Accepted.bg }} />
          <span>Godkänd</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.Declined.bg }} />
          <span>Nekad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: BUSY_TIME_COLOR }} />
          <span>Upptagen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: RECURRING_EVENT_COLOR }} />
          <span>Återkommande</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-sm items-center">
        <span className="text-muted-foreground font-medium mr-2">Visa bokningar:</span>
        <ToggleGroup type="multiple" value={visibleAdminIds} onValueChange={setVisibleAdminIds}>
          {sortedAdmins.map((admin) => (
            <ToggleGroupItem key={admin.id} value={admin.id.toString()} className="text-xs">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: adminColorMap.get(admin.id) || '#6b7280' }} />
              {admin.firstName} {admin.lastName}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );

  return (
    <>
      <CalendarShell
        title="Veckoschema & Bokningar"
        subtitle="Klicka på en tom tid i kalendern för att lägga till tillgänglighet eller upptagen tid."
        events={events}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        noClassDates={noClassDateObjects}
        nameMap={nameMap}
        helpButton={<HelpDialog helpKey="admin-schedule" />}
        leftActions={
          <Button onClick={() => setShowRecurringDialog(true)}>
            <CalendarIcon className="h-4 w-4 mr-1" /> Återkommande
          </Button>
        }
        rightActions={
          <Button onClick={() => setShowAppointmentDialog(true)} className="ml-4">
            <Plus className="h-4 w-4 mr-1" /> Föreslå möte
          </Button>
        }
        legend={legend}
      />

      <BookingDetailsDialog
        open={showBookingDetails}
        onOpenChange={setShowBookingDetails}
        booking={selectedBooking}
        role="admin"
        nameMap={nameMap}
        teachers={otherTeachers}
        onAccept={async (id, reason) => {
          await updateStatus.mutateAsync({ id, status: 'Accepted', reason });
          toast({ title: 'Godkänd' });
        }}
        onDecline={async (id, reason) => {
          await updateStatus.mutateAsync({ id, status: 'Declined', reason });
          toast({ title: 'Nekad' });
        }}
        onCancel={async (id, reason) => {
          await cancelBookingMut.mutateAsync({ id, reason });
          toast({ title: 'Avbokad' });
        }}
        onReschedule={async (id, startTime, endTime, reason) => {
          await rescheduleMut.mutateAsync({ id, startTime, endTime, reason, rescheduledBy: 'Admin' });
          toast({ title: 'Ombokning skickad' });
        }}
        onTransfer={async (id, targetAdminId) => {
          await transferMut.mutateAsync({ id, targetAdminId });
          toast({ title: 'Mötet har överförts' });
        }}
      />

      <AdminBookingDialog
        open={showAppointmentDialog}
        onOpenChange={setShowAppointmentDialog}
        currentDate={currentDate}
        coaches={coaches}
        students={students}
        onSubmit={handleCreateAppointment}
      />

      <RecurringEventDialog
        open={showRecurringDialog}
        onOpenChange={setShowRecurringDialog}
        admins={allAdmins.map((a) => ({ id: a.id, name: `${a.firstName} ${a.lastName}` }))}
        currentAdminId={adminId}
        onSubmit={async (data) => {
          await createRecurring.mutateAsync(data);
          toast({ title: 'Återkommande event skapat' });
        }}
      />

      <RecurringEventClickDialog
        open={showRecurringClickDialog}
        onOpenChange={setShowRecurringClickDialog}
        instance={selectedRecurringInstance}
        canEdit={true}
        onEditThis={async (data) => {
          if (!selectedRecurringInstance) return;
          await setException.mutateAsync({
            id: selectedRecurringInstance.eventId,
            date: selectedRecurringInstance.date,
            ...data,
          });
          toast({ title: 'Tillfälle uppdaterat' });
        }}
        onEditAll={async (data) => {
          if (!selectedRecurringInstance) return;
          await updateRecurring.mutateAsync({ id: selectedRecurringInstance.eventId, ...data });
          toast({ title: 'Event uppdaterat' });
        }}
        onDeleteThis={async () => {
          if (!selectedRecurringInstance) return;
          await setException.mutateAsync({
            id: selectedRecurringInstance.eventId,
            date: selectedRecurringInstance.date,
            isDeleted: true,
          });
          toast({ title: 'Tillfälle borttaget' });
        }}
        onDeleteAll={async () => {
          if (!selectedRecurringInstance) return;
          await deleteRecurring.mutateAsync(selectedRecurringInstance.eventId);
          toast({ title: 'Event borttaget' });
        }}
      />

      <Dialog open={showEditAvailDialog} onOpenChange={setShowEditAvailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redigera tillgänglighet</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-1">
                {selectedAvailability && <p className="text-sm">{format(new Date(selectedAvailability.startTime), 'yyyy-MM-dd')}</p>}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Starttid</Label>
              <Select
                value={`${editAvailStartHour}:${editAvailStartMinute}`}
                onValueChange={(val) => {
                  const [h, m] = val.split(':').map(Number);
                  setEditAvailStartHour(h); setEditAvailStartMinute(m);
                  if (editAvailEndHour * 60 + editAvailEndMinute <= h * 60 + m) {
                    const next = ALL_TIME_OPTIONS.find((o) => o.hour * 60 + o.minute > h * 60 + m);
                    if (next) { setEditAvailEndHour(next.hour); setEditAvailEndMinute(next.minute); }
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TIME_OPTIONS.slice(0, -1).map((o) => (
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
                  {ALL_TIME_OPTIONS.filter((o) => o.hour * 60 + o.minute > editAvailStartHour * 60 + editAvailStartMinute).map((o) => (
                    <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-3 w-full justify-between">
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleDeleteAvailability}>
                Ta bort
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEditAvailDialog(false)}>Avbryt</Button>
                <Button onClick={handleSaveAvailability}>Spara</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSlotChoiceDialog} onOpenChange={setShowSlotChoiceDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Typ av tidblock</DialogTitle>
            <DialogDescription>
              {slotChoiceStart && slotChoiceEnd && `${format(slotChoiceStart, 'yyyy-MM-dd HH:mm')} – ${format(slotChoiceEnd, 'HH:mm')}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Button onClick={() => handleSlotChoice('availability')}>Tillgänglighet</Button>
            <Button variant="secondary" onClick={() => handleSlotChoice('busy')}>Upptagen</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlotChoiceDialog(false)}>Avbryt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditBusyDialog} onOpenChange={setShowEditBusyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redigera upptagen tid</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-1">
                {selectedBusyTime && <p className="text-sm">{format(new Date(selectedBusyTime.startTime), 'yyyy-MM-dd')}</p>}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Starttid</Label>
              <Select
                value={`${editBusyStartHour}:${editBusyStartMinute}`}
                onValueChange={(val) => {
                  const [h, m] = val.split(':').map(Number);
                  setEditBusyStartHour(h); setEditBusyStartMinute(m);
                  if (editBusyEndHour * 60 + editBusyEndMinute <= h * 60 + m) {
                    const next = ALL_TIME_OPTIONS.find((o) => o.hour * 60 + o.minute > h * 60 + m);
                    if (next) { setEditBusyEndHour(next.hour); setEditBusyEndMinute(next.minute); }
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TIME_OPTIONS.slice(0, -1).map((o) => (
                    <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sluttid</Label>
              <Select
                value={`${editBusyEndHour}:${editBusyEndMinute}`}
                onValueChange={(val) => { const [h, m] = val.split(':').map(Number); setEditBusyEndHour(h); setEditBusyEndMinute(m); }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TIME_OPTIONS.filter((o) => o.hour * 60 + o.minute > editBusyStartHour * 60 + editBusyStartMinute).map((o) => (
                    <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-3 w-full justify-between">
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleDeleteBusyTime}>
                Ta bort
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEditBusyDialog(false)}>Avbryt</Button>
                <Button onClick={handleSaveBusyTime}>Spara</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminSchedule;
