import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import SplitButton from '@/components/ui/SplitButton';
import type { Booking, Availability } from '@/api/BookingService';
import { ALL_TIME_OPTIONS } from './calendarUtils';
import { startOfDay, isBefore } from 'date-fns';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  role: 'admin' | 'coach' | 'student';
  nameMap: Map<number, string>;
  availabilities?: Availability[];
  teachers?: Teacher[];
  onAccept?: (id: number, reason?: string) => Promise<void>;
  onDecline?: (id: number, reason?: string) => Promise<void>;
  onCancel?: (id: number, reason?: string) => Promise<void>;
  onReschedule?: (id: number, startTime: string, endTime: string, reason?: string) => Promise<void>;
  onTransfer?: (id: number, targetAdminId: number) => Promise<void>;
}

export default function BookingDetailsDialog({
  open,
  onOpenChange,
  booking,
  role,
  nameMap,
  availabilities = [],
  teachers = [],
  onAccept,
  onDecline,
  onCancel,
  onReschedule,
  onTransfer,
}: BookingDetailsDialogProps) {
  const [mode, setMode] = useState<'view' | 'reschedule'>('view');
  const [reason, setReason] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState({ hour: 8, minute: 0 });
  const [rescheduleEnd, setRescheduleEnd] = useState({ hour: 9, minute: 0 });
  const [transferTargetId, setTransferTargetId] = useState<number | null>(null);
  const [confirmTransfer, setConfirmTransfer] = useState<{ targetId: number; targetName: string } | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const isInPast = booking ? isBefore(startOfDay(new Date(booking.startTime)), today) : false;

  const rescheduleOptions = useMemo(() => {
    if (!booking) return ALL_TIME_OPTIONS;
    const avail = availabilities.find((a) => a.id === booking.adminAvailabilityId);
    if (!avail) return ALL_TIME_OPTIONS;
    const aStart = new Date(avail.startTime);
    const aEnd = new Date(avail.endTime);
    return ALL_TIME_OPTIONS.filter((o) => {
      const total = o.hour * 60 + o.minute;
      return total >= aStart.getHours() * 60 + aStart.getMinutes() &&
             total <= aEnd.getHours() * 60 + aEnd.getMinutes();
    });
  }, [booking, availabilities]);

  const rescheduleEndOptions = useMemo(() => {
    const startTotal = rescheduleStart.hour * 60 + rescheduleStart.minute;
    return rescheduleOptions.filter((o) => o.hour * 60 + o.minute > startTotal);
  }, [rescheduleOptions, rescheduleStart]);

  const otherTeachers = useMemo(() => {
    if (!booking) return [];
    return teachers.filter((t) => t.id !== booking.adminId);
  }, [teachers, booking]);

  const handleClose = () => {
    onOpenChange(false);
    setMode('view');
    setReason('');
    setTransferTargetId(null);
  };

  const canRespond = !isInPast && booking;
  const isRescheduledByOther = booking?.status === 'rescheduled' && (
    (role === 'admin' && booking.rescheduledBy === 'coach') ||
    (role === 'coach' && booking.rescheduledBy === 'admin') ||
    (role === 'student' && booking.rescheduledBy === 'admin')
  );

  // Map role prop to the role string stored in CreatedByRole
  const createdByCurrentUser = booking?.createdByRole
    ? (role === 'admin' && (booking.createdByRole === 'Admin' || booking.createdByRole === 'Teacher'))
      || (role === 'coach' && booking.createdByRole === 'Coach')
      || (role === 'student' && booking.createdByRole === 'Student')
    : false;

  const canAcceptDecline = canRespond && (
    (booking?.status === 'pending' && !createdByCurrentUser) ||
    isRescheduledByOther
  );

  const canWithdrawRequest = canRespond && booking?.status === 'pending' && createdByCurrentUser;

  const canCancelBooking = canRespond && booking?.status === 'accepted';
  const canReschedule = canRespond && (booking.status === 'accepted' || booking.status === 'pending' || isRescheduledByOther);
  const canTransfer = canRespond && role === 'admin' && booking.status === 'accepted' && onTransfer && otherTeachers.length > 0;

  const openRescheduleMode = () => {
    if (!booking) return;
    const s = new Date(booking.startTime);
    const e = new Date(booking.endTime);
    setRescheduleStart({ hour: s.getHours(), minute: s.getMinutes() });
    setRescheduleEnd({ hour: e.getHours(), minute: e.getMinutes() });
    setMode('reschedule');
  };

  const isSameTime = booking
    ? rescheduleStart.hour === new Date(booking.startTime).getHours() &&
      rescheduleStart.minute === new Date(booking.startTime).getMinutes() &&
      rescheduleEnd.hour === new Date(booking.endTime).getHours() &&
      rescheduleEnd.minute === new Date(booking.endTime).getMinutes()
    : false;

  const handleReschedule = async () => {
    if (!booking || !onReschedule || isSameTime) return;
    const base = new Date(booking.startTime);
    const newStart = new Date(base.getFullYear(), base.getMonth(), base.getDate(), rescheduleStart.hour, rescheduleStart.minute);
    const newEnd = new Date(base.getFullYear(), base.getMonth(), base.getDate(), rescheduleEnd.hour, rescheduleEnd.minute);
    await onReschedule(
      booking.id,
      format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
      format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      reason || undefined
    );
    handleClose();
  };

  const handleAcceptForTeacher = (teacherId: number) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    setConfirmTransfer({ targetId: teacherId, targetName: `${teacher.firstName} ${teacher.lastName}` });
  };

  const handleTransferClick = () => {
    if (!transferTargetId) return;
    const teacher = teachers.find((t) => t.id === transferTargetId);
    if (!teacher) return;
    setConfirmTransfer({ targetId: transferTargetId, targetName: `${teacher.firstName} ${teacher.lastName}` });
  };

  const [transferError, setTransferError] = useState('');

  const handleConfirmTransfer = async () => {
    if (!booking || !onTransfer || !confirmTransfer) return;
    setTransferError('');
    try {
      await onTransfer(booking.id, confirmTransfer.targetId);
      setConfirmTransfer(null);
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Överföring misslyckades';
      setTransferError(
        msg.includes('already has a booking') ? 'Läraren har redan ett möte vid den tiden.'
        : msg.includes('preset intro') ? 'Läraren har en förinställd introtid då — bara intromöten tillåtna.'
        : msg
      );
    }
  };

  const meetingTypeLabel = (type: string) => {
    switch (type) {
      case 'intro': return 'Intromöte';
      case 'followup': return 'Uppföljning';
      case 'session': return 'Handledning';
      case 'other': return 'Annat';
      default: return type || '—';
    }
  };

  if (!booking) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === 'reschedule' ? 'Ändra tid' :
                booking.status === 'pending' ? 'Bokningsförfrågan' :
                booking.status === 'rescheduled' ? 'Ombokning – svar krävs' :
                booking.status === 'accepted' ? 'Godkänd bokning' : 'Nekad bokning'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 mt-2">
                {mode === 'view' && (
                  <>
                    {booking.coachId && (
                      <p><strong>Coach:</strong> {nameMap.get(booking.coachId) || `ID ${booking.coachId}`}</p>
                    )}
                    <p>
                      <strong>Tid:</strong>{' '}
                      {format(new Date(booking.startTime), 'yyyy-MM-dd HH:mm')} – {format(new Date(booking.endTime), 'HH:mm')}
                    </p>
                    <p><strong>Mötestyp:</strong> {meetingTypeLabel(booking.meetingType)}</p>
                    {booking.studentId && (
                      <p><strong>Elev:</strong> {nameMap.get(booking.studentId) || `ID ${booking.studentId}`}</p>
                    )}
                    {booking.note && <p><strong>Meddelande:</strong> {booking.note}</p>}
                    {booking.reason && role === 'admin' && <p><strong>Anledning:</strong> {booking.reason}</p>}
                    {booking.reason && role !== 'admin' && <p><strong>Anledning:</strong> Upptagen</p>}
                    <p className="text-xs text-muted-foreground">Bokad: {format(new Date(booking.bookedAt), 'yyyy-MM-dd HH:mm')}</p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {mode === 'reschedule' && (
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
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {mode === 'view' && (canAcceptDecline || canCancelBooking) && (
            <div className="space-y-2 pt-2">
              <Label>Anledning (valfritt)</Label>
              <Textarea
                placeholder="Ange anledning..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Transfer section for accepted bookings */}
          {mode === 'view' && canTransfer && (
            <div className="space-y-2 pt-2 border-t">
              <Label>Överlåt till annan lärare</Label>
              <div className="flex gap-2">
                <Select
                  value={transferTargetId?.toString() ?? ''}
                  onValueChange={(val) => setTransferTargetId(Number(val))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Välj lärare..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherTeachers.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.firstName} {t.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  disabled={!transferTargetId}
                  onClick={handleTransferClick}
                >
                  Överlåt
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            {mode === 'reschedule' ? (
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline" onClick={() => setMode('view')}>Tillbaka</Button>
                <Button onClick={handleReschedule} disabled={isSameTime}>Föreslå ny tid</Button>
              </div>
            ) : canAcceptDecline ? (
              <div className="flex gap-3 w-full justify-end">
                {onDecline && (
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={async () => { await onDecline(booking.id, reason || undefined); handleClose(); }}>
                    <X className="h-4 w-4 mr-1" /> Neka
                  </Button>
                )}
                {canReschedule && onReschedule && role !== 'student' && (
                  <Button variant="outline" onClick={openRescheduleMode}>Föreslå annan tid</Button>
                )}
                {onAccept && role === 'admin' && onTransfer && otherTeachers.length > 0 ? (
                  <SplitButton
                    mainLabel={<><Check className="h-4 w-4 mr-1" /> Godkänn</>}
                    onMainClick={async () => { await onAccept(booking.id, reason || undefined); handleClose(); }}
                    options={otherTeachers.map((t) => ({ id: t.id, label: `Godkänn för ${t.firstName} ${t.lastName}` }))}
                    onOptionSelect={handleAcceptForTeacher}
                    className="bg-green-600 hover:bg-green-700 text-white [&_button]:bg-green-600 [&_button]:hover:bg-green-700 [&_button]:text-white"
                  />
                ) : onAccept ? (
                  <Button className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={async () => { await onAccept(booking.id, reason || undefined); handleClose(); }}>
                    <Check className="h-4 w-4 mr-1" /> Godkänn
                  </Button>
                ) : null}
              </div>
            ) : canCancelBooking ? (
              <div className="flex gap-3 w-full justify-end">
                {onCancel && (
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={async () => { await onCancel(booking.id, reason || undefined); handleClose(); }}>
                    <X className="h-4 w-4 mr-1" /> Avboka
                  </Button>
                )}
                {canReschedule && onReschedule && role !== 'student' && (
                  <Button variant="outline" onClick={openRescheduleMode}>Ändra tid</Button>
                )}
              </div>
            ) : canWithdrawRequest ? (
              <div className="flex gap-3 w-full justify-end">
                {onCancel && (
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={async () => { await onCancel(booking.id, reason || undefined); handleClose(); }}>
                    <X className="h-4 w-4 mr-1" /> Avbryt förfrågan
                  </Button>
                )}
              </div>
            ) : (
              <Button variant="outline" onClick={handleClose}>Stäng</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for transfer */}
      <AlertDialog open={!!confirmTransfer} onOpenChange={(o) => { if (!o) { setConfirmTransfer(null); setTransferError(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bekräfta överföring</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker att du vill överföra det här mötet till {confirmTransfer?.targetName}?
              {transferError && <p className="text-destructive mt-2 font-medium">{transferError}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            {!transferError && (
              <Button onClick={handleConfirmTransfer}>Bekräfta</Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
