import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTickets, useUpdateTicket, useAddTicketReply } from "@/hooks/useTickets";
import { MessageSquare, CheckCircle, Clock, Trash2 } from "lucide-react";
import type { TicketType } from "@/Types/TicketType";

export default function AdminTickets() {
  const { data: tickets = [], isLoading } = useTickets();
  const updateTicket = useUpdateTicket();
  const addReply = useAddTicketReply();
  const { toast } = useToast();
  const [replyText, setReplyText] = useState<Record<number, string>>({});

  const updateStatus = (id: number, status: string) => {
    updateTicket.mutate({ id, status }, {
      onSuccess: () => toast({ title: "Status uppdaterad" }),
    });
  };

  const sendReply = (ticketId: number) => {
    const text = replyText[ticketId];
    if (!text?.trim()) return;
    addReply.mutate({ ticketId, message: text }, {
      onSuccess: () => {
        setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
        toast({ title: "Svar skickat" });
      },
    });
  };

  const typeLabel = (type: string) => {
    const labels: Record<string, string> = { question: "Förfrågan", idea: "Idé", bug: "Bugg", other: "Övrigt" };
    return labels[type] || type;
  };

  const statusColor = (status: string): "destructive" | "default" | "secondary" => {
    if (status === "Open") return "destructive";
    if (status === "InProgress") return "default";
    return "secondary";
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = { Open: "Öppen", InProgress: "Pågående", Closed: "Stängd" };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant="secondary">{tickets.filter((t) => t.status === "Open").length} öppna ärenden</Badge>
        <Badge variant="outline">{tickets.length} totalt</Badge>
      </div>

      {tickets.length === 0 && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Inga ärenden ännu.</p>
        </div>
      )}

      {tickets.map((t) => (
        <div key={t.id} className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">{t.subject}</h3>
              <p className="text-sm text-muted-foreground">
                Från: {t.senderName} · {new Date(t.createdAt).toLocaleDateString("sv-SE")} · {typeLabel(t.type)}
              </p>
            </div>
            <Badge variant={statusColor(t.status)}>{statusLabel(t.status)}</Badge>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{t.message}</p>
          <div className="flex gap-2 pt-2">
            {t.status !== "Closed" && (
              <>
                {t.status === "Open" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "InProgress")}>
                    <Clock className="h-3 w-3 mr-1" /> Pågående
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "Closed")}>
                  <CheckCircle className="h-3 w-3 mr-1" /> Stäng
                </Button>
              </>
            )}
          </div>
          {t.status !== "Closed" && (
            <div className="flex gap-2 pt-2">
              <Textarea
                placeholder="Skriv ett svar..."
                value={replyText[t.id] || ""}
                onChange={(e) => setReplyText((prev) => ({ ...prev, [t.id]: e.target.value }))}
                rows={2}
                className="flex-1"
              />
              <Button onClick={() => sendReply(t.id)} className="self-end">Svara</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
