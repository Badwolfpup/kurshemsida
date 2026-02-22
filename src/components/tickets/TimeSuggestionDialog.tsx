import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAddTicketTimeSuggestion, useTicketTimeSuggestions } from "@/hooks/useTickets";
import { getBookings, type Booking } from "@/api/BookingService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: number;
  adminId: number;
}

const HOURS = [10, 11, 12, 13, 14];
const MINUTES = [0, 30];

function toLocalIso(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function TimeSuggestionDialog({ open, onOpenChange, ticketId, adminId }: Props) {
  const { toast } = useToast();
  const addSuggestion = useAddTicketTimeSuggestion();
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: getBookings,
    staleTime: 2 * 60 * 1000,
  });
  const { data: existingSuggestions = [] } = useTicketTimeSuggestions(ticketId);

  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [duration, setDuration] = useState<30 | 60>(30);

  // Find which 30-min slots are occupied on the selected date for this admin
  const occupiedSlots = useMemo(() => {
    if (!date) return new Set<string>();
    const slots = new Set<string>();

    // Check accepted bookings for this admin on this date
    const dayStart = new Date(date + "T00:00:00");
    const dayEnd = new Date(date + "T23:59:59");

    bookings
      .filter((b) => {
        const bStart = new Date(b.startTime);
        return b.adminId === adminId && bStart >= dayStart && bStart <= dayEnd && b.status === "accepted";
      })
      .forEach((b) => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        // Mark all 30-min slots this booking covers
        for (let t = new Date(bStart); t < bEnd; t.setMinutes(t.getMinutes() + 30)) {
          slots.add(`${t.getHours()}:${t.getMinutes()}`);
        }
      });

    // Also check pending/accepted time suggestions on this date
    existingSuggestions
      .filter((s) => {
        const sStart = new Date(s.startTime);
        return s.status !== "declined" && sStart >= dayStart && sStart <= dayEnd;
      })
      .forEach((s) => {
        const sStart = new Date(s.startTime);
        slots.add(`${sStart.getHours()}:${sStart.getMinutes()}`);
      });

    return slots;
  }, [date, bookings, existingSuggestions, adminId]);

  // For a given start (h:m), check if all required 30-min slots are free
  const isSlotFree = (h: number, m: number, dur: number) => {
    const slotsNeeded = dur / 30;
    for (let i = 0; i < slotsNeeded; i++) {
      const totalMin = h * 60 + m + i * 30;
      const slotH = Math.floor(totalMin / 60);
      const slotM = totalMin % 60;
      if (occupiedSlots.has(`${slotH}:${slotM}`)) return false;
      // Don't go past 14:30 (end of range)
      if (slotH > 14 || (slotH === 14 && slotM > 30)) return false;
    }
    return true;
  };

  const availableHours = HOURS.filter((h) =>
    MINUTES.some((m) => isSlotFree(h, m, duration))
  );

  const availableMinutes = hour
    ? MINUTES.filter((m) => isSlotFree(parseInt(hour), m, duration))
    : MINUTES;

  const submit = () => {
    if (!date || !hour || !minute) return;
    const start = new Date(`${date}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`);
    const end = new Date(start.getTime() + duration * 60 * 1000);

    addSuggestion.mutate(
      { ticketId, startTime: toLocalIso(start), endTime: toLocalIso(end) },
      {
        onSuccess: () => {
          toast({ title: "Tidsförslag skickat" });
          onOpenChange(false);
          setDate("");
          setHour("");
          setMinute("");
          setDuration(30);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Föreslå tid</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Datum</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setHour("");
                setMinute("");
              }}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          {date && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Längd</label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    duration === 30
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
                  onClick={() => { setDuration(30); setMinute(""); }}
                >
                  30 min
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-border ${
                    duration === 60
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
                  onClick={() => { setDuration(60); setMinute(""); }}
                >
                  60 min
                </button>
              </div>
            </div>
          )}
          {date && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Timme</label>
                <Select
                  value={hour}
                  onValueChange={(v) => {
                    setHour(v);
                    setMinute("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj timme" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHours.map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Minut</label>
                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj minut" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMinutes.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {m.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {availableHours.length === 0 && date && (
            <p className="text-sm text-destructive">Inga lediga tider denna dag.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={submit} disabled={!date || !hour || !minute || addSuggestion.isPending}>
            Skicka förslag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
