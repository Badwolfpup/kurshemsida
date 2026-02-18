import { ArrowLeft, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleUserRound, CalendarDays, Laptop } from "lucide-react";
import { useState } from "react";
import CoachAttendance from "@/components/admin/CoachAttendance";
import { Button } from "@/components/ui/button";


const CoachMyParticipants = () => {
  const { user } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const [showAttendance, setShowAttendance] = useState<boolean>(false);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);

  const participants = users.filter(
    (u) => u.authLevel === 4 && u.isActive && u.coachId === user?.id
  );



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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mina deltagare</h1>
        <Badge variant="secondary">{participants.length} deltagare</Badge>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              {/* <TableHead >Kontaktinfo</TableHead>
              <TableHead>Progression</TableHead>
              <TableHead>Närvaro</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Inga deltagare tilldelade ännu.
                </TableCell>
              </TableRow>
            )}
            {participants.map((p) => (
              <TableRow key={p.id} onClick={() => { setSelectedParticipant(p.id); setShowAttendance(true); }} className="cursor-pointer hover:bg-accent/50" >
                <TableCell className="font-medium">{p.firstName[0]}.{p.lastName[0]}</TableCell>
                {/* <TableCell><CircleUserRound className="inline h-8 w-8 ml-4" onClick={() => { setSelectedParticipant(p.id); setShowAttendance(true); }}/></TableCell>
                <TableCell><Laptop className="inline h-8 w-8 ml-4" /></TableCell>
                <TableCell><CalendarDays className="inline h-8 w-8 ml-4" /></TableCell> */}

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CoachMyParticipants;
