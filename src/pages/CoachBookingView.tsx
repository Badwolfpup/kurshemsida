import React, { useMemo, useState } from 'react';
import { format, isBefore, startOfDay, startOfWeek, addDays, getDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import CalendarShell from '@/components/calendar/CalendarShell';
import BookingDetailsDialog from '@/components/calendar/BookingDetailsDialog';
import ConflictDialog from '@/components/calendar/ConflictDialog';
import { getFreeSegments, getAdminColorMap, RECURRING_EVENT_COLOR, DAY_NAMES, ALL_TIME_OPTIONS } from '@/components/calendar/calendarUtils';
import { fourDayRange } from '@/components/calendar/FourDayView';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { useBookings, useAvailabilities, useCreateBooking, useUpdateBookingStatus, useCancelBooking, useRescheduleBooking } from '@/hooks/useBookings';
import { useRecurringEvents } from '@/hooks/useRecurringEvents';
import { useNoClasses } from '@/hooks/useNoClass';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus } from 'lucide-react';
import HelpDialog from '@/components/HelpDialog';
import type { CalendarEvent } from '@/Types/CalendarTypes';
import type { Booking, Availability, BookingConflictError } from '@/api/BookingService';

function CoachBookingView() {
  const { user } = useAuth();
  const { data: allUsers = [] } = useUsers();
  const { toast } = useToast();
  const coachId = user?.id || 0;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);

  // Data
  const { data: allBookings = [] } = useBookings();
  const { data: availabilities = [] } = useAvailabilities();
  const weekStart = startOfWeek(currentDate, { locale: sv });
  const weekEnd = addDays(weekStart, 6);
  const { data: recurringInstances = [] } = useRecurringEvents(weekStart, weekEnd);
  const { data: noClassDates = [] } = useNoClasses();

  // Mutations
  const createBooking = useCreateBooking();
  const updateStatus = useUpdateBookingStatus();
  const cancelBookingMut = useCancelBooking();
  const rescheduleMut = useRescheduleBooking();

  // Dialog state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Booking dialog (click on free slot)
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [bookDialogAvail, setBookDialogAvail] = useState<Availability | null>(null);
  const [bookDialogStart, setBookDialogStart] = useState<Date | null>(null);
  const [bookMeetingType, setBookMeetingType] = useState<string>('intro');
  const [bookStudentId, setBookStudentId] = useState<number | null>(null);
  const [bookNote, setBookNote] = useState('');
  const [bookStartHour, setBookStartHour] = useState(9);
  const [bookStartMinute, setBookStartMinute] = useState(0);
  const [bookEndHour, setBookEndHour] = useState(9);
  const [bookEndMinute, setBookEndMinute] = useState(30);

  // Suggest meeting dialog
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  const [suggestAdminId, setSuggestAdminId] = useState<number | null>(null);
  const [suggestMeetingType, setSuggestMeetingType] = useState<string>('intro');
  const [suggestStudentId, setSuggestStudentId] = useState<number | null>(null);
  const [suggestDay, setSuggestDay] = useState('');
  const [suggestStartHour, setSuggestStartHour] = useState(9);
  const [suggestStartMinute, setSuggestStartMinute] = useState(0);
  const [suggestEndHour, setSuggestEndHour] = useState(9);
  const [suggestEndMinute, setSuggestEndMinute] = useState(30);
  const [suggestNote, setSuggestNote] = useState('');

  // Conflict
  const [conflictErrorBookings, setConflictErrorBookings] = useState<Booking[]>([]);
  const [showConflictError, setShowConflictError] = useState(false);
  const [conflictWarningBookings, setConflictWarningBookings] = useState<Booking[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [pendingForceData, setPendingForceData] = useState<Parameters<typeof createBooking.mutateAsync>[0] | null>(null);

  // Derived
  const admins = useMemo(() =>
    allUsers.filter((u) => u.authLevel <= 2 && u.isActive && u.firstName !== 'Alexandra'),
    [allUsers]
  );

  // Hardcoded preset intro slots: Victoria Tuesday 10-11, Adam Thursday 11-12
  // dayOfWeek uses JS Date.getDay() values: 0=Sun, 2=Tue, 4=Thu
  const INTRO_PRESETS = useMemo(() => {
    const victoria = admins.find((a) => a.firstName === 'Victoria');
    const adam = admins.find((a) => a.firstName === 'Adam');
    return [
      ...(victoria ? [{ adminId: victoria.id, dayOfWeek: 2, startHour: 10, endHour: 11 }] : []),
      ...(adam     ? [{ adminId: adam.id,     dayOfWeek: 4, startHour: 11, endHour: 12 }] : []),
    ];
  }, [admins]);
  const myStudents = useMemo(() =>
    allUsers.filter((u) => u.authLevel === 4 && u.isActive && u.coachId === coachId),
    [allUsers, coachId]
  );
  const adminColorMap = useMemo(() => getAdminColorMap(admins), [admins]);
  const nameMap = useMemo(() => {
    const map = new Map<number, string>();
    allUsers.forEach((u) => map.set(u.id, `${u.firstName} ${u.lastName}`));
    return map;
  }, [allUsers]);

  const noClassDateObjects = useMemo(() =>
    noClassDates.map((d) => startOfDay(new Date(d))),
    [noClassDates]
  );

  // Auto-select all admins on first load only
  const hasInitialized = React.useRef(false);
  React.useEffect(() => {
    if (admins.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setSelectedAdminIds(admins.map((a) => a.id.toString()));
    }
  }, [admins]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const SEVEN_DAYS_AGO = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; }, []);

  const myBookings = useMemo(() => allBookings.filter((b) => b.coachId === coachId), [allBookings, coachId]);

  // Filter availabilities to selected admins
  const filteredAvailabilities = useMemo(() =>
    availabilities.filter((a) => selectedAdminIds.includes(a.adminId.toString())),
    [availabilities, selectedAdminIds]
  );

  // Returns true if a specific time falls within a preset intro window for the given admin
  const isTimeInPresetIntro = (adminId: number, date: Date, hour: number): boolean => {
    const dayOfWeek = date.getDay();
    return INTRO_PRESETS.some(
      (p) => p.adminId === adminId && p.dayOfWeek === dayOfWeek && hour >= p.startHour && hour < p.endHour
    );
  };

  // Returns true if a free segment overlaps any preset intro window
  const segmentOverlapsPresetIntro = (adminId: number, start: Date, end: Date): boolean => {
    const dayOfWeek = start.getDay();
    const segStartHour = start.getHours() + start.getMinutes() / 60;
    const segEndHour = end.getHours() + end.getMinutes() / 60;
    return INTRO_PRESETS.some(
      (p) => p.adminId === adminId && p.dayOfWeek === dayOfWeek && segStartHour < p.endHour && segEndHour > p.startHour
    );
  };

  // Build events
  const events = useMemo((): CalendarEvent[] => {
    const result: CalendarEvent[] = [];

    // Free segments — split at preset intro boundaries so the label only covers preset rows
    for (const avail of filteredAvailabilities) {
      const color = adminColorMap.get(avail.adminId) || '#2563eb';
      const freeSegs = getFreeSegments(avail, allBookings);
      for (let i = 0; i < freeSegs.length; i++) {
        const seg = freeSegs[i];
        if (seg.start.getHours() >= 15 || seg.end.getHours() < 8) continue;

        // Find matching preset for this admin + day
        const dayOfWeek = seg.start.getDay();
        const preset = INTRO_PRESETS.find(
          (p) => p.adminId === avail.adminId && p.dayOfWeek === dayOfWeek
        );

        if (!preset) {
          // No preset on this day — render as-is
          result.push({
            id: `free-${avail.id}-${i}`,
            title: 'Tillgänglig',
            start: seg.start, end: seg.end, allDay: false,
            resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color, isOwn: true },
          });
          continue;
        }

        // Split segment into: before preset, preset, after preset
        const presetStart = new Date(seg.start); presetStart.setHours(preset.startHour, 0, 0, 0);
        const presetEnd = new Date(seg.start); presetEnd.setHours(preset.endHour, 0, 0, 0);
        const segStartMs = seg.start.getTime();
        const segEndMs = seg.end.getTime();
        const pStartMs = presetStart.getTime();
        const pEndMs = presetEnd.getTime();

        // No overlap — segment is entirely outside preset window
        if (segEndMs <= pStartMs || segStartMs >= pEndMs) {
          result.push({
            id: `free-${avail.id}-${i}`,
            title: 'Tillgänglig',
            start: seg.start, end: seg.end, allDay: false,
            resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color, isOwn: true },
          });
          continue;
        }

        // Part before preset
        if (segStartMs < pStartMs) {
          result.push({
            id: `free-${avail.id}-${i}-pre`,
            title: 'Tillgänglig',
            start: seg.start, end: presetStart, allDay: false,
            resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color, isOwn: true },
          });
        }

        // Preset overlap part
        const overlapStart = segStartMs > pStartMs ? seg.start : presetStart;
        const overlapEnd = segEndMs < pEndMs ? seg.end : presetEnd;
        result.push({
          id: `free-${avail.id}-${i}-intro`,
          title: 'Bara för intromöte',
          start: overlapStart, end: overlapEnd, allDay: false,
          resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color: color + '80', isOwn: true },
        });

        // Part after preset
        if (segEndMs > pEndMs) {
          result.push({
            id: `free-${avail.id}-${i}-post`,
            title: 'Tillgänglig',
            start: presetEnd, end: seg.end, allDay: false,
            resource: { type: 'availability', availabilityId: avail.id, availability: avail, adminId: avail.adminId, color, isOwn: true },
          });
        }
      }
    }

    // My bookings
    for (const b of myBookings) {
      if (b.status === 'declined' && new Date(b.bookedAt) < SEVEN_DAYS_AGO) continue;
      const adminName = nameMap.get(b.adminId) || '';
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

    // Other coaches' bookings on selected admins
    if (selectedAdminIds.length > 0) {
      const otherBookings = allBookings.filter((b) => selectedAdminIds.includes(b.adminId.toString()) && b.coachId !== coachId && b.status !== 'declined');
      for (const b of otherBookings) {
        result.push({
          id: `other-${b.id}`,
          title: 'Upptagen',
          start: new Date(b.startTime),
          end: new Date(b.endTime),
          allDay: false,
          resource: { type: b.status as CalendarEvent['resource']['type'], color: '#ef4444', isOwn: false },
        });
      }
    }

    // Recurring events (read-only) — always show regardless of teacher toggle
    const filteredRecurring = recurringInstances;
    for (const inst of filteredRecurring) {
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
  }, [filteredAvailabilities, myBookings, allBookings, selectedAdminIds, coachId, adminColorMap, nameMap, SEVEN_DAYS_AGO, recurringInstances]);

  // Open booking dialog from free slot click
  // Auto-switch to 'intro' when selected start time enters a preset window
  React.useEffect(() => {
    if (bookDialogAvail && bookDialogStart) {
      const inPreset = isTimeInPresetIntro(bookDialogAvail.adminId, bookDialogStart, bookStartHour);
      if (inPreset && bookMeetingType === 'followup') {
        setBookMeetingType('intro');
      }
    }
  }, [bookStartHour, bookDialogAvail, bookDialogStart, bookMeetingType, INTRO_PRESETS]);

  const openBookingDialog = (avail: Availability, clickedTime: Date) => {
    setBookDialogAvail(avail);
    setBookDialogStart(clickedTime);
    setBookStartHour(clickedTime.getHours());
    setBookStartMinute(clickedTime.getMinutes());
    const endMin = clickedTime.getMinutes() + 30;
    setBookEndHour(endMin >= 60 ? clickedTime.getHours() + 1 : clickedTime.getHours());
    setBookEndMinute(endMin % 60);
    setBookMeetingType('intro');
    setBookStudentId(null);
    setBookNote('');
    setShowBookDialog(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource.type === 'availability' && event.resource.availability) {
      if (isBefore(startOfDay(event.start), today)) return;
      // Calculate clicked time (snap to 30 min)
      openBookingDialog(event.resource.availability, event.start);
      return;
    }

    if (event.resource.booking && event.resource.isOwn) {
      setSelectedBooking(event.resource.booking);
      setShowBookingDetails(true);
    }
  };

  const handleBookSlot = async () => {
    if (!bookDialogAvail) return;
    const base = bookDialogStart || new Date();
    const startTime = new Date(base.getFullYear(), base.getMonth(), base.getDate(), bookStartHour, bookStartMinute);
    const endTime = new Date(base.getFullYear(), base.getMonth(), base.getDate(), bookEndHour, bookEndMinute);
    if (startTime >= endTime) {
      toast({ title: 'Fel', description: 'Starttid måste vara före sluttid.', variant: 'destructive' });
      return;
    }
    try {
      await createBooking.mutateAsync({
        adminAvailabilityId: bookDialogAvail.id,
        studentId: bookStudentId,
        note: bookNote,
        meetingType: bookMeetingType,
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      toast({ title: 'Bokad' });
      setShowBookDialog(false);
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte boka.', variant: 'destructive' });
    }
  };

  const handleSuggestMeeting = async () => {
    if (!suggestAdminId || !suggestDay) return;
    if (suggestMeetingType === 'followup' && !suggestStudentId) return;

    const dayDate = new Date(suggestDay);
    const startTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), suggestStartHour, suggestStartMinute);
    const endTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), suggestEndHour, suggestEndMinute);
    if (startTime >= endTime) {
      toast({ title: 'Fel', description: 'Starttid måste vara före sluttid.', variant: 'destructive' });
      return;
    }

    const data = {
      adminId: suggestAdminId,
      studentId: suggestMeetingType === 'followup' ? suggestStudentId : null,
      meetingType: suggestMeetingType,
      note: suggestNote,
      startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
      force: false,
    };

    try {
      await createBooking.mutateAsync(data);
      toast({ title: 'Mötesförfrågan skickad' });
      setShowSuggestDialog(false);
      resetSuggestDialog();
    } catch (err) {
      const conflictErr = err as BookingConflictError;
      if (conflictErr.conflictData?.type === 'conflict') {
        setConflictErrorBookings(conflictErr.conflictData.bookings);
        setShowConflictError(true);
      } else if (conflictErr.conflictData?.type === 'warning') {
        setPendingForceData({ ...data, force: true });
        setConflictWarningBookings(conflictErr.conflictData.bookings);
        setShowConflictWarning(true);
      } else {
        toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte skicka.', variant: 'destructive' });
      }
    }
  };

  const handleConfirmWarning = async () => {
    if (!pendingForceData) return;
    setShowConflictWarning(false);
    try {
      await createBooking.mutateAsync(pendingForceData);
      toast({ title: 'Mötesförfrågan skickad' });
      setShowSuggestDialog(false);
      resetSuggestDialog();
    } catch (err) {
      toast({ title: 'Fel', description: err instanceof Error ? err.message : 'Kunde inte skicka.', variant: 'destructive' });
    } finally {
      setPendingForceData(null);
      setConflictWarningBookings([]);
    }
  };

  const resetSuggestDialog = () => {
    setSuggestAdminId(null);
    setSuggestMeetingType('intro');
    setSuggestStudentId(null);
    setSuggestDay('');
    setSuggestNote('');
  };

  // Admin toggle (multi-select)
  const adminTabs = (
    <div className="flex flex-wrap gap-2 mb-4 text-sm items-center">
      <span className="text-muted-foreground font-medium mr-2">Visa tillgänglighet:</span>
      <ToggleGroup type="multiple" value={selectedAdminIds} onValueChange={setSelectedAdminIds}>
        {admins.map((admin) => (
          <ToggleGroupItem key={admin.id} value={admin.id.toString()} className="text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: adminColorMap.get(admin.id) || '#6b7280' }} />
            {admin.firstName} {admin.lastName}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );

  // Availability time options for booking dialog
  const bookTimeOptions = useMemo(() => {
    if (!bookDialogAvail) return ALL_TIME_OPTIONS;
    const as = new Date(bookDialogAvail.startTime);
    const ae = new Date(bookDialogAvail.endTime);
    return ALL_TIME_OPTIONS.filter((o) => {
      const t = o.hour * 60 + o.minute;
      return t >= as.getHours() * 60 + as.getMinutes() && t <= ae.getHours() * 60 + ae.getMinutes();
    });
  }, [bookDialogAvail]);

  return (
    <>
      <CalendarShell
        title="Kalender & Bokning"
        subtitle="Klicka på en tillgänglig tid för att boka."
        events={events}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onSelectEvent={handleSelectEvent}
        noClassDates={noClassDateObjects}
        nameMap={nameMap}
        helpButton={<HelpDialog helpKey="coach-booking" />}
        rightActions={
          <Button onClick={() => setShowSuggestDialog(true)} className="ml-4">
            <Plus className="h-4 w-4 mr-1" /> Föreslå möte
          </Button>
        }
        legend={adminTabs}
      />

      {/* Booking details */}
      <BookingDetailsDialog
        open={showBookingDetails}
        onOpenChange={setShowBookingDetails}
        booking={selectedBooking}
        role="coach"
        nameMap={nameMap}
        availabilities={availabilities}
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
        onReschedule={async (id, startTime, endTime, reason) => {
          await rescheduleMut.mutateAsync({ id, startTime, endTime, reason, rescheduledBy: 'coach' });
          toast({ title: 'Ombokning skickad' });
        }}
      />

      {/* Book availability slot dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Boka tid</DialogTitle>
            <DialogDescription>Välj mötestyp och tid.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Mötestyp</Label>
              <Select value={bookMeetingType} onValueChange={setBookMeetingType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="intro">Intromöte</SelectItem>
                  {/* Hide "Uppföljning" when selected start time falls within a preset intro window */}
                  {!(bookDialogAvail && bookDialogStart && isTimeInPresetIntro(
                    bookDialogAvail.adminId,
                    bookDialogStart,
                    bookStartHour
                  )) && (
                    <SelectItem value="followup">Uppföljning</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {bookMeetingType === 'followup' && (
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
                      const next = bookTimeOptions.find((o) => o.hour * 60 + o.minute > h * 60 + m);
                      if (next) { setBookEndHour(next.hour); setBookEndMinute(next.minute); }
                    }
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {bookTimeOptions.slice(0, -1).map((o) => (
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
                    {bookTimeOptions.filter((o) => o.hour * 60 + o.minute > bookStartHour * 60 + bookStartMinute).map((o) => (
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
            <Button onClick={handleBookSlot} disabled={bookMeetingType === 'followup' && !bookStudentId}>Boka</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suggest meeting dialog */}
      <Dialog open={showSuggestDialog} onOpenChange={(o) => { setShowSuggestDialog(o); if (!o) resetSuggestDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Föreslå möte</DialogTitle>
            <DialogDescription>Föreslå en tid utanför tillgängliga tider.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Handledare</Label>
              <Select value={suggestAdminId?.toString() || ''} onValueChange={(v) => setSuggestAdminId(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Välj handledare..." /></SelectTrigger>
                <SelectContent>
                  {admins.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>{a.firstName} {a.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mötestyp</Label>
              <Select value={suggestMeetingType} onValueChange={setSuggestMeetingType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="intro">Intromöte</SelectItem>
                  <SelectItem value="followup">Uppföljning</SelectItem>
                  <SelectItem value="other">Annat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {suggestMeetingType === 'followup' && (
              <div className="space-y-2">
                <Label>Elev</Label>
                <Select value={suggestStudentId?.toString() || ''} onValueChange={(v) => setSuggestStudentId(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Välj elev..." /></SelectTrigger>
                  <SelectContent>
                    {myStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Dag</Label>
              <Select value={suggestDay} onValueChange={setSuggestDay}>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starttid</Label>
                <Select
                  value={`${suggestStartHour}:${suggestStartMinute}`}
                  onValueChange={(val) => {
                    const [h, m] = val.split(':').map(Number);
                    setSuggestStartHour(h); setSuggestStartMinute(m);
                    if (suggestEndHour * 60 + suggestEndMinute <= h * 60 + m) {
                      const next = ALL_TIME_OPTIONS.find((o) => o.hour * 60 + o.minute > h * 60 + m);
                      if (next) { setSuggestEndHour(next.hour); setSuggestEndMinute(next.minute); }
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
                  value={`${suggestEndHour}:${suggestEndMinute}`}
                  onValueChange={(val) => { const [h, m] = val.split(':').map(Number); setSuggestEndHour(h); setSuggestEndMinute(m); }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_TIME_OPTIONS.filter((o) => o.hour * 60 + o.minute > suggestStartHour * 60 + suggestStartMinute).map((o) => (
                      <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meddelande (valfritt)</Label>
              <Textarea value={suggestNote} onChange={(e) => setSuggestNote(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSuggestDialog(false); resetSuggestDialog(); }}>Avbryt</Button>
            <Button onClick={handleSuggestMeeting}>Skicka</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        onOpenChange={(o) => { setShowConflictWarning(o); if (!o) { setPendingForceData(null); setConflictWarningBookings([]); } }}
        type="warning"
        bookings={conflictWarningBookings}
        nameMap={nameMap}
        onConfirm={handleConfirmWarning}
      />
    </>
  );
}

export default CoachBookingView;
