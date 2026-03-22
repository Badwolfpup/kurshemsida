import { useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUsers';
import { useSeatingAssignments, useAssignSeat, useClearSeat } from '@/hooks/useSeating';
import { useToast } from '@/hooks/use-toast';
import HelpDialog from '@/components/HelpDialog';
import type UserType from '@/Types/User';
import type { SeatingAssignment } from '@/api/SeatingService';

const DAYS = [
  { value: 1, label: 'Måndag', amKey: 'scheduledMonAm' as keyof UserType, pmKey: 'scheduledMonPm' as keyof UserType },
  { value: 2, label: 'Tisdag', amKey: 'scheduledTueAm' as keyof UserType, pmKey: 'scheduledTuePm' as keyof UserType },
  { value: 3, label: 'Onsdag', amKey: 'scheduledWedAm' as keyof UserType, pmKey: 'scheduledWedPm' as keyof UserType },
  { value: 4, label: 'Torsdag', amKey: 'scheduledThuAm' as keyof UserType, pmKey: 'scheduledThuPm' as keyof UserType },
];

// Spår 1 layout: which cells have tables (row 1-4, col 1-4)
// C1 has tables at rows 1, 2, 4. C2-C4 have tables at all rows.
const SPAR1_LAYOUT: { row: number; col: number }[] = [
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 },
  { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
  { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 },
  { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
];

// Spår 2 layout: row 1 has 6 tables in pairs, row 2 has 2 tables at edges
// Using col 1-6 for the 6 positions in row 1
const SPAR2_LAYOUT: { row: number; col: number }[] = [
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 },
  { row: 2, col: 1 }, { row: 2, col: 6 },
];

function hasTable(row: number, col: number, layout: { row: number; col: number }[]): boolean {
  return layout.some((t) => t.row === row && t.col === col);
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
  assignments: SeatingAssignment[];
  row: number;
  col: number;
  period: string;
  classroomId: number;
  dayOfWeek: number;
  onAssign: (data: { classroomId: number; dayOfWeek: number; period: string; row: number; column: number; studentId: number }) => void;
  onClear: (data: { classroomId: number; dayOfWeek: number; period: string; row: number; column: number }) => void;
}

function SeatSelect({ students, overflowStudents, overflowSourceAssignments, assignments, row, col, period, classroomId, dayOfWeek, onAssign, onClear }: SeatSelectProps) {
  const current = getAssignment(assignments, row, col, period);
  const assignedIds = getAssignedStudentIds(assignments, period);
  const day = DAYS.find((d) => d.value === dayOfWeek);
  const isScheduled = (s: UserType) => day ? (period === 'am' ? !!s[day.amKey] : !!s[day.pmKey]) : false;

  const available = students.filter((s) => {
    if (current && s.id === current.studentId) return true;
    if (assignedIds.has(s.id)) return false;
    return isScheduled(s);
  }).sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv'));

  const sourceAssignedIds = overflowSourceAssignments ? getAssignedStudentIds(overflowSourceAssignments, period) : new Set<number>();
  const availableOverflow = overflowStudents?.filter((s) => {
    if (current && s.id === current.studentId) return true;
    if (sourceAssignedIds.has(s.id)) return false;
    if (assignedIds.has(s.id)) return false;
    return isScheduled(s);
  }).sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv')) ?? [];

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
        {availableOverflow.length > 0 && (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground">Spår 1</SelectLabel>
              {availableOverflow.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.firstName} {s.lastName}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}
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
  assignments: SeatingAssignment[];
  classroomId: number;
  dayOfWeek: number;
  layout: { row: number; col: number }[];
  onAssign: SeatSelectProps['onAssign'];
  onClear: SeatSelectProps['onClear'];
}

function TableCell({ row, col, students, overflowStudents, overflowSourceAssignments, assignments, classroomId, dayOfWeek, layout, onAssign, onClear }: TableCellProps) {
  if (!hasTable(row, col, layout)) {
    return <div />;
  }

  return (
    <div className="rounded-lg border-2 border-border bg-muted/30 p-1 flex flex-col gap-0.5">
      <SeatSelect
        students={students} overflowStudents={overflowStudents} overflowSourceAssignments={overflowSourceAssignments}
        assignments={assignments} row={row} col={col} period="am"
        classroomId={classroomId} dayOfWeek={dayOfWeek}
        onAssign={onAssign} onClear={onClear}
      />
      <div className="border-t border-border/50" />
      <SeatSelect
        students={students} overflowStudents={overflowStudents} overflowSourceAssignments={overflowSourceAssignments}
        assignments={assignments} row={row} col={col} period="pm"
        classroomId={classroomId} dayOfWeek={dayOfWeek}
        onAssign={onAssign} onClear={onClear}
      />
    </div>
  );
}

function ClassroomGrid({ classroomId, students: allStudents, dayOfWeek }: { classroomId: number; students: UserType[]; dayOfWeek: number }) {
  const students = useMemo(() => allStudents.filter((s) => (s.course ?? 0) === classroomId), [allStudents, classroomId]);
  const { data: assignments = [] } = useSeatingAssignments(classroomId, dayOfWeek);
  const { data: spar1Assignments = [] } = useSeatingAssignments(1, dayOfWeek);
  const assignMut = useAssignSeat();
  const clearMut = useClearSeat();
  const { toast } = useToast();

  const overflowStudents = useMemo(() => {
    if (classroomId !== 2) return undefined;
    return allStudents.filter((s) => (s.course ?? 0) === 1);
  }, [classroomId, allStudents]);

  const handleAssign: SeatSelectProps['onAssign'] = async (data) => {
    try {
      await assignMut.mutateAsync(data);
    } catch {
      toast({ title: 'Fel', description: 'Kunde inte tilldela plats.', variant: 'destructive' });
    }
  };

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
    return {
      am: students.filter((s) => !!s[day.amKey] && !amAssigned.has(s.id))
        .sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv')),
      pm: students.filter((s) => !!s[day.pmKey] && !pmAssigned.has(s.id))
        .sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv')),
    };
  }, [students, assignments, day]);

  const layout = classroomId === 1 ? SPAR1_LAYOUT : SPAR2_LAYOUT;
  const props = { students, overflowStudents, overflowSourceAssignments: classroomId === 2 ? spar1Assignments : undefined, assignments, classroomId, dayOfWeek, layout, onAssign: handleAssign, onClear: handleClear };

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

  // Spår 2: wider room, 2 rows
  // Row 1: 3 pairs of facing tables with gaps between pairs (col 1-2, 3-4, 5-6)
  // Row 2: table at col 1 and col 6 only
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

          {/* Row 2: col 1 and col 6 only */}
          <div key="2-1"><TableCell row={2} col={1} {...props} /></div>
          <div key="2-2" />
          <div key="2-gap1" />
          <div key="2-3" />
          <div key="2-4" />
          <div key="2-gap2" />
          <div key="2-5" />
          <div key="2-6"><TableCell row={2} col={6} {...props} /></div>

          {/* Footer */}
          <div className="col-span-8 text-xs text-muted-foreground text-center mt-1">FM / EM per bord</div>
        </div>
      </div>
      {unassignedSidebar}
    </div>
  );
}

