import { Fragment, useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useUsers';
import { useSeatingAssignments, useAssignSeat, useClearSeat } from '@/hooks/useSeating';
import { useToast } from '@/hooks/use-toast';
import HelpDialog from '@/components/HelpDialog';
import type UserType from '@/Types/User';
import type { SeatingAssignment } from '@/api/SeatingService';
import { isReducedAttendance } from '@/lib/participantStatus';

const DAYS = [
  { value: 1, label: 'Måndag', amKey: 'scheduledMonAm' as keyof UserType, pmKey: 'scheduledMonPm' as keyof UserType },
  { value: 2, label: 'Tisdag', amKey: 'scheduledTueAm' as keyof UserType, pmKey: 'scheduledTuePm' as keyof UserType },
  { value: 3, label: 'Onsdag', amKey: 'scheduledWedAm' as keyof UserType, pmKey: 'scheduledWedPm' as keyof UserType },
  { value: 4, label: 'Torsdag', amKey: 'scheduledThuAm' as keyof UserType, pmKey: 'scheduledThuPm' as keyof UserType },
];

// Spår 1 layout: which cells have tables (row 1-4, col 1-4)
// C1 has tables at rows 1, 2, 4. C2-C4 have tables at all rows.
export const SPAR1_LAYOUT: { row: number; col: number }[] = [
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 },
  { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
  { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 },
  { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
];

// Spår 2 layout: row 1 has 5 tables (col 5 empty), row 2 (middle) has 1 table at the right wall,
// row 3 has tables at both walls plus one in the middle.
// Using col 1-6 for the positions in row 1.
export const SPAR2_LAYOUT: { row: number; col: number }[] = [
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 6 },
  { row: 2, col: 6 },
  { row: 3, col: 1 }, { row: 3, col: 3 }, { row: 3, col: 6 },
];

function hasTable(row: number, col: number, layout: { row: number; col: number }[]): boolean {
  return layout.some((t) => t.row === row && t.col === col);
}

// Tables are numbered per-Spår in layout order (row by row, left to right).
function getTableNumber(row: number, col: number, layout: { row: number; col: number }[]): number {
  return layout.findIndex((t) => t.row === row && t.col === col) + 1;
}

function getAssignment(assignments: SeatingAssignment[], row: number, col: number, period: string): SeatingAssignment | undefined {
  return assignments.find((a) => a.row === row && a.column === col && a.period === period);
}

function getAssignedStudentIds(assignments: SeatingAssignment[], period: string): Set<number> {
  return new Set(assignments.filter((a) => a.period === period).map((a) => a.studentId));
}

interface SeatSelectProps {
  students: UserType[];
  overflowStudents?: UserType[];
  overflowSourceAssignments?: SeatingAssignment[];
  crossAssignments?: SeatingAssignment[];
  assignments: SeatingAssignment[];
  row: number;
  col: number;
  period: string;
  classroomId: number;
  dayOfWeek: number;
  onAssign: (data: { classroomId: number; dayOfWeek: number; period: string; row: number; column: number; studentId: number }) => void;
  onClear: (data: { classroomId: number; dayOfWeek: number; period: string; row: number; column: number }) => void;
}

function SeatSelect({ students, overflowStudents, overflowSourceAssignments, crossAssignments, assignments, row, col, period, classroomId, dayOfWeek, onAssign, onClear }: SeatSelectProps) {
  const current = getAssignment(assignments, row, col, period);
  const assignedIds = getAssignedStudentIds(assignments, period);
  const crossAssignedIds = crossAssignments ? getAssignedStudentIds(crossAssignments, period) : new Set<number>();
  const day = DAYS.find((d) => d.value === dayOfWeek);
  const isScheduled = (s: UserType) => day ? (period === 'am' ? !!s[day.amKey] : !!s[day.pmKey]) : false;

  const available = students.filter((s) => {
    if (current && s.id === current.studentId) return true;
    if (assignedIds.has(s.id)) return false;
    if (crossAssignedIds.has(s.id)) return false;
    return isScheduled(s);
  }).sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv'));

  const sourceAssignedIds = overflowSourceAssignments ? getAssignedStudentIds(overflowSourceAssignments, period) : new Set<number>();
  const availableOverflow = overflowStudents?.filter((s) => {
    if (current && s.id === current.studentId) return true;
    if (sourceAssignedIds.has(s.id)) return false;
    if (assignedIds.has(s.id)) return false;
    return isScheduled(s);
  }).sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv')) ?? [];

  // Split the available other-track students into one group per Spår, ordered by track number.
  const overflowByCourse = new Map<number, UserType[]>();
  for (const s of availableOverflow) {
    const course = s.course ?? 0;
    const list = overflowByCourse.get(course);
    if (list) list.push(s);
    else overflowByCourse.set(course, [s]);
  }
  const overflowGroups = [...overflowByCourse].sort((a, b) => a[0] - b[0]);

  const currentName = current
    ? (students.find((s) => s.id === current.studentId) ?? overflowStudents?.find((s) => s.id === current.studentId))
    : undefined;

  return (
    <Select
      value={current?.studentId?.toString() ?? '_empty'}
      onValueChange={(val) => {
        if (val === '_empty') {
          onClear({ classroomId, dayOfWeek, period, row, column: col });
        } else {
          onAssign({ classroomId, dayOfWeek, period, row, column: col, studentId: Number(val) });
        }
      }}
    >
      <SelectTrigger className="h-7 text-xs w-full border-0 bg-transparent shadow-none px-1">
        <SelectValue placeholder="—">
          {currentName ? `${currentName.firstName} ${currentName.lastName?.charAt(0)}.` : '—'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_empty">—</SelectItem>
        {available.map((s) => (
          <SelectItem key={s.id} value={s.id.toString()}>
            {s.firstName} {s.lastName}
          </SelectItem>
        ))}
        {overflowGroups.map(([course, group]) => (
          <Fragment key={course}>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground">Spår {course}</SelectLabel>
              {group.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.firstName} {s.lastName}
                </SelectItem>
              ))}
            </SelectGroup>
          </Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}

interface TableCellProps {
  row: number;
  col: number;
  students: UserType[];
  overflowStudents?: UserType[];
  overflowSourceAssignments?: SeatingAssignment[];
  crossAssignments?: SeatingAssignment[];
  assignments: SeatingAssignment[];
  classroomId: number;
  dayOfWeek: number;
  layout: { row: number; col: number }[];
  onAssign: SeatSelectProps['onAssign'];
  onClear: SeatSelectProps['onClear'];
}

function TableCell({ row, col, students, overflowStudents, overflowSourceAssignments, crossAssignments, assignments, classroomId, dayOfWeek, layout, onAssign, onClear }: TableCellProps) {
  if (!hasTable(row, col, layout)) {
    return <div />;
  }

  const tableNumber = getTableNumber(row, col, layout);
  const digits = String(tableNumber).split('');

  return (
    <div className="rounded-lg border-2 border-border bg-muted/30 p-1 flex items-stretch gap-1">
      {digits.length === 1 ? (
        <div className="flex items-center justify-center w-4 shrink-0 pr-1 border-r border-border/50 text-xs font-bold text-foreground">
          {tableNumber}
        </div>
      ) : (
        // Two digits: stacked tightly and centered so they read as one number.
        <div className="flex flex-col items-center justify-center gap-0.5 leading-none w-4 shrink-0 pr-1 border-r border-border/50 text-xs font-bold text-foreground">
          <span>{digits[0]}</span>
          <span>{digits[1]}</span>
        </div>
      )}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <SeatSelect
          students={students} overflowStudents={overflowStudents} overflowSourceAssignments={overflowSourceAssignments} crossAssignments={crossAssignments}
          assignments={assignments} row={row} col={col} period="am"
          classroomId={classroomId} dayOfWeek={dayOfWeek}
          onAssign={onAssign} onClear={onClear}
        />
        <div className="border-t border-border/50" />
        <SeatSelect
          students={students} overflowStudents={overflowStudents} overflowSourceAssignments={overflowSourceAssignments} crossAssignments={crossAssignments}
          assignments={assignments} row={row} col={col} period="pm"
          classroomId={classroomId} dayOfWeek={dayOfWeek}
          onAssign={onAssign} onClear={onClear}
        />
      </div>
    </div>
  );
}

function ClassroomGrid({ classroomId, students: allStudents, dayOfWeek }: { classroomId: number; students: UserType[]; dayOfWeek: number }) {
  const students = useMemo(() => allStudents.filter((s) => (s.course ?? 0) === classroomId), [allStudents, classroomId]);
  const { data: assignments = [] } = useSeatingAssignments(classroomId, dayOfWeek);
  const { data: spar1Assignments = [] } = useSeatingAssignments(1, dayOfWeek);
  const { data: spar2Assignments = [] } = useSeatingAssignments(2, dayOfWeek);
  const assignMut = useAssignSeat();
  const clearMut = useClearSeat();
  const { toast } = useToast();

  // Students from any other track can also be seated here; they show up grouped by Spår in the select,
  // and a student already seated in another room is filtered out (works in every direction).
  const otherAssignments = classroomId === 1 ? spar2Assignments : spar1Assignments;
  const overflowStudents = useMemo(
    () => allStudents.filter((s) => (s.course ?? 0) > 0 && s.course !== classroomId),
    [allStudents, classroomId],
  );

  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- handler manages its own errors via try/catch
  const handleAssign: SeatSelectProps['onAssign'] = async (data) => {
    try {
      await assignMut.mutateAsync(data);
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte tilldela plats.', variant: 'destructive' });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- handler manages its own errors via try/catch
  const handleClear: SeatSelectProps['onClear'] = async (data) => {
    try {
      await clearMut.mutateAsync(data);
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte ta bort tilldelning.', variant: 'destructive' });
    }
  };

  // Unassigned students for current day
  const day = DAYS.find((d) => d.value === dayOfWeek);
  const unassigned = useMemo(() => {
    if (!day) return { am: [] as UserType[], pm: [] as UserType[] };
    const amAssigned = getAssignedStudentIds(assignments, 'am');
    const pmAssigned = getAssignedStudentIds(assignments, 'pm');
    // Students placed in the other classroom are no longer free here.
    const crossAm = getAssignedStudentIds(otherAssignments, 'am');
    const crossPm = getAssignedStudentIds(otherAssignments, 'pm');
    return {
      am: students.filter((s) => !!s[day.amKey] && !amAssigned.has(s.id) && !crossAm.has(s.id))
        .sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv')),
      pm: students.filter((s) => !!s[day.pmKey] && !pmAssigned.has(s.id) && !crossPm.has(s.id))
        .sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv')),
    };
  }, [students, assignments, otherAssignments, day]);

  const layout = classroomId === 1 ? SPAR1_LAYOUT : SPAR2_LAYOUT;
  const props = { students, overflowStudents, overflowSourceAssignments: otherAssignments, crossAssignments: otherAssignments, assignments, classroomId, dayOfWeek, layout, onAssign: handleAssign, onClear: handleClear };

  const unassignedSidebar = (
    <div className="w-[180px] shrink-0">
      <h3 className="text-sm font-semibold mb-2">Ej placerade</h3>
      {unassigned.am.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Förmiddag ({unassigned.am.length})</p>
          {unassigned.am.map((s) => (
            <div key={s.id} className="text-xs py-0.5">{s.firstName} {s.lastName}</div>
          ))}
        </div>
      )}
      {unassigned.pm.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Eftermiddag ({unassigned.pm.length})</p>
          {unassigned.pm.map((s) => (
            <div key={s.id} className="text-xs py-0.5">{s.firstName} {s.lastName}</div>
          ))}
        </div>
      )}
      {unassigned.am.length === 0 && unassigned.pm.length === 0 && (
        <p className="text-xs text-muted-foreground">Alla placerade</p>
      )}
    </div>
  );

  if (classroomId === 1) {
    return (
      <div className="flex gap-8">
        <div className="flex-1">
          <div className="grid gap-y-2" style={{ gridTemplateColumns: '1fr 45px 1fr 1fr 45px 1fr', justifyContent: 'center' }}>
            <div className="text-xs text-muted-foreground text-center">Vägg</div>
            <div /><div /><div />
            <div />
            <div className="text-xs text-muted-foreground text-center">Vägg</div>

            {[1, 2, 3, 4].flatMap((row) => [
              <div key={`${row}-1`}><TableCell row={row} col={1} {...props} /></div>,
              <div key={`${row}-gap1`} />,
              <div key={`${row}-2`}><TableCell row={row} col={2} {...props} /></div>,
              <div key={`${row}-3`}><TableCell row={row} col={3} {...props} /></div>,
              <div key={`${row}-gap2`} />,
              <div key={`${row}-4`}><TableCell row={row} col={4} {...props} /></div>,
            ])}

            <div /><div />
            <div className="col-span-2 text-xs text-muted-foreground text-center mt-1">FM / EM per bord</div>
            <div /><div />
          </div>
        </div>
        {unassignedSidebar}
      </div>
    );
  }

  // Spår 2: wider room, 3 rows
  // Row 1: pairs of facing tables with gaps between pairs (col 1-2, 3-4, 5-6); col 5 is empty
  // Row 2 (middle): table at the right wall (col 6) only
  // Row 3: tables at both walls (col 1, col 6) plus one in the middle (col 3)
  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <div className="grid gap-y-2 gap-x-0" style={{ gridTemplateColumns: '1fr 1fr 30px 1fr 1fr 30px 1fr 1fr', justifyContent: 'center' }}>
          {/* Row 1 */}
          {[1, 2].flatMap((col) => [
            <div key={`1-${col}`}><TableCell row={1} col={col} {...props} /></div>,
          ])}
          <div key="1-gap1" />
          {[3, 4].flatMap((col) => [
            <div key={`1-${col}`}><TableCell row={1} col={col} {...props} /></div>,
          ])}
          <div key="1-gap2" />
          {[5, 6].flatMap((col) => [
            <div key={`1-${col}`}><TableCell row={1} col={col} {...props} /></div>,
          ])}

          {/* Row 2 (middle): right wall (col 6) only */}
          <div key="2-1" />
          <div key="2-2" />
          <div key="2-gap1" />
          <div key="2-3" />
          <div key="2-4" />
          <div key="2-gap2" />
          <div key="2-5" />
          <div key="2-6"><TableCell row={2} col={6} {...props} /></div>

          {/* Row 3: left wall (col 1), middle (col 3), right wall (col 6) */}
          <div key="3-1"><TableCell row={3} col={1} {...props} /></div>
          <div key="3-2" />
          <div key="3-gap1" />
          <div key="3-3"><TableCell row={3} col={3} {...props} /></div>
          <div key="3-4" />
          <div key="3-gap2" />
          <div key="3-5" />
          <div key="3-6"><TableCell row={3} col={6} {...props} /></div>

          {/* Footer */}
          <div className="col-span-8 text-xs text-muted-foreground text-center mt-1">FM / EM per bord</div>
        </div>
      </div>
      {unassignedSidebar}
    </div>
  );
}

interface FreeStats {
  total: number;
  obokad: number; // free both FM and EM
  fm: number;     // free in the morning
  em: number;     // free in the afternoon
}

// Wall tables ("Väggbord") have their back to a wall; center tables ("Centerbord") sit in the middle
// of the room. Many students prefer a wall seat, so the overview tracks the two groups separately.
// Spår 1 walls are the outer columns 1 and 4 (so center tables are 2,3,6,7,9,10,13,14);
// in Spår 2 every table is against a wall.
function isWallTable(col: number, classroomId: number): boolean {
  if (classroomId === 2) return true;
  return col === 1 || col === 4;
}

function computeFreeStats(layout: { row: number; col: number }[], assignments: SeatingAssignment[], classroomId: number, wall: boolean): FreeStats {
  const amOccupied = new Set(assignments.filter((a) => a.period === 'am').map((a) => `${a.row}-${a.column}`));
  const pmOccupied = new Set(assignments.filter((a) => a.period === 'pm').map((a) => `${a.row}-${a.column}`));
  const stats: FreeStats = { total: 0, obokad: 0, fm: 0, em: 0 };
  for (const t of layout) {
    if (isWallTable(t.col, classroomId) !== wall) continue;
    const key = `${t.row}-${t.col}`;
    const freeFm = !amOccupied.has(key);
    const freeEm = !pmOccupied.has(key);
    stats.total++;
    if (freeFm) stats.fm++;
    if (freeEm) stats.em++;
    if (freeFm && freeEm) stats.obokad++;
  }
  return stats;
}

interface FreeDestination {
  number: number;
  isWall: boolean;
}

interface FreeSuggestion {
  freedTable: number;
  freedIsWall: boolean;
  students: string;
  destinations: FreeDestination[];
}

function destinationLabel(d: FreeDestination): string {
  return `${d.number} (${d.isWall ? 'väggbord' : 'centerbord'})`;
}

function formatDestinations(dests: FreeDestination[]): string {
  if (dests.length <= 1) return dests[0] ? destinationLabel(dests[0]) : '';
  return `${dests.slice(0, -1).map(destinationLabel).join(', ')} eller ${destinationLabel(dests[dests.length - 1])}`;
}

// A table can be freed for the whole week by moving all its students onto another occupied table
// whose weekly slots (day + period) don't overlap. Because disjoint slots make the merge work in
// either direction, each mergeable table is reported with every table it could consolidate onto.
function findFreeableTables(
  layout: { row: number; col: number }[],
  assignments: SeatingAssignment[],
  classroomId: number,
  nameOf: (id: number) => string,
): FreeSuggestion[] {
  const tables = layout
    .map((t) => {
      const own = assignments.filter((a) => a.row === t.row && a.column === t.col);
      return {
        number: getTableNumber(t.row, t.col, layout),
        isWall: isWallTable(t.col, classroomId),
        slots: new Set(own.map((a) => `${a.dayOfWeek}-${a.period}`)),
        studentIds: [...new Set(own.map((a) => a.studentId))],
      };
    })
    .filter((t) => t.slots.size > 0);

  const disjoint = (a: Set<string>, b: Set<string>) => ![...a].some((s) => b.has(s));

  return tables
    .map((t) => ({
      freedTable: t.number,
      freedIsWall: t.isWall,
      students: t.studentIds.map(nameOf).join(', '),
      destinations: tables
        .filter((d) => d.number !== t.number && disjoint(t.slots, d.slots))
        .map((d) => ({ number: d.number, isWall: d.isWall }))
        .sort((a, b) => a.number - b.number),
    }))
    .filter((s) => s.destinations.length > 0)
    .sort((a, b) => a.freedTable - b.freedTable);
}

function OverviewTab({ students }: { students: UserType[] }) {
  const [analyzed, setAnalyzed] = useState(false);
  const studentMap = useMemo(() => new Map(students.map((s): [number, UserType] => [s.id, s])), [students]);
  const nameOf = (id: number) => {
    const s = studentMap.get(id);
    if (!s) return `#${id}`;
    return s.lastName ? `${s.firstName} ${s.lastName.charAt(0)}.` : s.firstName;
  };
  const { data: s1d1 = [] } = useSeatingAssignments(1, 1);
  const { data: s1d2 = [] } = useSeatingAssignments(1, 2);
  const { data: s1d3 = [] } = useSeatingAssignments(1, 3);
  const { data: s1d4 = [] } = useSeatingAssignments(1, 4);
  const { data: s2d1 = [] } = useSeatingAssignments(2, 1);
  const { data: s2d2 = [] } = useSeatingAssignments(2, 2);
  const { data: s2d3 = [] } = useSeatingAssignments(2, 3);
  const { data: s2d4 = [] } = useSeatingAssignments(2, 4);

  const spars = [
    { label: 'Spår 1', classroomId: 1, layout: SPAR1_LAYOUT, assignments: [s1d1, s1d2, s1d3, s1d4] },
    { label: 'Spår 2', classroomId: 2, layout: SPAR2_LAYOUT, assignments: [s2d1, s2d2, s2d3, s2d4] },
  ];

  const freeable = spars.map((spar) => ({
    label: spar.label,
    suggestions: findFreeableTables(spar.layout, spar.assignments.flat(), spar.classroomId, nameOf),
  }));
  const anyFreeable = freeable.some((p) => p.suggestions.length > 0);

  return (
    <div className="space-y-6">
      {spars.map((spar) => (
        <div key={spar.label}>
          <h3 className="text-sm font-semibold mb-2">{spar.label} ({spar.layout.length} bord)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DAYS.map((day, i) => {
              const wall = computeFreeStats(spar.layout, spar.assignments[i], spar.classroomId, true);
              const center = computeFreeStats(spar.layout, spar.assignments[i], spar.classroomId, false);
              const showCenter = center.total > 0;
              const rows = [
                { label: 'Helt obokad', wall: wall.obokad, center: center.obokad },
                { label: 'Ledig FM', wall: wall.fm, center: center.fm },
                { label: 'Ledig EM', wall: wall.em, center: center.em },
              ];
              return (
                <Card key={day.value} className="p-3">
                  <h4 className="text-sm font-medium mb-2">{day.label}</h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left font-normal pb-1" />
                        <th className="text-right font-normal pb-1">Väggbord ({wall.total})</th>
                        {showCenter && <th className="text-right font-normal pb-1">Centerbord ({center.total})</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.label}>
                          <td className="text-muted-foreground py-0.5">{r.label}</td>
                          <td className="text-right tabular-nums py-0.5">{r.wall}</td>
                          {showCenter && <td className="text-right tabular-nums py-0.5">{r.center}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t border-border pt-4">
        <Button variant="outline" size="sm" onClick={() => setAnalyzed(true)}>
          Frigör bord
        </Button>
        {analyzed && (anyFreeable ? (
          <div className="mt-3 space-y-3 text-sm">
            {freeable.filter((p) => p.suggestions.length > 0).map((p) => (
              <div key={p.label}>
                <h4 className="font-medium mb-1">{p.label}</h4>
                <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                  {p.suggestions.map((s) => (
                    <li key={s.freedTable}>
                      Bord {s.freedTable} ({s.freedIsWall ? 'väggbord' : 'centerbord'}) skulle kunna frigöras om {s.students} byter till bord {formatDestinations(s.destinations)}.
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Inga bord kan frigöras just nu.</p>
        ))}
      </div>
    </div>
  );
}

export default function Klassrum() {
  const { data: allUsers = [], isLoading } = useUsers();
  const [dayOfWeek, setDayOfWeek] = useState(1);

  const students = useMemo(
    () => allUsers.filter((u) => u.authLevel === 4 && u.isActive && !isReducedAttendance(u.status)),
    [allUsers]
  );

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <LayoutGrid className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Klassrum</h1>
        <HelpDialog helpKey="klassrum" />
      </div>

      <Card className="p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="spar1">Spår 1</TabsTrigger>
            <TabsTrigger value="spar2">Spår 2</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <OverviewTab students={students} />
          </TabsContent>

          <TabsContent value="spar1">
            <div className="flex items-center gap-2 mt-2 mb-4">
              <span className="text-sm text-muted-foreground">Dag:</span>
              <ToggleGroup type="single" value={dayOfWeek.toString()} onValueChange={(v) => v && setDayOfWeek(Number(v))}>
                {DAYS.map((d) => (
                  <ToggleGroupItem key={d.value} value={d.value.toString()} className="text-xs">
                    {d.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <ClassroomGrid classroomId={1} students={students} dayOfWeek={dayOfWeek} />
          </TabsContent>

          <TabsContent value="spar2">
            <div className="flex items-center gap-2 mt-2 mb-4">
              <span className="text-sm text-muted-foreground">Dag:</span>
              <ToggleGroup type="single" value={dayOfWeek.toString()} onValueChange={(v) => v && setDayOfWeek(Number(v))}>
                {DAYS.map((d) => (
                  <ToggleGroupItem key={d.value} value={d.value.toString()} className="text-xs">
                    {d.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <ClassroomGrid classroomId={2} students={students} dayOfWeek={dayOfWeek} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
