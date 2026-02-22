import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTicketTimeSuggestions, useRespondToTimeSuggestion } from "@/hooks/useTickets";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock } from "lucide-react";

interface Props {
  ticketId: number;
  isRecipient: boolean;
}

export default function TimeSuggestionDisplay({ ticketId, isRecipient }: Props) {
  const { data: suggestions = [] } = useTicketTimeSuggestions(ticketId);
  const respond = useRespondToTimeSuggestion();
  const { toast } = useToast();
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  if (suggestions.length === 0) return null;

  const pending = suggestions.find((s) => s.status === "pending");

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("sv-SE") + " " + d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  };

  const accept = (id: number) => {
    respond.mutate(
      { id, ticketId, dto: { accept: true } },
      { onSuccess: () => toast({ title: "Tid godkänd", description: "Ärendet har stängts." }) }
    );
  };

  const decline = (id: number) => {
    if (!declineReason.trim()) return;
    respond.mutate(
      { id, ticketId, dto: { accept: false, declineReason } },
      {
        onSuccess: () => {
          toast({ title: "Tid avböjd" });
          setDeclining(false);
          setDeclineReason("");
        },
      }
    );
  };

  return (
    <div className="space-y-2 pt-3 border-t border-border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tidsförslag</p>

      {pending && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {formatTime(pending.startTime)} – {new Date(pending.endTime).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <Badge variant="default" className="text-xs">Väntar på svar</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Föreslagen av {pending.suggestedByName}</p>

          {isRecipient && !declining && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => accept(pending.id)} disabled={respond.isPending}>
                <Check className="h-3 w-3 mr-1" /> Godkänn
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDeclining(true)}>
                <X className="h-3 w-3 mr-1" /> Jag kan inte den tiden
              </Button>
            </div>
          )}

          {isRecipient && declining && (
            <div className="space-y-2 pt-1">
              <Textarea
                placeholder="Skriv varför du inte kan den tiden..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decline(pending.id)} disabled={!declineReason.trim() || respond.isPending}>
                  Skicka
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setDeclining(false); setDeclineReason(""); }}>
                  Avbryt
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {suggestions
        .filter((s) => s.status !== "pending")
        .map((s) => (
          <div key={s.id} className="bg-muted/30 rounded-lg p-3 opacity-70">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">
                {formatTime(s.startTime)} – {new Date(s.endTime).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <Badge variant={s.status === "accepted" ? "default" : "secondary"} className="text-xs">
                {s.status === "accepted" ? "Godkänd" : "Avböjd"}
              </Badge>
            </div>
            {s.declineReason && (
              <p className="text-xs text-muted-foreground mt-1">Anledning: {s.declineReason}</p>
            )}
          </div>
        ))}
    </div>
  );
}
