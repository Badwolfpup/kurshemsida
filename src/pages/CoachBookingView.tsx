import React, { useMemo, useState } from 'react';
import { format, isBefore, startOfDay, startOfWeek, addDays, getDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import CalendarShell from '@/components/calendar/CalendarShell';
import BookingDetailsDialog from '@/components/calendar/BookingDetailsDialog';
import { getFreeSegments, getAdminColorMap, RECURRING_EVENT_COLOR, DAY_NAMES, ALL_TIME_OPTIONS } from '@/components/calendar/calendarUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { useBookings, useAvailabilities, useCreateBooking, useUpdateBookingStatus, useCancelBooking, useRescheduleBooking, useBusyTimes } from '@/hooks/useBookings';
import { useRecurringEvents } from '@/hooks/useRecurringEvents';
import { useNoClasses } from '@/hooks/useNoClass';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import HelpDialog from '@/components/HelpDialog';
import type { CalendarEvent, MeetingType } from '@/Types/CalendarTypes';
import type { Booking } from '@/api/BookingService';

function CoachBookingView() {
  const { user } = useAuth();
  const { data: allUsers = [] } = useUsers();
  const { toast } = useToast();
  const coachId = user?.id || 0;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');

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

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Suggestion dialog — shown when coach clicks on calendar
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [bookStart, setBookStart] = useState<Date | null>(null);
  const [bookMeetingType, setBookMeetingType] = useState<MeetingType>('Intro');
  const [bookStudentId, setBookStudentId] = useState<number | null>(null);
  const [bookNote, setBookNote] = useState('');
  const [bookStartHour, setBookStartHour] = useState(8);
  const [bookStartMinute, setBookStartMinute] = useState(30);
  const [bookEndHour, setBookEndHour] = useState(9);
  const [bookEndMinute, setBookEndMinute] = useState(0);

  // Warning confirmation when clicking on busy/recurring
  const [warningKind, setWarningKind] = useState<'busy' | 'recurring' | null>(null);
  const [pendingClickTime, setPendingClickTime] = useState<Date | null>(null);

  const admins = useMemo(
    () => [...allUsers.filter((u) => u.authLevel <= 2 && u.isActive)]
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)),
    [allUsers],
  );
  const myStudents = useMemo(
    () => allUsers.filter((u) => u.authLevel === 4 && u.isActive && u.coachId === coachId),
    [allUsers, coachId],
  );
  const adminColorMap = useMemo(() => getAdminColorMap(admins), [admins]);
  const nameMap = useMemo(() => {
    const map = new Map<number, string>();
    allUsers.forEach((u) => map.set(u.id, `${u.firstName} ${u.lastName}`));
    return map;
  }, [allUsers]);

  const noClassDateObjects = useMemo(
    () => noClassDates.map((d) => startOfDay(new Date(d))),
    [noClassDates],
  );

  // Default to first alphabetical admin on first load
  const hasInitialized = React.useRef(false);
  React.useEffect(() => {
    if (admins.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setSelectedAdminId(admins[0].id.toString());
    }
  }, [admins]);

  const selectedAdminIdNum = selectedAdminId ? Number(selectedAdminId) : null;

  const today = useMemo(() => startOfDay(new Date()), []);
  const SEVEN_DAYS_AGO = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; }, []);

  const myBookings = useMemo(() => allBookings.filter((b) => b.coachId === coachId), [allBookings, coachId]);

  const events = useMemo((): CalendarEvent[] => {
    const result: CalendarEvent[] = [];
    if (!selectedAdminIdNum) return result;

    // Availability overlays for the selected admin — bookings punch visual holes by time overlap
    for (const avail of availabilities) {
      if (avail.adminId !== selectedAdminIdNum) continue;
      const color = adminColorMap.get(avail.adminId) || '#2563eb';
      const freeSegs = getFreeSegments(avail, allBookings);
      for (let i = 0; i < freeSegs.length; i++) {
        const seg = freeSegs[i];
        result.push({
          id: `free-${avail.id}-${i}`,
          title: 'Tillgänglig',
          start: seg.start, end: seg.end, allDay: false,
          resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color, isOwn: true },
        });
      }
    }

    // My bookings with the selected admin
    for (const b of myBookings) {
      if (b.adminId !== selectedAdminIdNum) continue;
      if (b.status === 'Declined' && new Date(b.bookedAt) < SEVEN_DAYS_AGO) continue;
      const adminName = nameMap.get(b.adminId) || '';
      const typeLabel = b.status === 'Pending' ? (b.rescheduledBy ? 'Ombokning' : 'Förfrågan') : b.status === 'Accepted' ? 'Godkänd' : 'Nekad';
      result.push({
        id: `booking-${b.id}`,
        title: `${adminName} – ${typeLabel}`,
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        allDay: false,
        resource: { type: b.status.toLowerCase() as CalendarEvent['resource']['type'], booking: b, isOwn: true },
      });
    }

    // Other coaches' accepted bookings on this admin (masked)
    const otherAccepted = allBookings.filter((b) => b.adminId === selectedAdminIdNum && b.coachId !== coachId && b.status === 'Accepted');
    for (const b of otherAccepted) {
      result.push({
        id: `other-${b.id}`,
        title: 'Upptagen',
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        allDay: false,
        resource: { type: 'accepted', color: '#ef4444', isOwn: false },
      });
    }

    // Busy times for the selected admin
    for (const bt of busyTimes) {
      if (bt.adminId !== selectedAdminIdNum) continue;
      const adminName = nameMap.get(bt.adminId) || '';
      result.push({
        id: `busy-${bt.id}`,
        title: `${adminName} – Upptagen`,
        start: new Date(bt.startTime),
        end: new Date(bt.endTime),
        allDay: false,
        resource: { type: 'busy', busyTimeId: bt.id, adminId: bt.adminId, isOwn: false },
      });
    }

    // Recurring events (always shown)
    for (const inst of recurringInstances) {
      result.push({
        id: `recurring-${inst.eventId}-${inst.date}`,
        title: inst.name,
        start: new Date(inst.start),
        end: new Date(inst.end),
        allDay: false,
        resource: { type: 'recurring', recurringEventId: inst.eventId, color: RECURRING_EVENT_COLOR, isOwn: false, adminId: inst.adminId, classroom: inst.classroom },
      });
    }

    return result;
  }, [selectedAdminIdNum, availabilities, myBookings, allBookings, coachId, adminColorMap, nameMap, SEVEN_DAYS_AGO, recurringInstances, busyTimes]);

  const openBookingDialog = (clickedTime: Date) => {
    setBookStart(clickedTime);
    const h = clickedTime.getHours();
    const m = clickedTime.getMinutes();
    setBookStartHour(h);
    setBookStartMinute(m);
    const endMinTotal = h * 60 + m + 30;
    setBookEndHour(Math.floor(endMinTotal / 60));
    setBookEndMinute(endMinTotal % 60);
    setBookMeetingType('Intro');
    setBookStudentId(null);
    setBookNote('');
    setShowBookDialog(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (isBefore(startOfDay(event.start), today)) return;

    // Own booking → edit dialog
    if (event.resource.booking && event.resource.isOwn) {
      setSelectedBooking(event.resource.booking);
      setShowBookingDetails(true);
      return;
    }

    // Other coach's accepted booking → hard block
    if (event.resource.type === 'accepted' && !event.resource.isOwn) {
      toast({ title: 'Tiden är redan bokad', variant: 'destructive' });
      return;
    }

    // Availability overlay → direct suggestion dialog
    if (event.resource.type === 'availability') {
      openBookingDialog(event.start);
      return;
    }

    // Busy time or recurring event → warning first
    if (event.resource.type === 'busy') {
      setPendingClickTime(event.start);
      setWarningKind('busy');
      return;
    }
    if (event.resource.type === 'recurring') {
      setPendingClickTime(event.start);
      setWarningKind('recurring');
      return;
    }
  };

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    if (isBefore(startOfDay(start), today)) return;
    if (!selectedAdminIdNum) return;
    openBookingDialog(start);
  };

  const confirmWarning = () => {
    if (pendingClickTime) openBookingDialog(pendingClickTime);
    setWarningKind(null);
    setPendingClickTime(null);
  };

  const handleBookSubmit = async () => {
    if (!bookStart || !selectedAdminIdNum) return;
    if (bookMeetingType === 'Followup' && !bookStudentId) return;
    const startTime = new Date(bookStart.getFullYear(), bookStart.getMonth(), bookStart.getDate(), bookStartHour, bookStartMinute);
    const endTime = new Date(bookStart.getFullYear(), bookStart.getMonth(), bookStart.getDate(), bookEndHour, bookEndMinute);
    if (startTime >= endTime) {
      toast({ title: 'Fel', description: 'Starttid måste vara före sluttid.', variant: 'destructive' });
      return;
    }
    try {
      await createBooking.mutateAsync({
        adminId: selectedAdminIdNum,
        studentId: bookMeetingType === 'Followup' ? bookStudentId : null,
        note: bookNote,
        meetingType: bookMeetingType,
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      toast({ title: 'Mötesförfrågan skickad' });
      setShowBookDialog(false);
    } catch (err) {
      toast({ title: 'Kunde inte skicka', description: err instanceof Error ? err.message : 'Okänt fel', variant: 'destructive' });
    }
  };

  const adminToggles = (
    <div className="flex flex-wrap gap-2 mb-4 text-sm items-center">
      <span className="text-muted-foreground font-medium mr-2">Handledare:</span>
      <ToggleGroup
        type="single"
        value={selectedAdminId}
        onValueChange={(v) => { if (v) setSelectedAdminId(v); }}
      >
        {admins.map((admin) => (
          <ToggleGroupItem key={admin.id} value={admin.id.toString()} className="text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: adminColorMap.get(admin.id) || '#6b7280' }} />
            {admin.firstName} {admin.lastName}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );

  // Restrict end-time options so they stay after start-time
  const bookEndOptions = useMemo(
    () => ALL_TIME_OPTIONS.filter((o) => o.hour * 60 + o.minute > bookStartHour * 60 + bookStartMinute),
    [bookStartHour, bookStartMinute],
  );

  return (
    <>
      <CalendarShell
        title="Kalender & Bokning"
        subtitle="Klicka på en tid i kalendern för att föreslå ett möte."
        events={events}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        noClassDates={noClassDateObjects}
        nameMap={nameMap}
        helpButton={<HelpDialog helpKey="coach-booking" />}
        legend={adminToggles}
      />

      <BookingDetailsDialog
        open={showBookingDetails}
        onOpenChange={setShowBookingDetails}
        booking={selectedBooking}
        role="coach"
        nameMap={nameMap}
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
          await rescheduleMut.mutateAsync({ id, startTime, endTime, reason, rescheduledBy: 'Coach' });
          toast({ title: 'Ombokning skickad' });
        }}
      />

      {/* Warning dialog for busy / recurring clicks */}
      <AlertDialog open={warningKind !== null} onOpenChange={(o) => { if (!o) { setWarningKind(null); setPendingClickTime(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {warningKind === 'busy' ? 'Handledaren har markerat denna tid som upptagen' : 'Denna tid krockar med ett återkommande event'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vill du föreslå mötet ändå? Handledaren får själv bestämma om förfrågan ska godkännas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWarning}>Föreslå ändå</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suggestion dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Föreslå möte</DialogTitle>
            <DialogDescription>
              {bookStart && selectedAdminIdNum && (
                <>
                  Handledare: {nameMap.get(selectedAdminIdNum)}<br />
                  {DAY_NAMES[getDay(bookStart)]} {format(bookStart, 'd/M')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Mötestyp</Label>
              <Select value={bookMeetingType} onValueChange={(v) => setBookMeetingType(v as MeetingType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Intro">Intromöte</SelectItem>
                  <SelectItem value="Followup">Uppföljning</SelectItem>
                  <SelectItem value="Other">Annat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bookMeetingType === 'Followup' && (
              <div className="space-y-2">
                <Label>Elev</Label>
                <Select value={bookStudentId?.toString() || ''} onValueChange={(v) => setBookStudentId(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Välj elev..." /></SelectTrigger>
                  <SelectContent>
                    {myStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starttid</Label>
                <Select
                  value={`${bookStartHour}:${bookStartMinute}`}
                  onValueChange={(val) => {
                    const [h, m] = val.split(':').map(Number);
                    setBookStartHour(h); setBookStartMinute(m);
                    if (bookEndHour * 60 + bookEndMinute <= h * 60 + m) {
                      const next = ALL_TIME_OPTIONS.find((o) => o.hour * 60 + o.minute > h * 60 + m);
                      if (next) { setBookEndHour(next.hour); setBookEndMinute(next.minute); }
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
                  value={`${bookEndHour}:${bookEndMinute}`}
                  onValueChange={(val) => { const [h, m] = val.split(':').map(Number); setBookEndHour(h); setBookEndMinute(m); }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {bookEndOptions.map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meddelande (valfritt)</Label>
              <Textarea value={bookNote} onChange={(e) => setBookNote(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookDialog(false)}>Avbryt</Button>
            <Button
              onClick={handleBookSubmit}
              disabled={bookMeetingType === 'Followup' && !bookStudentId}
            >
              Skicka förfrågan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}

export default CoachBookingView;
