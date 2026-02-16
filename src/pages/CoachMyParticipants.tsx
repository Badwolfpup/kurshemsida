import { Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CoachMyParticipants = () => {
  const { user } = useAuth();
  const { data: allUsers = [], isLoading } = useUsers();

  const participants = allUsers.filter(
    (u) => u.authLevel === 4 && u.isActive && u.coachId === user?.id
  );

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
              <TableHead>Telefon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Startdatum</TableHead>
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
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.firstName} {p.lastName}</TableCell>
                <TableCell>{p.telephone || "—"}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.startDate ? new Date(p.startDate).toLocaleDateString("sv-SE") : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CoachMyParticipants;
