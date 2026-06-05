import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUsers } from "@/hooks/useUsers";
import { useAttendance } from "@/hooks/useAttendance";
import { useNoClasses } from "@/hooks/useNoClass";
import { summarize, isClassDay, dateKey, type StatSummary } from "@/lib/statistics";
import { isReducedAttendance } from "@/lib/participantStatus";

const WEEKDAY_LABELS: Record<number, string> = { 1: "Måndag", 2: "Tisdag", 3: "Onsdag", 4: "Torsdag" };
const DAY = 86_400_000;

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

function scheduledOnWeekday(u: { scheduledMonAm: boolean; scheduledMonPm: boolean; scheduledTueAm: boolean; scheduledTuePm: boolean; scheduledWedAm: boolean; scheduledWedPm: boolean; scheduledThuAm: boolean; scheduledThuPm: boolean }, weekday: number): boolean {
  switch (weekday) {
    case 1: return u.scheduledMonAm || u.scheduledMonPm;
    case 2: return u.scheduledTueAm || u.scheduledTuePm;
    case 3: return u.scheduledWedAm || u.scheduledWedPm;
    case 4: return u.scheduledThuAm || u.scheduledThuPm;
    default: return false;
  }
}

function mondayKey(d: Date): string {
  const diff = (7 + (d.getDay() - 1)) % 7; // days since Monday
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
  return dateKey(monday);
}

