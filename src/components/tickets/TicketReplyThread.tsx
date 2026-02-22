import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTicketReplies, useAddTicketReply } from "@/hooks/useTickets";
import { useToast } from "@/hooks/use-toast";

interface Props {
  ticketId: number;
  ticketStatus: string;
}

export default function TicketReplyThread({ ticketId, ticketStatus }: Props) {
  const { data: replies = [] } = useTicketReplies(ticketId);
  const addReply = useAddTicketReply();
  const { toast } = useToast();
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    addReply.mutate(
      { ticketId, message: text },
      {
        onSuccess: () => {
          setText("");
          toast({ title: "Svar skickat" });
        },
      }
    );
  };

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((r) => (
            <div key={r.id} className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{r.senderName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("sv-SE")}{" "}
                  {new Date(r.createdAt).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{r.message}</p>
            </div>
          ))}
        </div>
      )}
      {ticketStatus !== "Closed" && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Skriv ett svar..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="flex-1"
          />
          <Button onClick={send} className="self-end" disabled={addReply.isPending}>
            Svara
          </Button>
        </div>
      )}
    </div>
  );
}
