import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Booking } from '@/api/BookingService';

interface ConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'error' | 'warning';
  bookings: Booking[];
  nameMap: Map<number, string>;
  onConfirm?: () => void;
}

export default function ConflictDialog({
  open,
  onOpenChange,
  type,
  bookings,
  nameMap,
  onConfirm,
}: ConflictDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'error' ? 'Tidskollision' : 'Väntande möten kolliderar'}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 mt-2">
              <p>
                {type === 'error'
                  ? 'Det finns redan godkända möten den här tiden:'
                  : 'Det finns redan väntande möten den här tiden:'}
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {bookings.map((b) => (
                  <li key={b.id}>
                    {format(new Date(b.startTime), 'yyyy-MM-dd HH:mm')}–{format(new Date(b.endTime), 'HH:mm')}
                    {' '}– {nameMap.get(b.coachId ?? 0) || (b.studentId ? nameMap.get(b.studentId) : undefined) || 'Okänd'}
                  </li>
                ))}
              </ul>
              {type === 'warning' && <p>Vill du fortsätta ändå?</p>}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {type === 'error' ? 'Stäng' : 'Avbryt'}
          </Button>
          {type === 'warning' && onConfirm && (
            <Button onClick={() => { onConfirm(); handleClose(); }}>Fortsätt</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