export default function AttendanceStats() {
  const todayKey = dateKey(new Date());
  const fourWeeksAgoKey = dateKey(new Date(Date.now() - 28 * DAY));
  const [startStr, setStartStr] = useState(fourWeeksAgoKey);
  const [endStr, setEndStr] = useState(todayKey);

  const start = parseLocal(startStr);
  // End defaults to today when left blank; never count future class days.
  const endInput = endStr ? parseLocal(endStr) : new Date();
  const today = new Date();
  const effectiveEnd = endInput.getTime() > today.getTime() ? today : endInput;

  const weeksBetween = Math.max(1, Math.ceil((effectiveEnd.getTime() - start.getTime()) / (7 * DAY)));
  const count = weeksBetween + 2;

  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: attendance = [], isLoading: attLoading } = useAttendance(effectiveEnd, count);
  const { data: noClasses = [] } = useNoClasses();

  const stats = useMemo(() => {
    const students = users.filter((u) => u.authLevel === 4 && u.isActive && !isReducedAttendance(u.status));
    const noClassKeys = new Set(noClasses.map((d) => dateKey(new Date(d))));

    // Per-student set of attended date-keys.
    const attendedByUser = new Map<number, Set<string>>();
    for (const rec of attendance) {
      attendedByUser.set(rec.userId, new Set(rec.date.map((d) => dateKey(new Date(d)))));
    }

    // Build the list of class days in [start, effectiveEnd].
    const classDays: Date[] = [];
    if (start.getTime() <= effectiveEnd.getTime()) {
      for (let t = start.getTime(); t <= effectiveEnd.getTime(); t += DAY) {
        const d = new Date(t);
        if (isClassDay(d, noClassKeys)) classDays.push(d);
      }
    }

    const inRange = (u: typeof students[number]) =>
      attendedByUser.get(u.id) ?? new Set<string>();

    const countAttendees = (day: Date, pool: typeof students): number => {
      const key = dateKey(day);
      return pool.filter((u) => inRange(u).has(key)).length;
    };

    const overallCounts = classDays.map((d) => countAttendees(d, students));

    // Per weekday (Mon–Thu).
    const perWeekday = [1, 2, 3, 4].map((wd) => {
      const counts = classDays.filter((d) => d.getDay() === wd).map((d) => countAttendees(d, students));
      return { label: WEEKDAY_LABELS[wd], summary: summarize(counts) };
    });

    // Per spår (course), only those with students.
    const courses = [...new Set(students.map((u) => u.course ?? 0))].filter((c) => c > 0).sort();
    const perSpar = courses.map((course) => {
      const pool = students.filter((u) => (u.course ?? 0) === course);
      const counts = classDays.map((d) => countAttendees(d, pool));
      return { label: `Spår ${course}`, summary: summarize(counts) };
    });

    // Distinct attendees per week.
    const weekMap = new Map<string, Set<number>>();
    for (const d of classDays) {
      const wk = mondayKey(d);
      if (!weekMap.has(wk)) weekMap.set(wk, new Set());
      const set = weekMap.get(wk)!;
      const key = dateKey(d);
      for (const u of students) if (inRange(u).has(key)) set.add(u.id);
    }
    const weekly = [...weekMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([wk, set]) => ({ weekStart: wk, count: set.size }));

    // Attendance rate = attended scheduled-days ÷ scheduled-days.
    let scheduledDays = 0;
    let attendedScheduled = 0;
    for (const u of students) {
      const startDate = u.startDate ? new Date(u.startDate) : null;
      const attended = inRange(u);
      for (const d of classDays) {
        if (startDate && d.getTime() < new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()) continue;
        if (!scheduledOnWeekday(u, d.getDay())) continue;
        scheduledDays++;
        if (attended.has(dateKey(d))) attendedScheduled++;
      }
    }
    const attendanceRate = scheduledDays > 0 ? Math.round((attendedScheduled / scheduledDays) * 100) : 0;

    return {
      overall: summarize(overallCounts),
      perWeekday,
      perSpar,
      weekly,
      attendanceRate,
      classDayCount: classDays.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, attendance, noClasses, startStr, endStr]);

  const isLoading = usersLoading || attLoading;

  const renderSummaryRow = (label: string, s: StatSummary) => (
    <TableRow key={label}>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="text-center">{fmt(s.mean)}</TableCell>
      <TableCell className="text-center">{fmt(s.median)}</TableCell>
      <TableCell className="text-center">{fmt(s.min)}</TableCell>
      <TableCell className="text-center">{fmt(s.max)}</TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="stat-start">Från</Label>
          <Input id="stat-start" type="date" value={startStr} max={endStr || todayKey} onChange={(e) => setStartStr(e.target.value)} className="w-44" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stat-end">Till (tom = idag)</Label>
          <Input id="stat-end" type="date" value={endStr} max={todayKey} onChange={(e) => setEndStr(e.target.value)} className="w-44" />
        </div>
        <p className="text-sm text-muted-foreground pb-2">{stats.classDayCount} lektionsdagar i perioden</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4"><p className="text-xs text-muted-foreground">Snitt/dag</p><p className="text-2xl font-bold">{fmt(stats.overall.mean)}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground">Median/dag</p><p className="text-2xl font-bold">{fmt(stats.overall.median)}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground">Min / Max</p><p className="text-2xl font-bold">{fmt(stats.overall.min)} / {fmt(stats.overall.max)}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground">Närvarograd</p><p className="text-2xl font-bold">{stats.attendanceRate}%</p></Card>
          </div>

          <div>
            <h3 className="font-display font-semibold text-foreground mb-2">Per veckodag</h3>
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veckodag</TableHead>
                    <TableHead className="text-center">Snitt</TableHead>
                    <TableHead className="text-center">Median</TableHead>
                    <TableHead className="text-center">Min</TableHead>
                    <TableHead className="text-center">Max</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{stats.perWeekday.map((w) => renderSummaryRow(w.label, w.summary))}</TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-foreground mb-2">Per spår</h3>
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Spår</TableHead>
                    <TableHead className="text-center">Snitt</TableHead>
                    <TableHead className="text-center">Median</TableHead>
                    <TableHead className="text-center">Min</TableHead>
                    <TableHead className="text-center">Max</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{stats.perSpar.map((s) => renderSummaryRow(s.label, s.summary))}</TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-foreground mb-2">Unika deltagare per vecka</h3>
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vecka (måndag)</TableHead>
                    <TableHead className="text-center">Unika deltagare</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.weekly.length === 0 && (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">Ingen närvaro i perioden.</TableCell></TableRow>
                  )}
                  {stats.weekly.map((w) => (
                    <TableRow key={w.weekStart}>
                      <TableCell className="font-medium">{w.weekStart}</TableCell>
                      <TableCell className="text-center">{w.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
