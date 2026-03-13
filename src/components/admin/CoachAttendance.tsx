import React, { useState, useMemo } from "react";
import HelpDialog from "@/components/HelpDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, useUpdateUser } from "@/hooks/useUsers";
import { useAttendance, useGetWeek } from "@/hooks/useAttendance";
import { useNoClasses } from "@/hooks/useNoClass";
import StudentContextChat from "@/components/messaging/StudentContextChat";
import type UserType from "@/Types/User";
import type AttendanceType from "@/Types/Attendance";

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

interface CoachAttendanceProps {
  seluser: UserType;
  showChat?: boolean;
}

const CoachAttendance: React.FC<CoachAttendanceProps> = ({ seluser = null, showChat = false }) => {
  const { user } = useAuth();
  const userId = user?.id || 0;
  const authLevel = user?.authLevel || 5;
  const userType = authLevel <= 2 ? "Admin" : authLevel === 3 ? "Coach" : "Student";

  const [date, setDate] = useState<Date>(new Date());
  const [selectedUser, setSelectedUser] = useState<UserType | null>(seluser || null);
  const [selectedUserId, setSelectedUserId] = useState<number>(seluser?.id || 0);
  const [selectedCoachId, setSelectedCoachId] = useState<number>(seluser?.coachId ?? 0);
  const [activeTab, setActiveTab] = useState("narvaro");

  const { toast } = useToast();

  const { data: users = [], isLoading: isUsersLoading, isError: isUsersError, error: usersError, refetch: refetchUsers, isFetching: isUsersFetching } = useUsers();
  const { data: attendance = [] as AttendanceType[], isLoading: isAttendanceLoading, isError: isAttendanceError, error: attendanceError, refetch: refetchAttendance, isRefetching: isAttendanceRefetching } = useAttendance(date, 2);
  const { data: noClasses = [] as Date[], isLoading: isNoClassesLoading, isError: isNoClassesError, error: noClassesError, refetch: refetchNoClasses, isRefetching: isNoClassesRefetching } = useNoClasses();
  const updateUserMutation = useUpdateUser();
  const { data: week } = useGetWeek(date, 2);

  const chatPartnerId = userType === "Admin"
    ? selectedUser?.coachId
    : users.find((u) => u.authLevel === 1 || u.authLevel === 2)?.id;
  const hasChat = showChat && !!chatPartnerId && !!selectedUser;

  const isLoading = isUsersLoading || isAttendanceLoading || isNoClassesLoading;
  const isError = isUsersError || isAttendanceError || isNoClassesError;
  const isFetching = isUsersFetching || isAttendanceRefetching || isNoClassesRefetching;

  const refetch = () => {
    if (isUsersError) refetchUsers();
    if (isAttendanceError) refetchAttendance();
    if (isNoClassesError) refetchNoClasses();
  };

  const handleUpdateUser = (u: UserType, update: boolean) => {
    if (!selectedUser) return;
    updateUserMutation.mutate(u, {
      onSuccess: () => {
        toast({ title: update ? "Användaren uppdaterad" : "Schemat uppdaterat", description: "Ändringarna har sparats." });
      },
    });
  };

  const changeWeek = (change: boolean) => {
    const offset = change ? 14 : -14;
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + offset);
    if (change) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + 7);
      if (newDate >= nextMonday) return;
    }
    setDate(newDate);
  };

  const getDate = (offset: number): Date => {
    const today = new Date();
    const monday = new Date(date);
    const dayOfWeek = today.getDay();
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    monday.setDate(monday.getDate() - adjustedDay + offset);
    return monday;
  };

  const compareDates = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
  };

  const styleAttendanceButtons = (user: UserType, date: Date): string => {
    const isNoClass = noClasses.filter((d) => compareDates(new Date(d), date)).length > 0;
    if (isNoClass) return "bg-gray-300";
    const result = attendance.filter((x) => x.userId === user.id).filter((dates) => dates.date.some((d) => compareDates(new Date(d), date))).length > 0;
    return result ? "bg-green-500" : "";
  };

  const dateFormatted = (d: Date): string => d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });

  const checkInitials = (u: UserType): string => {
    const initials = users.filter((x) => x.authLevel === 4 && x.coachId === userId && x.id !== u.id).map((x) => x.firstName[0] + x.lastName[0]);
    if (initials.includes(u.firstName[0] + u.lastName[0])) {
      return `${u.firstName.slice(0, 2)}.${u.lastName.slice(0, 2)}`;
    }
    return `${u.firstName[0]}.${u.lastName[0]}`;
  };

  const getMonthName = (offset: number): string => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleString("sv-SE", { month: "long" });
  };

  const getFirstDayOfMonth = (offset: number): Date => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getLastDayOfMonth = (offset: number): Date => {
    if (offset === 0) return new Date();
    const d = new Date();
    d.setMonth(d.getMonth() + offset + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const getWeekday = (d: Date): string => d.toLocaleDateString("sv-SE", { weekday: "long" });

  const attendsScheduledDay = (weekday: string): boolean => {
    if (!selectedUser) return false;
    if (weekday === "måndag") return selectedUser.scheduledMonAm || selectedUser.scheduledMonPm;
    if (weekday === "tisdag") return selectedUser.scheduledTueAm || selectedUser.scheduledTuePm;
    if (weekday === "onsdag") return selectedUser.scheduledWedAm || selectedUser.scheduledWedPm;
    if (weekday === "torsdag") return selectedUser.scheduledThuAm || selectedUser.scheduledThuPm;
    return false;
  };

  const getScheduledDatesInRange = (start: Date, end: Date): Date[] => {
    if (!selectedUser) return [];
    const dates: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const current = new Date(d);
      if (
        attendsScheduledDay(getWeekday(current)) &&
        !noClasses.some((nc) => compareDates(new Date(nc), current)) &&
        !!selectedUser.startDate &&
        current >= new Date(selectedUser.startDate)
      )
        dates.push(current);
    }
    return dates;
  };

  const getAttendedDatesInRange = (start: Date, end: Date): Date[] => {
    if (!selectedUser) return [];
    const scheduledSet = new Set(
      getScheduledDatesInRange(start, end).map((d) => d.toISOString().slice(0, 10))
    );
    return attendance
      .filter((att) => att.userId === selectedUser.id)
      .flatMap((att) => att.date)
      .map((d) => new Date(d))
      .filter((d) => d >= start && d <= end && scheduledSet.has(d.toISOString().slice(0, 10)));
  };

  const printScheduledDays = (offset: number): string => {
    if (!selectedUser) return "";
    const start = getFirstDayOfMonth(offset);
    const end = getLastDayOfMonth(offset);
    const attendedDays = getAttendedDatesInRange(start, end).length;
    const totalScheduled = getScheduledDatesInRange(start, end).length;
    return `${attendedDays} / ${totalScheduled} (${totalScheduled > 0 ? Math.round((attendedDays / totalScheduled) * 100) : 0}%)`;
  };

  // Memoize 3-month stats to avoid recomputing on every render
  const threeMonthStats = useMemo(() => {
    if (!selectedUser) return null;
    const start = getFirstDayOfMonth(-2);
    const end = getLastDayOfMonth(0);
    const scheduled = getScheduledDatesInRange(start, end);
    const attended = getAttendedDatesInRange(start, end);
    const attendedSet = new Set(attended.map((d) => d.toISOString().slice(0, 10)));

    // Aggregate
    const pct = scheduled.length > 0 ? Math.round((attended.length / scheduled.length) * 100) : 0;
    const aggregate = `${attended.length} / ${scheduled.length} (${pct}%)`;

    // Absence by weekday
    const weekdays = ["måndag", "tisdag", "onsdag", "torsdag"];
    const labels = ["Måndag", "Tisdag", "Onsdag", "Torsdag"];
    const absenceByWeekday = weekdays
      .map((wd, i) => {
        const total = scheduled.filter((d) => getWeekday(d) === wd).length;
        if (total === 0) return null;
        const present = attended.filter((d) => getWeekday(d) === wd).length;
        return { label: labels[i], missed: total - present, total };
      })
      .filter(Boolean) as { label: string; missed: number; total: number }[];

    // Longest absence streak
    const sorted = [...scheduled].sort((a, b) => a.getTime() - b.getTime());
    let maxAbsence = 0;
    let absenceRun = 0;
    for (const d of sorted) {
      if (!attendedSet.has(d.toISOString().slice(0, 10))) {
        absenceRun++;
        maxAbsence = Math.max(maxAbsence, absenceRun);
      } else {
        absenceRun = 0;
      }
    }

    // Attendance streaks (up to today)
    const today = new Date();
    const scheduledToToday = sorted.filter((d) => d <= today);
    let longestAttendance = 0;
    let attendanceRun = 0;
    for (const d of scheduledToToday) {
      if (attendedSet.has(d.toISOString().slice(0, 10))) {
        attendanceRun++;
        longestAttendance = Math.max(longestAttendance, attendanceRun);
      } else {
        attendanceRun = 0;
      }
    }
    let currentAttendance = 0;
    for (let i = scheduledToToday.length - 1; i >= 0; i--) {
      if (attendedSet.has(scheduledToToday[i].toISOString().slice(0, 10))) currentAttendance++;
      else break;
    }

    return { aggregate, absenceByWeekday, longestAbsenceStreak: maxAbsence, currentAttendanceStreak: currentAttendance, longestAttendanceStreak: longestAttendance };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id, attendance, noClasses]);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-2">Laddar användare...</p>
        </div>
      ) : isError ? (
        <div className="text-center">
          <p>{usersError?.message || attendanceError?.message || noClassesError?.message}</p>
          <Button onClick={() => refetch()} disabled={isFetching}>{isFetching ? "Laddar..." : "Försök igen"}</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">{(authLevel === 1 || authLevel === 2) && selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "Elevsida"}</h2>
            <div className="flex flex-wrap gap-2">
              {seluser === null && <Select value={selectedUser?.id.toString() || "0"} onValueChange={(value) => { setSelectedUserId(Number(value)); setSelectedUser(users.find((u) => u.id === Number(value)) || null); }}>
                <SelectTrigger className="w-44 sm:w-48"><SelectValue placeholder="Alla deltagare" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Alla deltagare</SelectItem>
                  {users?.filter((u) => (u.authLevel === 4 && (userType === "Admin" && u.coachId === selectedCoachId)) || (u.authLevel === 4 && userType === "Coach" && u.coachId === userId)).map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>{checkInitials(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>}
              {userType === "Admin" && seluser === null && (
                <Select value={selectedCoachId.toString()} onValueChange={(value) => setSelectedCoachId(Number(value))}>
                  <SelectTrigger className="w-44 sm:w-48"><SelectValue placeholder="Alla coacher" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Alla coacher</SelectItem>
                    {users?.filter((u) => u.authLevel === 3).map((coach) => (
                      <SelectItem key={coach.id} value={coach.id.toString()}>{authLevel === 3 ? `${coach.firstName[0]}.${coach.lastName[0]}` : `${coach.firstName} ${coach.lastName}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {selectedUser && selectedUser.id !== 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <TabsList className="h-auto flex-wrap">
                  <TabsTrigger value="narvaro">Närvaro</TabsTrigger>
                  <TabsTrigger value="schema">Schemalagda dagar</TabsTrigger>
                  {/* {hasChat && <TabsTrigger value="meddelanden">Meddelanden</TabsTrigger>} */}{/* GDPR review — temporarily suspended */}
                  <TabsTrigger value="kontaktinfo">Kontaktinfo</TabsTrigger>
                  <TabsTrigger value="larare">{userType === "Admin" ? "Lärarkontakt" : "Lärare på kursen"}</TabsTrigger>
                  <TabsTrigger value="progression">Progression</TabsTrigger>
                  <TabsTrigger value="statistik">Statistik</TabsTrigger>
                </TabsList>
                <HelpDialog helpKey={activeTab === "narvaro" && userType === "Coach" ? "attendance.narvaro.coach" : `attendance.${activeTab}`} />
              </div>
              <TabsContent value="narvaro">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-full"></div><span>Närvaro</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white-300 rounded-full border border-blue-500"></div><span>Ej närvarande</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div><span>Inställd lektion</span></div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button variant="outline" onClick={() => changeWeek(false)}>&#8592;</Button>
                  <span className="font-semibold text-sm sm:text-base">{week}</span>
                  <Button variant="outline" onClick={() => changeWeek(true)}>&#8594;</Button>
                </div>

                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Namn</TableHead>
                      <TableHead>Mån {dateFormatted(getDate(-6))}</TableHead>
                      <TableHead>Tis {dateFormatted(getDate(-5))}</TableHead>
                      <TableHead>Ons {dateFormatted(getDate(-4))}</TableHead>
                      <TableHead>Tor {dateFormatted(getDate(-3))}</TableHead>
                      <TableHead className="border-l-2 border-border">Mån {dateFormatted(getDate(1))}</TableHead>
                      <TableHead>Tis {dateFormatted(getDate(2))}</TableHead>
                      <TableHead>Ons {dateFormatted(getDate(3))}</TableHead>
                      <TableHead>Tor {dateFormatted(getDate(4))}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.filter((x) =>
                      ((x.authLevel === 4 && x.coachId === selectedCoachId && (selectedUserId !== 0 ? x.id === selectedUserId : true) && userType === "Admin") ||
                      (x.authLevel === 4 && userType === "Coach" && x.coachId === userId && (selectedUserId !== 0 ? x.id === selectedUserId : true))) &&
                      x.startDate && new Date(x.startDate) <= getDate(4)
                    ).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{checkInitials(item)}</TableCell>
                        {Array.from({ length: 8 }).map((_, index) => (
                          <TableCell key={index} className={`text-center${index === 4 ? " border-l-2 border-border" : ""}`}>
                            {item.startDate !== null && new Date(item.startDate) <= getDate(index + 2 - 7) && (
                              <Checkbox
                                checked={attendance.filter((x) => x.userId === item.id).filter((dates) => dates.date.some((d) => compareDates(new Date(d), getDate(index + 1 - 7)))).length > 0}
                                disabled={userType === "Coach" || seluser !== null}
                                onCheckedChange={() => {}}
                              />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </TabsContent>
              <TabsContent value="schema">
                <p className="text-sm text-muted-foreground mb-4">Du kan själv ändra deltagarens schema</p>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pass</TableHead>
                      <TableHead>Måndag</TableHead>
                      <TableHead>Tisdag</TableHead>
                      <TableHead>Onsdag</TableHead>
                      <TableHead>Torsdag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Förmiddag</TableCell>
                      {(["scheduledMonAm", "scheduledTueAm", "scheduledWedAm", "scheduledThuAm"] as const).map((field) => (
                        <TableCell key={field}>
                          <Button variant={selectedUser?.[field] ? "default" : "outline"} size="sm" onClick={() => {
                            if (!selectedUser) return;
                            const updated = { ...selectedUser, [field]: !selectedUser[field] };
                            setSelectedUser(updated);
                            handleUpdateUser(updated, false);
                          }}>{selectedUser?.[field] ? "Ja" : "Nej"}</Button>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Eftermiddag</TableCell>
                      {(["scheduledMonPm", "scheduledTuePm", "scheduledWedPm", "scheduledThuPm"] as const).map((field) => (
                        <TableCell key={field}>
                          <Button variant={selectedUser?.[field] ? "default" : "outline"} size="sm" onClick={() => {
                            if (!selectedUser) return;
                            const updated = { ...selectedUser, [field]: !selectedUser[field] };
                            setSelectedUser(updated);
                            handleUpdateUser(updated, false);
                          }}>{selectedUser?.[field] ? "Ja" : "Nej"}</Button>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
                </div>
              </TabsContent>
              <TabsContent value="larare">
                {userType === "Admin" ? (
                  (() => {
                    const contact = selectedUser?.contactId ? users.find((u) => u.id === selectedUser.contactId) : null;
                    if (!contact) return <p className="text-sm text-muted-foreground italic">Ingen lärarkontakt angiven.</p>;
                    return (
                      <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Namn</TableHead><TableHead>Telefonnummer</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>{contact.firstName} {contact.lastName}</TableCell>
                            <TableCell>{contact.telephone}</TableCell>
                            <TableCell>{contact.email}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      </div>
                    );
                  })()
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Grön färg är den lärare som ni primärt kontaktar angående elevuppföljning.</p>
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Namn</TableHead><TableHead>Telefonnummer</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {users?.filter((u) => u.authLevel <= 2 && u.isActive && u.firstName !== "Alexandra").map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell className={contact.id === selectedUser?.contactId ? "bg-green-100" : ""}>{contact.firstName} {contact.lastName}</TableCell>
                            <TableCell className={contact.id === selectedUser?.contactId ? "bg-green-100" : ""}>{contact.telephone}</TableCell>
                            <TableCell className={contact.id === selectedUser?.contactId ? "bg-green-100" : ""}>{contact.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </>
                )}
              </TabsContent>
              <TabsContent value="statistik">
                <p className="text-sm"><strong>Startdatum:</strong> {selectedUser?.startDate ? new Date(selectedUser.startDate).toLocaleDateString("sv-SE") : "Ej angivet"}</p>
                <p className="text-sm"><strong>Senaste närvarodag:</strong> {(() => {
                  const dates = attendance.filter((x) => x.userId === selectedUser.id).flatMap((a) => a.date);
                  if (dates.length === 0) return "Aldrig närvarat";
                  const latest = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
                  return new Date(latest).toLocaleDateString("sv-SE");
                })()}</p>

                <h3 className="text-sm font-semibold mt-4 mb-2">Närvaro per månad</h3>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead></TableHead><TableHead>{getMonthName(0)}</TableHead><TableHead>{getMonthName(-1)}</TableHead><TableHead>{getMonthName(-2)}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Närvaro utifrån schema:</TableCell>
                      <TableCell>{printScheduledDays(0)}</TableCell>
                      <TableCell>{printScheduledDays(-1)}</TableCell>
                      <TableCell>{printScheduledDays(-2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </div>

                {threeMonthStats && (
                  <>
                    <p className="text-sm mt-4"><strong>Totalt senaste 3 månader:</strong> {threeMonthStats.aggregate}</p>

                    <h3 className="text-sm font-semibold mt-4 mb-2">Frånvaro per veckodag</h3>
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Veckodag</TableHead><TableHead>Missat</TableHead><TableHead>Schemalagt</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {threeMonthStats.absenceByWeekday.map((row) => (
                          <TableRow key={row.label}>
                            <TableCell>{row.label}</TableCell>
                            <TableCell>{row.missed}</TableCell>
                            <TableCell>{row.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>

                    <div className="mt-4 space-y-1">
                      <p className="text-sm"><strong>Längsta frånvarosvit:</strong> {threeMonthStats.longestAbsenceStreak} schemalagda dagar</p>
                      <p className="text-sm"><strong>Nuvarande närvarosvit:</strong> {threeMonthStats.currentAttendanceStreak} schemalagda dagar</p>
                      <p className="text-sm"><strong>Längsta närvarosvit:</strong> {threeMonthStats.longestAttendanceStreak} schemalagda dagar</p>
                    </div>
                  </>
                )}
              </TabsContent>
              {/* GDPR review — temporarily suspended
              {hasChat && (
                <TabsContent value="meddelanden" className="h-[calc(100vh-16rem)]">
                  <StudentContextChat studentId={selectedUser.id} recipientId={chatPartnerId!} />
                </TabsContent>
              )} */}
              <TabsContent value="kontaktinfo">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Namn</TableHead>
                      <TableHead>Telefonnummer</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{authLevel === 3 ? `${selectedUser.firstName[0]}.${selectedUser.lastName[0]}` : `${selectedUser.firstName} ${selectedUser.lastName}`}</TableCell>
                      <TableCell>{selectedUser.telephone}</TableCell>
                      <TableCell>{selectedUser.email}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </div>
              </TabsContent>
              <TabsContent value="progression">
                {userType === "Admin" && selectedUser && (() => {
                  const students = users.filter((u) => u.authLevel === 4);
                  const studentIndex = students.findIndex((u) => u.id === selectedUser.id);
                  const projects = MOCK_PROJECTS[(studentIndex >= 0 ? studentIndex : 0) % MOCK_PROJECTS.length];
                  const exercises = MOCK_EXERCISES[(studentIndex >= 0 ? studentIndex : 0) % MOCK_EXERCISES.length];
                  const exercisesDone = exercises.filter((e) => e.completed).length;
                  return (
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Övningar</span>
                          <span className="font-medium text-foreground">{exercisesDone}/{exercises.length}</span>
                        </div>
                        <Progress value={exercises.length ? (exercisesDone / exercises.length) * 100 : 0} className="h-2" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Projekt</p>
                        <div className="space-y-2">
                          {projects.map((pr) => (
                            <div key={pr.name} className="flex items-center gap-2 text-sm">
                              {pr.status === "done" && <CheckCircle2 className="h-4 w-4 text-accent" />}
                              {pr.status === "in-progress" && <Clock className="h-4 w-4 text-primary" />}
                              {pr.status === "not-started" && <Circle className="h-4 w-4 text-muted-foreground" />}
                              <span className="text-foreground">{pr.name}</span>
                              <Badge variant="outline" className="ml-auto text-[10px]">
                                {pr.status === "done" ? "Klar" : pr.status === "in-progress" ? "Pågår" : "Ej startad"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Övningar</p>
                        <div className="space-y-1.5">
                          {exercises.map((e) => (
                            <div key={e.name} className="flex items-center gap-2 text-sm">
                              {e.completed ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                              <span className={e.completed ? "text-foreground" : "text-muted-foreground"}>{e.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          )}

        </>
      )}
    </div>
  );
};

export default CoachAttendance;
