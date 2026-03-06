import { useMemo, useState } from 'react';
import { format, isBefore, startOfDay, getDay } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ALL_TIME_OPTIONS, DAY_NAMES } from './calendarUtils';
import { fourDayRange } from './FourDayView';
import type UserType from '@/Types/User';
import type { Booking } from '@/api/BookingService';
import type { RecurringEventInstance } from '@/Types/CalendarTypes';

interface StudentBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  admins: UserType[];
  bookings: Booking[];
  recurringInstances: RecurringEventInstance[];
  onSubmit: (data: {
    adminId: number;
    note: string;
    startTime: string;
    endTime: string;
    force?: boolean;
  }) => Promise<void>;
}

export default function StudentBookingDialog({
  open,
  onOpenChange,
  currentDate,
  admins,
  bookings,
  recurringInstances,
  onSubmit,
}: StudentBookingDialogProps) {
  const [adminId, setAdminId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [day, setDay] = useState('');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(9);
  const [endMinute, setEndMinute] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  // Get occupied time ranges for the selected admin on the selected day
  const occupiedRanges = useMemo(() => {
    if (!adminId || !day) return [];
    const dayDate = startOfDay(new Date(day));
    const ranges: { start: number; end: number }[] = [];

    // Bookings on this day for this admin (non-declined)
    for (const b of bookings) {
      if (b.adminId !== adminId) continue;
      if (b.status === 'declined') continue;
      const bStart = new Date(b.startTime);
      if (startOfDay(bStart).getTime() !== dayDate.getTime()) continue;
      const bEnd = new Date(b.endTime);
      ranges.push({ start: bStart.getHours() * 60 + bStart.getMinutes(), end: bEnd.getHours() * 60 + bEnd.getMinutes() });
    }

    // Recurring events on this day for this admin
    for (const inst of recurringInstances) {
      if (inst.adminId !== adminId) continue;
      const instDate = startOfDay(new Date(inst.date));
      if (instDate.getTime() !== dayDate.getTime()) continue;
      const iStart = new Date(inst.start);
      const iEnd = new Date(inst.end);
      ranges.push({ start: iStart.getHours() * 60 + iStart.getMinutes(), end: iEnd.getHours() * 60 + iEnd.getMinutes() });
    }

    return ranges;
  }, [adminId, day, bookings, recurringInstances]);

  // Filter time options to exclude occupied times
  const availableStartOptions = useMemo(() => {
    return ALL_TIME_OPTIONS.slice(0, -1).filter((o) => {
      const t = o.hour * 60 + o.minute;
      return !occupiedRanges.some((r) => t >= r.start && t < r.end);
    });
  }, [occupiedRanges]);

  const handleClose = () => {
    onOpenChange(false);
    setAdminId(null);
    setNote('');
    setDay('');
  };

  const handleSubmit = async () => {
    if (!adminId || !day) return;

    const dayDate = new Date(day);
    const startTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), startHour, startMinute);
    const endTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), endHour, endMinute);

    if (startTime >= endTime) return;

    setSubmitting(true);
    try {
      await onSubmit({
        adminId,
        note,
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Boka handledning</DialogTitle>
          <DialogDescription>Välj handledare, dag och tid.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Handledare</Label>
            <Select value={adminId?.toString() || ''} onValueChange={(v) => setAdminId(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Välj handledare..." /></SelectTrigger>
              <SelectContent>
                {admins.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>{a.firstName} {a.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dag</Label>
            <Select value={day} onValueChange={setDay}>
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
                value={`${startHour}:${startMinute}`}
                onValueChange={(val) => {
                  const [h, m] = val.split(':').map(Number);
                  setStartHour(h); setStartMinute(m);
                  if (endHour * 60 + endMinute <= h * 60 + m) {
                    const next = ALL_TIME_OPTIONS.find((o) => o.hour * 60 + o.minute > h * 60 + m);
                    if (next) { setEndHour(next.hour); setEndMinute(next.minute); }
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableStartOptions.map((o) => (
                    <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sluttid</Label>
              <Select
                value={`${endHour}:${endMinute}`}
                onValueChange={(val) => { const [h, m] = val.split(':').map(Number); setEndHour(h); setEndMinute(m); }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TIME_OPTIONS.filter((o) => o.hour * 60 + o.minute > startHour * 60 + startMinute).map((o) => (
                    <SelectItem key={o.label} value={`${o.hour}:${o.minute}`}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meddelande (valfritt)</Label>
            <Textarea
              placeholder="Lägg till ett meddelande..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Avbryt</Button>
          <Button onClick={handleSubmit} disabled={submitting || !adminId || !day}>Boka</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
