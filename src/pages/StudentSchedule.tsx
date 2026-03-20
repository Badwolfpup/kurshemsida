import { useMemo } from 'react';
import { CalendarCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUsers';
import type UserType from '@/Types/User';
import HelpDialog from '@/components/HelpDialog';

interface DayConfig {
  label: string;
  shortLabel: string;
  amKey: keyof UserType;
  pmKey: keyof UserType;
}

const DAYS: DayConfig[] = [
  { label: 'Måndag', shortLabel: 'Mån', amKey: 'scheduledMonAm', pmKey: 'scheduledMonPm' },
  { label: 'Tisdag', shortLabel: 'Tis', amKey: 'scheduledTueAm', pmKey: 'scheduledTuePm' },
  { label: 'Onsdag', shortLabel: 'Ons', amKey: 'scheduledWedAm', pmKey: 'scheduledWedPm' },
  { label: 'Torsdag', shortLabel: 'Tor', amKey: 'scheduledThuAm', pmKey: 'scheduledThuPm' },
];

function hasAnySchedule(student: UserType): boolean {
  return DAYS.some((d) => student[d.amKey] || student[d.pmKey]);
}

function getStudentsForDay(students: UserType[], day: DayConfig) {
  const scheduled = students.filter((s) => s[day.amKey] || s[day.pmKey]);

  const fullDay = scheduled
    .filter((s) => s[day.amKey] && s[day.pmKey])
    .sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv'));

  const amOnly = scheduled
    .filter((s) => s[day.amKey] && !s[day.pmKey])
    .sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv'));

  const pmOnly = scheduled
    .filter((s) => !s[day.amKey] && s[day.pmKey])
    .sort((a, b) => a.firstName.localeCompare(b.firstName, 'sv'));

  return [...fullDay, ...amOnly, ...pmOnly];
}

function ScheduleBlock({ active }: { active: boolean }) {
  return (
    <div
      className={`h-6 w-6 rounded ${active ? 'bg-primary/70' : ''}`}
    />
  );
}

function OverviewTab({ students }: { students: UserType[] }) {
  const unscheduledCount = students.filter((s) => !hasAnySchedule(s)).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DAYS.map((day) => {
          const amCount = students.filter((s) => s[day.amKey]).length;
          const pmCount = students.filter((s) => s[day.pmKey]).length;
          return (
            <Card key={day.label} className="p-4 space-y-2">
              <h3 className="font-semibold text-sm">{day.label}</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Förmiddag</span>
                <span className="font-medium">{amCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Eftermiddag</span>
                <span className="font-medium">{pmCount}</span>
              </div>
            </Card>
          );
        })}
      </div>
      {unscheduledCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Ej schemalagda: {unscheduledCount}
        </p>
      )}
    </div>
  );
}

function DayTab({ students, day }: { students: UserType[]; day: DayConfig }) {
  const sorted = useMemo(() => getStudentsForDay(students, day), [students, day]);

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">Inga deltagare schemalagda denna dag.</p>;
  }

  return (
    <div className="max-w-[420px]">
      <div className="flex items-end pb-2 pl-[210px]">
        <span className="text-xs text-muted-foreground font-medium w-[26px] text-center">FM</span>
        <span className="w-[5px]" />
        <span className="text-xs text-muted-foreground font-medium w-[26px] text-center">EM</span>
      </div>
      {sorted.map((student) => (
        <div key={student.id} className="flex items-center py-1 hover:bg-muted/50 rounded">
          <span className="text-sm truncate w-[200px]">
            {student.firstName} {student.lastName}
          </span>
          <span className="w-[10px]" />
          <ScheduleBlock active={!!(student[day.amKey])} />
          <span className="w-[5px]" />
          <ScheduleBlock active={!!(student[day.pmKey])} />
        </div>
      ))}
    </div>
  );
}

export default function StudentSchedule() {
  const { data: allUsers = [], isLoading } = useUsers();

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
          <CalendarCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Deltagarschema</h1>
        <HelpDialog helpKey="deltagarschema" />
      </div>

      <Card className="p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            {DAYS.map((d) => (
              <TabsTrigger key={d.label} value={d.label}>{d.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <OverviewTab students={students} />
          </TabsContent>

          {DAYS.map((d) => (
            <TabsContent key={d.label} value={d.label} className="mt-4">
              <DayTab students={students} day={d} />
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
