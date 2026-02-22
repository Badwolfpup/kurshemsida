import { useState } from "react";
import { Ticket, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTickets, useAddTicket, useMarkTicketViewed } from "@/hooks/useTickets";
import { useUsers } from "@/hooks/useUsers";
import TicketReplyThread from "@/components/tickets/TicketReplyThread";

const CoachTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: allTickets = [], isLoading } = useTickets();
  const { data: users = [] } = useUsers();
  const addTicket = useAddTicket();
  const markViewed = useMarkTicketViewed();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: "", message: "", type: "question", recipientId: "" });

  // Filter to only show tickets from this user
  const myTickets = allTickets.filter((t) => t.senderId === user?.id);

  // Get admin/teacher users for recipient selection
  const admins = users.filter((u) => u.authLevel <= 2 && u.isActive);

  const createTicket = () => {
    if (!form.subject || !form.message) return;
    addTicket.mutate(
      { subject: form.subject, message: form.message, type: form.type, recipientId: form.recipientId ? parseInt(form.recipientId) : undefined },
      {
        onSuccess: () => {
          toast({ title: "Ärende skapat", description: "Ditt ärende har skickats." });
          setDialogOpen(false);
          setForm({ subject: "", message: "", type: "question", recipientId: "" });
        },
      }
    );
  };

  const statusLabel = (s: string) => {
    const labels: Record<string, string> = { Open: "Öppen", InProgress: "Pågående", Closed: "Stängd" };
    return labels[s] || s;
  };

  const typeLabel = (t: string) => {
    const labels: Record<string, string> = { question: "Förfrågan", idea: "Idé", bug: "Bugg", other: "Övrigt" };
    return labels[t] || t;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Ticket className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Ärenden</h1>
        <Button onClick={() => setDialogOpen(true)} className="ml-auto gap-2">
          <Plus className="h-4 w-4" /> Nytt ärende
        </Button>
      </div>

      {myTickets.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <p className="text-muted-foreground">Du har inga ärenden ännu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myTickets.map((t) => (
            <div key={t.id} className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-3">
              <div
                className="flex items-start justify-between gap-4 cursor-pointer"
                onClick={() => {
                  setExpandedTicket((prev) => {
                    const next = prev === t.id ? null : t.id;
                    if (next !== null) markViewed.mutate(t.id);
                    return next;
                  });
                }}
              >
                <div>
                  <h3 className="font-display font-semibold text-foreground">{t.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString("sv-SE")} · {typeLabel(t.type)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {t.hasUnread && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">!</span>
                  )}
                  <Badge variant={t.status === "Open" ? "destructive" : t.status === "InProgress" ? "default" : "secondary"}>
                    {statusLabel(t.status)}
                  </Badge>
                  {expandedTicket === t.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {expandedTicket !== t.id && (
                <p className="text-foreground whitespace-pre-wrap line-clamp-2">{t.message}</p>
              )}
              {expandedTicket === t.id && (
                <>
                  <p className="text-foreground whitespace-pre-wrap">{t.message}</p>
                  <TicketReplyThread ticketId={t.id} ticketStatus={t.status} />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Skapa nytt ärende</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Ämne" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="question">Förfrågan</SelectItem>
                <SelectItem value="idea">Idé</SelectItem>
                <SelectItem value="bug">Bugg</SelectItem>
                <SelectItem value="other">Övrigt</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.recipientId} onValueChange={(v) => setForm({ ...form, recipientId: v })}>
              <SelectTrigger><SelectValue placeholder="Välj mottagare (admin)" /></SelectTrigger>
              <SelectContent>
                {admins.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>{a.firstName} {a.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea placeholder="Meddelande" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Avbryt</Button>
            <Button onClick={createTicket}>Skicka</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachTickets;
