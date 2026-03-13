import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ALL_TIME_OPTIONS, padTime } from './calendarUtils';
import type { RecurringEventInstance } from '@/Types/CalendarTypes';

interface RecurringEventClickDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: RecurringEventInstance | null;
  canEdit: boolean;
  adminName?: string;
  onEditThis?: (data: { name?: string; startTime?: string; endTime?: string; isDeleted?: boolean }) => Promise<void>;
  onEditAll?: (data: { name?: string; startTime?: string; endTime?: string; frequency?: string; classroom?: number }) => Promise<void>;
  onDeleteThis?: () => Promise<void>;
  onDeleteAll?: () => Promise<void>;
}

export default function RecurringEventClickDialog({
  open,
  onOpenChange,
  instance,
  canEdit,
  adminName,
  onEditThis,
  onEditAll,
  onDeleteThis,
  onDeleteAll,
}: RecurringEventClickDialogProps) {
  const [scope, setScope] = useState<'this' | 'all'>('this');
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [name, setName] = useState('');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  const [frequency, setFrequency] = useState('weekly');
  const [classroom, setClassroom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setMode('view');
    setScope('this');
  };

  const openEditMode = () => {
    if (!instance) return;
    const start = new Date(instance.start);
    const end = new Date(instance.end);
    setName(instance.name);
    setStartHour(start.getHours());
    setStartMinute(start.getMinutes());
    setEndHour(end.getHours());
    setEndMinute(end.getMinutes());
    setFrequency(instance.frequency);
    setClassroom(instance.classroom?.toString() || '');
    setMode('edit');
  };

  const handleSave = async () => {
    if (!instance) return;
    setSubmitting(true);
    try {
      if (scope === 'this') {
        await onEditThis({
          name: name !== instance.name ? name : undefined,
          startTime: padTime(startHour, startMinute),
          endTime: padTime(endHour, endMinute),
        });
      } else {
        await onEditAll({
          name,
          startTime: padTime(startHour, startMinute),
          endTime: padTime(endHour, endMinute),
          frequency,
          classroom: classroom ? Number(classroom) : undefined,
        });
      }
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!instance) return;
    setSubmitting(true);
    try {
      if (scope === 'this') {
        await onDeleteThis();
      } else {
        await onDeleteAll();
      }
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!instance) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{instance.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1">
              <p>{format(new Date(instance.start), 'yyyy-MM-dd HH:mm')} – {format(new Date(instance.end), 'HH:mm')}
              {' '}({instance.frequency === 'weekly' ? 'Varje vecka' : 'Varannan vecka'})</p>
              {adminName && <p><strong>Lärare:</strong> {adminName}</p>}
              {instance.classroom && <p><strong>Sal:</strong> {instance.classroom}</p>}
            </div>
          </DialogDescription>
        </DialogHeader>

        {mode === 'view' && canEdit && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Ändra</Label>
              <ToggleGroup type="single" value={scope} onValueChange={(v) => { if (v) setScope(v as 'this' | 'all'); }}>
                <ToggleGroupItem value="this">Denna gång</ToggleGroupItem>
                <ToggleGroupItem value="all">Alla</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        )}

        {mode === 'edit' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Namn</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
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
            {scope === 'all' && (
              <>
                <div className="space-y-2">
                  <Label>Frekvens</Label>
                  <ToggleGroup type="single" value={frequency} onValueChange={(v) => { if (v) setFrequency(v); }}>
                    <ToggleGroupItem value="weekly">Varje vecka</ToggleGroupItem>
                    <ToggleGroupItem value="biweekly">Varannan vecka</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="space-y-2">
                  <Label>Sal (valfritt)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder="T.ex. 3"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {mode === 'delete' && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {scope === 'this'
                ? 'Vill du ta bort detta enstaka tillfälle?'
                : 'Vill du ta bort alla tillfällen av detta event permanent?'}
            </p>
          </div>
        )}

        <DialogFooter>
          {mode === 'view' ? (
            canEdit ? (
              <div className="flex gap-3 w-full justify-between">
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => setMode('delete')}>
                  Ta bort
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose}>Stäng</Button>
                  <Button onClick={openEditMode}>Redigera</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={handleClose}>Stäng</Button>
            )
          ) : mode === 'edit' ? (
            <div className="flex gap-3 w-full justify-end">
              <Button variant="outline" onClick={() => setMode('view')}>Tillbaka</Button>
              <Button onClick={handleSave} disabled={submitting}>Spara</Button>
            </div>
          ) : (
            <div className="flex gap-3 w-full justify-end">
              <Button variant="outline" onClick={() => setMode('view')}>Tillbaka</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={submitting}>Ta bort</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
