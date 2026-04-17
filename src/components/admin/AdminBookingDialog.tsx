import { useMemo, useState } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { ALL_TIME_OPTIONS, DAY_NAMES } from '@/components/calendar/calendarUtils';
import { fourDayRange } from '@/components/calendar/FourDayView';
import { getDay } from 'date-fns';
import type UserType from '@/Types/User';
import type { MeetingType } from '@/Types/CalendarTypes';

interface AdminBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  coaches: UserType[];
  onSubmit: (data: {
    coachId: number;
    meetingType: MeetingType;
    note: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
}

export default function AdminBookingDialog({
  open,
  onOpenChange,
  currentDate,
  coaches,
  onSubmit,
}: AdminBookingDialogProps) {
  const [coachId, setCoachId] = useState<number | null>(null);
  const [meetingType, setMeetingType] = useState<MeetingType>('Followup');
  const [note, setNote] = useState('');
  const [day, setDay] = useState('');
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(30);
  const [endHour, setEndHour] = useState(9);
  const [endMinute, setEndMinute] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showNoteError, setShowNoteError] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  const handleClose = () => {
    onOpenChange(false);
    setCoachId(null);
    setMeetingType('Followup');
    setNote('');
    setDay('');
    setShowNoteError(false);
  };

  const handleSubmit = async () => {
    if (!day || !coachId) return;
    if (meetingType === 'Other' && !note.trim()) {
      setShowNoteError(true);
      return;
    }

    const dayDate = new Date(day);
    const startTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), startHour, startMinute);
    const endTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), endHour, endMinute);

    if (startTime >= endTime) return;

    setSubmitting(true);
    try {
      await onSubmit({
        coachId,
        meetingType,
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
          <DialogTitle>Föreslå möte</DialogTitle>
          <DialogDescription>Välj coach och fyll i detaljer. Coachen godkänner sedan förfrågan.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Coach</Label>
            <Select value={coachId?.toString() || ''} onValueChange={(v) => setCoachId(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Välj coach..." /></SelectTrigger>
              <SelectContent>
                {coaches.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mötestyp</Label>
            <Select value={meetingType} onValueChange={(v) => setMeetingType(v as MeetingType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Followup">Uppföljning</SelectItem>
                <SelectItem value="Other">Annat</SelectItem>
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
                  {ALL_TIME_OPTIONS.slice(0, -1).map((o) => (
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
            <Label>Meddelande {meetingType === 'Other' ? '(krävs)' : '(valfritt)'}</Label>
            <Textarea
              placeholder="Lägg till ett meddelande..."
              value={note}
              onChange={(e) => { setNote(e.target.value); if (e.target.value.trim()) setShowNoteError(false); }}
              rows={2}
              className={showNoteError ? 'border-destructive' : ''}
            />
            {showNoteError && (
              <p className="text-sm text-destructive">Du måste ange ett meddelande för mötestyp "Annat".</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Avbryt</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Skicka förfrågan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
