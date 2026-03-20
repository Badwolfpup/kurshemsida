import { useState, useMemo } from "react";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HelpDialog from "@/components/HelpDialog";
import { useUsers } from "@/hooks/useUsers";
import { useAttendance } from "@/hooks/useAttendance";
import { DeltagareList } from "@/components/deltagare/DeltagareList";
import CoachAttendance from "@/components/admin/CoachAttendance";
import type UserType from "@/Types/User";

export type Participant = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  startDate: string;
  track: number; // from user.course
  coach: string;
  coachId: number | null;
  coachEmail: string;
  teacher: string;
  active: boolean;
  attendance: Record<string, boolean>;
  projects: { name: string; status: "done" | "in-progress" | "not-started" }[];
  exercises: { name: string; completed: boolean }[];
};

const MOCK_PROJECTS: { name: string; status: "done" | "in-progress" | "not-started" }[][] = [
  [
    { name: "HTML Portfolio", status: "done" },
    { name: "CSS Layouts", status: "in-progress" },
    { name: "JavaScript Quiz", status: "not-started" },
  ],
  [
    { name: "React Todo App", status: "in-progress" },
    { name: "API Integration", status: "not-started" },
  ],
  [
    { name: "Python Basics", status: "in-progress" },
    { name: "Flask API", status: "not-started" },
  ],
];

const MOCK_EXERCISES: { name: string; completed: boolean }[][] = [
  [
    { name: "HTML Grunderna", completed: true },
    { name: "CSS Flexbox", completed: true },
    { name: "JS Variabler", completed: false },
    { name: "JS Funktioner", completed: false },
  ],
  [
    { name: "React Basics", completed: true },
    { name: "State Management", completed: false },
    { name: "useEffect", completed: false },
  ],
  [
    { name: "Python Variabler", completed: true },
    { name: "Python Loopar", completed: false },
  ],
];

function mapUserToParticipant(
  user: UserType,
  allUsers: UserType[],
  index: number
): Participant {
  const coach = allUsers.find((u) => u.id === user.coachId);
  const teacher = allUsers.find((u) => u.authLevel === 2);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    startDate: user.startDate
      ? new Date(user.startDate).toISOString().split("T")[0]
      : "",
    track: user.course ?? 1,
    coach: coach ? `${coach.firstName} ${coach.lastName}` : "Ingen coach",
    coachId: user.coachId ?? null,
    coachEmail: coach?.email ?? "",
    teacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : "Ingen lärare",
    active: user.isActive ?? true,
    attendance: {},
    projects: MOCK_PROJECTS[index % MOCK_PROJECTS.length],
    exercises: MOCK_EXERCISES[index % MOCK_EXERCISES.length],
  };
}

const Deltagare = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<number>(0);
  const { data: allUsers = [], isLoading } = useUsers();

  const today = useMemo(() => new Date(), []);
  const { data: attendanceData = [] } = useAttendance(today, 2);

  const attendanceMap = useMemo(() => {
    const map: Record<number, Record<string, boolean>> = {};
    for (const record of attendanceData) {
      const dates: Record<string, boolean> = {};
      for (const d of record.date) {
        const key = new Date(d).toISOString().split("T")[0];
        dates[key] = true;
      }
      map[record.userId] = dates;
    }
    return map;
  }, [attendanceData]);

  const coaches = useMemo(() => allUsers.filter((u) => u.authLevel === 3 && u.isActive), [allUsers]);

  const participants = useMemo<Participant[]>(() => {
    let students = allUsers.filter((u) => u.authLevel === 4);
    if (selectedCoachId !== 0) {
      students = students.filter((u) => u.coachId === selectedCoachId);
    }
    return students.map((u) => ({
      ...mapUserToParticipant(u, allUsers, u.id),
      attendance: attendanceMap[u.id] ?? {},
    }));
  }, [allUsers, selectedCoachId, attendanceMap]);

  const selectedUser = selectedId ? allUsers.find((u) => u.id === selectedId) : null;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="gap-2 text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Alla deltagare
        </Button>
        <CoachAttendance seluser={selectedUser} showChat />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Deltagare</h1>
        <HelpDialog helpKey="deltagare" />
        <Select value={selectedCoachId.toString()} onValueChange={(v) => setSelectedCoachId(Number(v))}>
          <SelectTrigger className="w-48 ml-auto"><SelectValue placeholder="Alla coacher" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Alla coacher</SelectItem>
            {coaches.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DeltagareList participants={participants} onSelect={setSelectedId} />
    </div>
  );
};

export default Deltagare;
