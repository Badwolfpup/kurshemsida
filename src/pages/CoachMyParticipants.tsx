import { ArrowLeft, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import HelpDialog from "@/components/HelpDialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo } from "react";
import CoachAttendance from "@/components/admin/CoachAttendance";
import { Button } from "@/components/ui/button";
import { useAttendance } from "@/hooks/useAttendance";
import type UserType from "@/Types/User";
import { isReducedAttendance, statusTagLabel } from "@/lib/participantStatus";


const ABSENCE_WEEKS = 4;
const ABSENCE_DAYS = ABSENCE_WEEKS * 7;

function ParticipantRow({ p, onSelect }: { p: UserType; onSelect: (id: number) => void }) {
  return (
    <TableRow key={p.id} onClick={() => onSelect(p.id)} className="cursor-pointer hover:bg-accent/50">
      <TableCell className="font-medium">
        {p.firstName[0]}.{p.lastName[0]}
        {statusTagLabel(p.status) && (
          <Badge variant="outline" className="ml-2 text-xs">{statusTagLabel(p.status)}</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

const CoachMyParticipants = () => {
  const { user } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const [showAttendance, setShowAttendance] = useState<boolean>(false);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);

  const participants = users.filter(
    (u) => u.authLevel === 4 && u.isActive && u.coachId === user?.id
  );

  const today = useMemo(() => new Date(), []);
  const { data: attendanceData = [] } = useAttendance(today, ABSENCE_WEEKS);

  const fourWeeksAgoMs = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - ABSENCE_DAYS);
    return d.getTime();
  }, []);

  const attendedIds = useMemo(() => {
    const ids = new Set<number>();
    for (const record of attendanceData) {
      if (record.date.some((d) => new Date(d).getTime() >= fourWeeksAgoMs)) {
        ids.add(record.userId);
      }
    }
    return ids;
  }, [attendanceData, fourWeeksAgoMs]);

  const reducedParticipants = participants.filter((p) => isReducedAttendance(p.status));
  const normalParticipants = participants.filter((p) => !isReducedAttendance(p.status));
  const activeParticipants = normalParticipants.filter((p) => attendedIds.has(p.id));
  const absentParticipants = normalParticipants.filter((p) => !attendedIds.has(p.id));



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (showAttendance && selectedParticipant !== null) {
    const participant = participants.find((p) => p.id === selectedParticipant);
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => { setShowAttendance(false); setSelectedParticipant(null); }} className="gap-2 text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Tillbaka
        </Button>
        <CoachAttendance seluser={participant} />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mina deltagare</h1>
        <Badge variant="secondary">{participants.length} deltagare</Badge>
        <HelpDialog helpKey="mina-deltagare" />
      </div>

      {participants.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <p className="text-center text-muted-foreground py-8">Inga deltagare tilldelade ännu.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeParticipants.map((p) => (
                  <ParticipantRow key={p.id} p={p} onSelect={(id) => { setSelectedParticipant(id); setShowAttendance(true); }} />
                ))}
                {activeParticipants.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center text-muted-foreground py-4">Inga aktiva deltagare.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {absentParticipants.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-muted-foreground mb-3">
                Ej närvarande senaste {ABSENCE_WEEKS} veckorna ({absentParticipants.length})
              </h2>
              <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden opacity-60">
                <Table>
                  <TableBody>
                    {absentParticipants.map((p) => (
                      <ParticipantRow key={p.id} p={p} onSelect={(id) => { setSelectedParticipant(id); setShowAttendance(true); }} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {reducedParticipants.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-muted-foreground mb-3">
                Distans &amp; paus ({reducedParticipants.length})
              </h2>
              <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                <Table>
                  <TableBody>
                    {reducedParticipants.map((p) => (
                      <ParticipantRow key={p.id} p={p} onSelect={(id) => { setSelectedParticipant(id); setShowAttendance(true); }} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachMyParticipants;
