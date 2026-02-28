import { useState } from 'react';
import {
  Ticket,
  Plus,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle,
  Clock,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import {
  useTickets,
  useAddTicket,
  useUpdateTicket,
  useMarkTicketViewed,
} from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import TicketReplyThread from '@/components/tickets/TicketReplyThread';
import TimeSuggestionDisplay from '@/components/tickets/TimeSuggestionDisplay';
import TimeSuggestionDialog from '@/components/tickets/TimeSuggestionDialog';

interface TicketTypeOption {
  value: string;
  label: string;
}

interface TicketPageConfig {
  pageTitle: string;
  filterToOwnTickets: boolean;
  canCreate: boolean;
  ticketTypes: TicketTypeOption[];
  recipientMode: 'conditional' | 'always' | 'none';
  recipientFilter: (u: { authLevel: number; isActive: boolean; firstName: string }) => boolean;
  timeSuggestions: 'respond' | 'initiate' | 'none';
  canManageStatus: boolean;
  showSenderName: boolean;
  showCountBadges: boolean;
}

function getConfig(isAdmin: boolean, isCoach: boolean): TicketPageConfig {
  if (isAdmin) {
    return {
      pageTitle: 'Inkomna ärenden',
      filterToOwnTickets: false,
      canCreate: false,
      ticketTypes: [],
      recipientMode: 'none',
      recipientFilter: () => false,
      timeSuggestions: 'initiate',
      canManageStatus: true,
      showSenderName: true,
      showCountBadges: true,
    };
  }
  if (isCoach) {
    return {
      pageTitle: 'Ärenden',
      filterToOwnTickets: true,
      canCreate: true,
      ticketTypes: [
        { value: 'question', label: 'Förfrågan' },
        { value: 'idea', label: 'Idé' },
        { value: 'bug', label: 'Bugg' },
        { value: 'other', label: 'Övrigt' },
      ],
      recipientMode: 'always',
      recipientFilter: (u) => u.authLevel <= 2 && u.isActive && u.firstName !== 'Alexandra',
      timeSuggestions: 'none',
      canManageStatus: false,
      showSenderName: false,
      showCountBadges: false,
    };
  }
  // Student
  return {
    pageTitle: 'Ärenden',
    filterToOwnTickets: true,
    canCreate: true,
    ticketTypes: [
      { value: 'session', label: 'Handledning' },
      { value: 'question', label: 'Förfrågan' },
      { value: 'bug', label: 'Bugg' },
      { value: 'other', label: 'Övrigt' },
    ],
    recipientMode: 'conditional',
    recipientFilter: (u) => u.authLevel <= 2 && u.isActive,
    timeSuggestions: 'respond',
    canManageStatus: false,
    showSenderName: false,
    showCountBadges: false,
  };
}

const allTypeLabels: Record<string, string> = {
  session: 'Handledning',
  question: 'Förfrågan',
  idea: 'Idé',
  bug: 'Bugg',
  other: 'Övrigt',
};

const statusLabels: Record<string, string> = {
  Open: 'Öppen',
  InProgress: 'Pågående',
  Closed: 'Stängd',
};

const statusVariant = (status: string): 'yellow' | 'default' | 'secondary' => {
  if (status === 'Open') return 'yellow';
  if (status === 'InProgress') return 'default';
  return 'secondary';
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

const canSuggestTime = (type: string) => type === 'session' || type === 'question';

export default function TicketsPage() {
  const { user } = useAuth();
  const { isAdmin, isCoach } = useUserRole();
  const { toast } = useToast();
  const { data: allTickets = [], isLoading } = useTickets();
  const { data: users = [] } = useUsers();
  const addTicket = useAddTicket();
  const updateTicket = useUpdateTicket();
  const markViewed = useMarkTicketViewed();

  const config = getConfig(isAdmin, isCoach);

  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    message: '',
    type: config.ticketTypes[0]?.value ?? 'question',
    recipientId: '',
  });
  const [suggestionDialog, setSuggestionDialog] = useState<{
    open: boolean;
    ticketId: number;
  }>({ open: false, ticketId: 0 });

  const tickets = config.filterToOwnTickets
    ? allTickets.filter((t) => t.senderId === user?.id)
    : allTickets;

  const admins = users.filter(config.recipientFilter);

  const toggle = (id: number) => {
    setExpandedTicket((prev) => {
      const next = prev === id ? null : id;
      if (next !== null) markViewed.mutate(id);
      return next;
    });
  };

  const showRecipientField =
    config.recipientMode === 'always' ||
    (config.recipientMode === 'conditional' &&
      form.type !== 'other' &&
      form.type !== 'bug');

  const createTicket = () => {
    if (!form.subject || !form.message) return;
    addTicket.mutate(
      {
        subject: form.subject,
        message: form.message,
        type: form.type,
        recipientId: form.recipientId ? parseInt(form.recipientId) : undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Ärende skapat', description: 'Ditt ärende har skickats.' });
          setDialogOpen(false);
          setForm({
            subject: '',
            message: '',
            type: config.ticketTypes[0]?.value ?? 'question',
            recipientId: '',
          });
        },
      }
    );
  };

  const updateStatus = (id: number, status: string) => {
    updateTicket.mutate({ id, status }, {
      onSuccess: () => toast({ title: 'Status uppdaterad' }),
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
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {!config.showCountBadges && (
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <Ticket className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        <h1 className="font-display text-2xl font-bold text-foreground">
          {config.pageTitle}
        </h1>
        {config.canCreate && (
          <Button onClick={() => setDialogOpen(true)} className="ml-auto gap-2">
            <Plus className="h-4 w-4" /> Nytt ärende
          </Button>
        )}
      </div>

      {config.showCountBadges && (
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary">
            {tickets.filter((t) => t.status === 'Open').length} öppna ärenden
          </Badge>
          <Badge variant="outline">{tickets.length} totalt</Badge>
        </div>
      )}

      {/* Empty state */}
      {tickets.length === 0 && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          {config.showCountBadges && (
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          )}
          <p className="text-muted-foreground">
            {config.filterToOwnTickets ? 'Du har inga ärenden ännu.' : 'Inga ärenden ännu.'}
          </p>
        </div>
      )}

      {/* Ticket list */}
      <div className="space-y-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="bg-card rounded-2xl shadow-card border border-border p-4 sm:p-6 space-y-3"
          >
            {/* Card header */}
            <div
              className="flex items-start justify-between gap-3 cursor-pointer"
              onClick={() => toggle(t.id)}
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-semibold text-foreground break-words">
                  {t.subject}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {config.showSenderName && `Från: ${t.senderName} · `}
                  {new Date(t.createdAt).toLocaleDateString('sv-SE')} ·{' '}
                  {allTypeLabels[t.type] || t.type}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {t.hasUnread && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                    !
                  </span>
                )}
                <Badge variant={statusVariant(t.status)}>
                  {statusLabels[t.status] || t.status}
                </Badge>
                {expandedTicket === t.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Accepted time or message preview */}
            {t.acceptedStartTime ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-foreground">
                  Tidsförslag: {formatTime(t.acceptedStartTime)}–
                  {t.acceptedEndTime ? formatTime(t.acceptedEndTime) : ''}
                </span>
                <Badge variant="green" className="text-xs">Godkänd</Badge>
              </div>
            ) : (
              expandedTicket !== t.id && (
                <p className="text-foreground whitespace-pre-wrap line-clamp-2">
                  {t.message}
                </p>
              )
            )}

            {/* Admin status management buttons */}
            {config.canManageStatus && t.status !== 'Closed' && (
              <div className="flex flex-wrap gap-2 pt-2">
                {t.status === 'Open' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, 'InProgress')}>
                    <Clock className="h-3 w-3 mr-1" /> Pågående
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, 'Closed')}>
                  <CheckCircle className="h-3 w-3 mr-1" /> Stäng
                </Button>
                {config.timeSuggestions === 'initiate' && canSuggestTime(t.type) && !t.hasPendingSuggestion && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSuggestionDialog({ open: true, ticketId: t.id })}
                  >
                    <CalendarClock className="h-3 w-3 mr-1" /> Föreslå tid
                  </Button>
                )}
              </div>
            )}

            {/* Expanded view */}
            {expandedTicket === t.id && (
              <>
                <p className="text-foreground whitespace-pre-wrap">{t.message}</p>
                {config.timeSuggestions === 'initiate' && canSuggestTime(t.type) && (
                  <TimeSuggestionDisplay ticketId={t.id} isRecipient={false} />
                )}
                {config.timeSuggestions === 'respond' && (t.type === 'session' || t.type === 'question') && (
                  <TimeSuggestionDisplay ticketId={t.id} isRecipient={true} />
                )}
                <TicketReplyThread ticketId={t.id} ticketStatus={t.status} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Create ticket dialog */}
      {config.canCreate && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Skapa nytt ärende</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Ämne"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    type: v,
                    recipientId:
                      config.recipientMode === 'conditional' && (v === 'other' || v === 'bug')
                        ? ''
                        : form.recipientId,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.ticketTypes.map((tt) => (
                    <SelectItem key={tt.value} value={tt.value}>
                      {tt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showRecipientField && (
                <Select
                  value={form.recipientId}
                  onValueChange={(v) => setForm({ ...form, recipientId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj mottagare" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.firstName} {a.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Textarea
                placeholder="Meddelande"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={createTicket}>Skicka</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Admin time suggestion dialog */}
      {config.timeSuggestions === 'initiate' && suggestionDialog.open && user?.id && (
        <TimeSuggestionDialog
          open={suggestionDialog.open}
          onOpenChange={(open) => setSuggestionDialog({ ...suggestionDialog, open })}
          ticketId={suggestionDialog.ticketId}
          adminId={user.id}
        />
      )}
    </div>
  );
}
