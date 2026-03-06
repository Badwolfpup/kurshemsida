import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ALL_TIME_OPTIONS, padTime } from './calendarUtils';

const WEEKDAY_OPTIONS = [
  { value: '1', label: 'Måndag' },
  { value: '2', label: 'Tisdag' },
  { value: '3', label: 'Onsdag' },
  { value: '4', label: 'Torsdag' },
];

interface RecurringEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admins?: { id: number; name: string }[];
  currentAdminId?: number;
  onSubmit: (data: {
    name: string;
    weekday: number;
    startTime: string;
    endTime: string;
    frequency: string;
    startDate: string;
    adminId?: number;
  }) => Promise<void>;
}

export default function RecurringEventDialog({ open, onOpenChange, admins, currentAdminId, onSubmit }: RecurringEventDialogProps) {
  const [name, setName] = useState('');
  const [weekday, setWeekday] = useState('1');
  const [selectedAdminId, setSelectedAdminId] = useState<string>(currentAdminId?.toString() || '');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  const [frequency, setFrequency] = useState('weekly');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setName('');
    setWeekday('1');
    setFrequency('weekly');
    setSelectedAdminId(currentAdminId?.toString() || '');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        weekday: Number(weekday),
        startTime: padTime(startHour, startMinute),
        endTime: padTime(endHour, endMinute),
        frequency,
        startDate: new Date().toISOString(),
        adminId: selectedAdminId ? Number(selectedAdminId) : undefined,
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
          <DialogTitle>Nytt återkommande event</DialogTitle>
          <DialogDescription>Skapa ett event som upprepas varje vecka eller varannan vecka.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Namn</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="T.ex. Coachträff" />
          </div>

          {admins && admins.length > 0 && (
            <div className="space-y-2">
              <Label>Ansvarig lärare</Label>
              <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {admins.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Veckodag</Label>
            <Select value={weekday} onValueChange={setWeekday}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {WEEKDAY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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
            <Label>Frekvens</Label>
            <ToggleGroup type="single" value={frequency} onValueChange={(v) => { if (v) setFrequency(v); }}>
              <ToggleGroupItem value="weekly">Varje vecka</ToggleGroupItem>
              <ToggleGroupItem value="biweekly">Varannan vecka</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Avbryt</Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>Skapa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