function OverviewTab({ students }: { students: UserType[] }) {
  const spar1Students = useMemo(() => students.filter((s) => (s.course ?? 0) === 1), [students]);
  const spar2Students = useMemo(() => students.filter((s) => (s.course ?? 0) === 2), [students]);

  const { data: s1d1 = [] } = useSeatingAssignments(1, 1);
  const { data: s1d2 = [] } = useSeatingAssignments(1, 2);
  const { data: s1d3 = [] } = useSeatingAssignments(1, 3);
  const { data: s1d4 = [] } = useSeatingAssignments(1, 4);
  const { data: s2d1 = [] } = useSeatingAssignments(2, 1);
  const { data: s2d2 = [] } = useSeatingAssignments(2, 2);
  const { data: s2d3 = [] } = useSeatingAssignments(2, 3);
  const { data: s2d4 = [] } = useSeatingAssignments(2, 4);

  const spar1Total = SPAR1_LAYOUT.length;
  const spar2Total = SPAR2_LAYOUT.length;

  function countFreeSeats(assignments: SeatingAssignment[], total: number, period: string) {
    const occupied = new Set(assignments.filter((a) => a.period === period).map((a) => `${a.row}-${a.column}`)).size;
    return Math.max(0, total - occupied);
  }

  const spar1Assignments = [s1d1, s1d2, s1d3, s1d4];
  const spar2Assignments = [s2d1, s2d2, s2d3, s2d4];

  return (
    <div className="space-y-6">
      {[
        { label: 'Spår 1', total: spar1Total, assignments: spar1Assignments, students: spar1Students },
        { label: 'Spår 2', total: spar2Total, assignments: spar2Assignments, students: spar2Students },
      ].map((spar) => (
        <div key={spar.label}>
          <h3 className="text-sm font-semibold mb-2">{spar.label} ({spar.total} bord)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {DAYS.map((day, i) => {
              const freeAm = countFreeSeats(spar.assignments[i], spar.total, 'am');
              const freePm = countFreeSeats(spar.assignments[i], spar.total, 'pm');
              const scheduledAm = spar.students.filter((s) => !!s[day.amKey]).length;
              const scheduledPm = spar.students.filter((s) => !!s[day.pmKey]).length;
              return (
                <Card key={day.value} className="p-3 space-y-1.5">
                  <h4 className="text-sm font-medium">{day.label}</h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">FM</span>
                    <span>{freeAm} lediga / {scheduledAm} schemalagda</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">EM</span>
                    <span>{freePm} lediga / {scheduledPm} schemalagda</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Klassrum() {
  const { data: allUsers = [], isLoading } = useUsers();
  const [dayOfWeek, setDayOfWeek] = useState(1);

  const students = useMemo(
    () => allUsers.filter((u) => u.authLevel === 4 && u.isActive),
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
