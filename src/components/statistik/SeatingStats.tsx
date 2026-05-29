import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUsers } from "@/hooks/useUsers";
import { useSeatingAssignments } from "@/hooks/useSeating";
import { SPAR1_LAYOUT, SPAR2_LAYOUT } from "@/pages/Klassrum";
import { seatOccupancy, countFullyBookedTables } from "@/lib/statistics";
import { isReducedAttendance } from "@/lib/participantStatus";
import type { SeatingAssignment } from "@/api/SeatingService";

// A table counts as "fullbokat" when it's assigned in at least this many of its
// 8 weekly slots (4 days × förmiddag/eftermiddag).
const FULLY_BOOKED_MIN_SLOTS = 6;

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

function ClassroomTable({
  label,
  capacity,
  dayAssignments,
  eligibleIds,
}: {
  label: string;
  capacity: number;
  dayAssignments: SeatingAssignment[][]; // index 0..3 = Mon..Thu
  eligibleIds: Set<number>;
}) {
  const fullyBooked = countFullyBookedTables(
    dayAssignments.flat().filter((a) => eligibleIds.has(a.studentId)),
    FULLY_BOOKED_MIN_SLOTS
  );
  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-2">
        {label} ({capacity} bord)
        <span className="text-muted-foreground font-normal"> · {fullyBooked} fullbokade</span>
      </h3>
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
                {DAYS.map((d, i) => {
                  const designated = (dayAssignments[i] ?? []).filter(
                    (a) => a.period === period.key && eligibleIds.has(a.studentId)
                  ).length;
                  const occ = seatOccupancy(designated, capacity);
                  return (
                    <TableCell key={d.value} className="text-center">
                      <span className={utilClass(occ.pct)}>
                        {occ.designated}/{occ.capacity}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {occ.available} {occ.available === 1 ? "ledigt" : "lediga"}
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

export default function SeatingStats() {
  const { data: users = [], isLoading } = useUsers();

  const eligibleIds = useMemo(
    () =>
      new Set(
        users
          .filter((u) => u.authLevel === 4 && u.isActive && !isReducedAttendance(u.status))
          .map((u) => u.id)
      ),
    [users]
  );

  // Seating assignments are weekday templates (classroom × day × period). 8 fixed queries.
  const s1d1 = useSeatingAssignments(1, 1);
  const s1d2 = useSeatingAssignments(1, 2);
  const s1d3 = useSeatingAssignments(1, 3);
  const s1d4 = useSeatingAssignments(1, 4);
  const s2d1 = useSeatingAssignments(2, 1);
  const s2d2 = useSeatingAssignments(2, 2);
  const s2d3 = useSeatingAssignments(2, 3);
  const s2d4 = useSeatingAssignments(2, 4);

  const spar1 = [s1d1.data ?? [], s1d2.data ?? [], s1d3.data ?? [], s1d4.data ?? []];
  const spar2 = [s2d1.data ?? [], s2d2.data ?? [], s2d3.data ?? [], s2d4.data ?? []];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Antal bord som är tilldelade en deltagare och antal lediga bord per pass. Pausade och
        distansdeltagare räknas inte som efterfrågan. Ett bord räknas som <em>fullbokat</em> när
        det är tilldelat minst {FULLY_BOOKED_MIN_SLOTS} av 8 pass i veckan.
      </p>
      <ClassroomTable label="Spår 1" capacity={SPAR1_LAYOUT.length} dayAssignments={spar1} eligibleIds={eligibleIds} />
      <ClassroomTable label="Spår 2" capacity={SPAR2_LAYOUT.length} dayAssignments={spar2} eligibleIds={eligibleIds} />
    </div>
  );
}
