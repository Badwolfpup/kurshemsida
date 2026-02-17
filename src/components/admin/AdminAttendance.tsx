import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAttendance, useUpdateAttendance } from "@/hooks/useAttendance";
import { useNoClasses, useUpdateNoClasses } from "@/hooks/useNoClass";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";

function getWeekStartDate(offset: number) {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  return new Date(now.getFullYear(), now.getMonth(), diff);
}

function getWeekDates(offset: number) {
  const monday = getWeekStartDate(offset);
  return [0, 1, 2, 3].map((d) => { const date = new Date(monday); date.setDate(monday.getDate() + d); return date; });
}

const dayNames = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"];
function formatDate(d: Date) { return `${d.getDate()}/${d.getMonth() + 1}`; }
// function dateKey(d: Date) { return d.toISOString().split("T")[0]; }
function dateKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

function weekLabel(dates: Date[]) {
  const y = dates[0].getFullYear();
  const oneJan = new Date(y, 0, 1);
  const weekNum = Math.ceil(((dates[0].getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `Vecka ${weekNum}, ${y}`;
}


export default function AdminAttendance() {
  const [weekOffset, setWeekOffset] = useState(0);
  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekStartDate = useMemo(() => getWeekStartDate(weekOffset), [weekOffset]);
  const { toast } = useToast();
  const { data: allUsers = [], isLoading: usersLoading } = useUsers();
  const students = useMemo(() => allUsers.filter((u) => u.isActive && u.authLevel === 4), [allUsers]);
  const { data: attendanceData = [], isLoading: attendanceLoading } = useAttendance(weekStartDate, 2);
  const updateAttendance = useUpdateAttendance();
  const { data: noClasses = [], isLoading: noClassesLoading } = useNoClasses();
  const updateNoClasses = useUpdateNoClasses();

  const hasAttended = (userId: number, date: Date): boolean => {
    const ua = attendanceData.find((a) => a.userId === userId);
    if (!ua) return false;
    const ds = dateKey(date);
    return ua.date.some((d) => dateKey(new Date(d)) === ds);
  };

  const isNoClass = (date: Date): boolean => noClasses.some((x) => x.getTime() === date.getTime());

  const toggleAttendance = async (userId: number, date: Date) => {
    try {
      await updateAttendance.mutateAsync({ userId, date: dateKey(date) });
      toast({ title: "Närvaro uppdaterad" });
    } catch {
      toast({ title: "Fel", description: "Kunde inte uppdatera närvaro.", variant: "destructive" });
    }
  };

  const hasAbsenceAlert = (userId: number): boolean => {
    const ua = attendanceData.find((a) => a.userId === userId);
    if (!ua || !ua.date.length) return true;
    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    return ua.date.filter((d) => { const ad = new Date(d); return ad >= twoWeeksAgo && ad <= today; }).length === 0;
  };

  const alertStudents = students.filter((s) => hasAbsenceAlert(s.id));

  if (usersLoading || attendanceLoading) return <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-4">
      {alertStudents.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive text-sm">Frånvarovarning</p>
            <p className="text-sm text-destructive/80">
              {alertStudents.map((s) => `${s.firstName} ${s.lastName}`).join(", ")} har inte varit närvarande de senaste 2 veckorna.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-display font-semibold text-foreground min-w-[160px] text-center">{weekLabel(dates)}</span>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o + 1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {students.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center"><p className="text-muted-foreground">Inga aktiva deltagare hittades.</p></div>
      ) : (
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Deltagare</TableHead>
                {dates.map((d, i) => (
                  <TableHead key={i} className="text-center">
                    <Checkbox destructive={isNoClass(d)} checked={isNoClass(d)} onCheckedChange={() => updateNoClasses.mutate(dateKey(d))} />
                    <div className="text-xs text-muted-foreground">{dayNames[i]}</div>
                    <div className="text-sm font-semibold">{formatDate(d)}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className={hasAbsenceAlert(student.id) ? "bg-destructive/5" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{student.firstName} {student.lastName}</span>
                      {hasAbsenceAlert(student.id) && <AlertTriangle className="h-3 w-3 text-destructive" />}
                    </div>
                  </TableCell>
                  {dates.map((d) => (
                    <TableCell key={dateKey(d)} className="px-2 cursor-pointer" onClick={() => toggleAttendance(student.id, d)}>
                      <div className="flex justify-center pointer-events-none"><Checkbox destructive={isNoClass(d)} checked={isNoClass(d) || hasAttended(student.id, d)} tabIndex={-1} /></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
