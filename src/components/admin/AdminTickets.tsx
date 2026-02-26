import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  useTickets,
  useUpdateTicket,
  useMarkTicketViewed,
} from '@/hooks/useTickets';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  CheckCircle,
  Clock,
  CalendarClock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import TicketReplyThread from '@/components/tickets/TicketReplyThread';
import TimeSuggestionDialog from '@/components/tickets/TimeSuggestionDialog';
import TimeSuggestionDisplay from '@/components/tickets/TimeSuggestionDisplay';

export default function AdminTickets() {
  const { user } = useAuth();
  const { data: tickets = [], isLoading } = useTickets();
  const updateTicket = useUpdateTicket();
  const markViewed = useMarkTicketViewed();
  const { toast } = useToast();
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [suggestionDialog, setSuggestionDialog] = useState<{
    open: boolean;
    ticketId: number;
  }>({ open: false, ticketId: 0 });

  const updateStatus = (id: number, status: string) => {
    updateTicket.mutate(
      { id, status },
      {
        onSuccess: () => toast({ title: 'Status uppdaterad' }),
      }
    );
  };

  const typeLabel = (type: string) => {
    const labels: Record<string, string> = {
      session: 'Handledning',
      question: 'Förfrågan',
      idea: 'Idé',
      bug: 'Bugg',
      other: 'Övrigt',
    };
    return labels[type] || type;
  };

  const statusColor = (
    status: string
  ): 'destructive' | 'default' | 'secondary' | 'yellow' | 'green' => {
    if (status === 'Open') return 'yellow';
    if (status === 'InProgress') return 'default';
    return 'secondary';
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Open: 'Öppen',
      InProgress: 'Pågående',
      Closed: 'Stängd',
    };
    return labels[status] || status;
  };

  const canSuggestTime = (type: string) =>
    type === 'session' || type === 'question';

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const toggle = (id: number) => {
    setExpandedTicket((prev) => {
      const next = prev === id ? null : id;
      if (next !== null) markViewed.mutate(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-4">
      <span className="text-2xl font-display font-semibold text-foreground">
        Inkomna ärenden
      </span>
      <div className="flex items-center gap-3">
        <Badge variant="secondary">
          {tickets.filter((t) => t.status === 'Open').length} öppna ärenden
        </Badge>
        <Badge variant="outline">{tickets.length} totalt</Badge>
      </div>

      {tickets.length === 0 && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Inga ärenden ännu.</p>
        </div>
      )}

      {tickets.map((t) => (
        <div
          key={t.id}
          className="bg-card rounded-2xl shadow-card border border-border p-8 space-y-3"
        >
          <div
            className="flex items-start justify-between gap-4 cursor-pointer"
            onClick={() => toggle(t.id)}
          >
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {t.subject}
              </h3>
              <p className="text-sm text-muted-foreground">
                Från: {t.senderName} ·{' '}
                {new Date(t.createdAt).toLocaleDateString('sv-SE')} ·{' '}
                {typeLabel(t.type)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {t.hasUnread && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  !
                </span>
              )}
              <Badge variant={statusColor(t.status)}>
                {statusLabel(t.status)}
              </Badge>
              {expandedTicket === t.id ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {t.acceptedStartTime ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">
                Tidsförslag: {formatTime(t.acceptedStartTime)}–
                {t.acceptedEndTime ? formatTime(t.acceptedEndTime) : ''}
              </span>
              <Badge variant="green" className="text-xs">
                Godkänd
              </Badge>
            </div>
          ) : (
            expandedTicket !== t.id && (
              <p className="text-foreground whitespace-pre-wrap line-clamp-2">
                {t.message}
              </p>
            )
          )}

          <div className="flex gap-2 pt-2">
            {t.status !== 'Closed' && (
              <>
                {t.status === 'Open' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(t.id, 'InProgress')}
                  >
                    <Clock className="h-3 w-3 mr-1" /> Pågående
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(t.id, 'Closed')}
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> Stäng
                </Button>
                {canSuggestTime(t.type) && !t.hasPendingSuggestion && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSuggestionDialog({ open: true, ticketId: t.id })
                    }
                  >
                    <CalendarClock className="h-3 w-3 mr-1" /> Föreslå tid
                  </Button>
                )}
              </>
            )}
          </div>

          {expandedTicket === t.id && (
            <>
              <p className="text-foreground whitespace-pre-wrap">{t.message}</p>
              {canSuggestTime(t.type) && (
                <TimeSuggestionDisplay ticketId={t.id} isRecipient={false} />
              )}
              <TicketReplyThread ticketId={t.id} ticketStatus={t.status} />
            </>
          )}
        </div>
      ))}

      {suggestionDialog.open && user?.id && (
        <TimeSuggestionDialog
          open={suggestionDialog.open}
          onOpenChange={(open) =>
            setSuggestionDialog({ ...suggestionDialog, open })
          }
          ticketId={suggestionDialog.ticketId}
          adminId={user.id}
        />
      )}
    </div>
  );
}
