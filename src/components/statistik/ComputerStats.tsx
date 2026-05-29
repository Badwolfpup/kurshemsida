import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useComputers, useComputerAssignments } from "@/hooks/useComputers";
import { seatOccupancy } from "@/lib/statistics";

const DAYS = [
  { value: 1, label: "Måndag" },
  { value: 2, label: "Tisdag" },
  { value: 3, label: "Onsdag" },
  { value: 4, label: "Torsdag" },
];
const PERIODS = [
  { key: "am", label: "Förmiddag" },
  { key: "pm", label: "Eftermiddag" },
];

function utilClass(pct: number): string {
  if (pct >= 100) return "text-destructive font-semibold";
  if (pct >= 80) return "text-amber-600 font-medium";
  return "text-foreground";
}

export default function ComputerStats() {
  const { data: computers = [], isLoading } = useComputers();
  const { data: assignments = [] } = useComputerAssignments();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const total = computers.length;
  const dedicated = computers.filter((c) => c.ownerStudentId != null).length;
  const shared = total - dedicated;

  if (total === 0) {
    return <Card className="p-8 text-center text-muted-foreground">Inga datorer tillagda ännu.</Card>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm space-y-0.5">
        <p>Total antal datorer: <strong>{total}</strong></p>
        <p>Antal tilldelade datorer: <strong>{dedicated}</strong></p>
        <p>Antal delade datorer: <strong>{shared}</strong></p>
      </div>
      <p className="text-sm text-muted-foreground">
        Tilldelade och lediga delade datorer per pass.
      </p>
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pass</TableHead>
              {DAYS.map((d) => (
                <TableHead key={d.value} className="text-center">{d.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERIODS.map((period) => (
              <TableRow key={period.key}>
                <TableCell className="font-medium">{period.label}</TableCell>
                {DAYS.map((d) => {
                  const sharedAssigned = assignments.filter(
                    (a) => a.dayOfWeek === d.value && a.period === period.key
                  ).length;
                  const occ = seatOccupancy(sharedAssigned, shared);
                  return (
                    <TableCell key={d.value} className="text-center">
                      <span className={utilClass(occ.pct)}>
                        {occ.designated}/{occ.capacity}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {occ.available} {occ.available === 1 ? "ledig" : "lediga"}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
