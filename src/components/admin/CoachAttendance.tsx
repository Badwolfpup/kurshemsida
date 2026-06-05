import React, { useState } from "react";
import HelpDialog from "@/components/HelpDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, useUpdateUser } from "@/hooks/useUsers";
import { useAttendance, useGetWeek } from "@/hooks/useAttendance";
import { useNoClasses } from "@/hooks/useNoClass";
import type UserType from "@/Types/User";
import type AttendanceType from "@/Types/Attendance";
import { isReducedAttendance, statusFullLabel } from "@/lib/participantStatus";

interface CoachAttendanceProps {
  seluser: UserType;
}

const CoachAttendance: React.FC<CoachAttendanceProps> = ({ seluser = null }) => {
  const { user } = useAuth();
  const userId = user?.id || 0;
  const authLevel = user?.authLevel || 5;
  const userType = authLevel <= 2 ? "Admin" : authLevel === 3 ? "Coach" : "Student";

  const [date, setDate] = useState<Date>(new Date());
  const [selectedUser, setSelectedUser] = useState<UserType | null>(seluser || null);
  const [selectedUserId, setSelectedUserId] = useState<number>(seluser?.id || 0);
  const [selectedCoachId, setSelectedCoachId] = useState<number>(seluser?.coachId ?? 0);
  const [activeTab, setActiveTab] = useState("narvaro");
  // Stable "today" anchor for the wide stats query below (a fresh Date() each render
  // would change the query key and refetch in a loop).
  const [statsAnchor] = useState(() => new Date());

  const { toast } = useToast();

  const { data: users = [], isLoading: isUsersLoading, isError: isUsersError, error: usersError, refetch: refetchUsers, isFetching: isUsersFetching } = useUsers();
  const { data: attendance = [] as AttendanceType[], isLoading: isAttendanceLoading, isError: isAttendanceError, error: attendanceError, refetch: refetchAttendance, isRefetching: isAttendanceRefetching } = useAttendance(date, 2);
  // The grid query above only spans 2 weeks. The summary below the grid (Senaste
  // närvarodag, Närvaro per månad) needs the participant's full history, so fetch a
  // window wide enough to reach back to their start date (weeks = whole enrolment,
  // floored at 16 to always cover the 3-month table, capped at ~5 years).
  const statsWeeks = Math.min(260, Math.max(16,
    selectedUser?.startDate
      ? Math.ceil((statsAnchor.getTime() - new Date(selectedUser.startDate).getTime()) / (7 * 86_400_000)) + 1
      : 0
  ));
  const { data: statsAttendance = [] as AttendanceType[] } = useAttendance(statsAnchor, statsWeeks);
  const { data: noClasses = [] as Date[], isLoading: isNoClassesLoading, isError: isNoClassesError, error: noClassesError, refetch: refetchNoClasses, isRefetching: isNoClassesRefetching } = useNoClasses();
  const updateUserMutation = useUpdateUser();
  const { data: week } = useGetWeek(date, 2);

  const isLoading = isUsersLoading || isAttendanceLoading || isNoClassesLoading;
  const isError = isUsersError || isAttendanceError || isNoClassesError;
  const isFetching = isUsersFetching || isAttendanceRefetching || isNoClassesRefetching;

  const refetch = () => {
    if (isUsersError) void refetchUsers();
    if (isAttendanceError) void refetchAttendance();
    if (isNoClassesError) void refetchNoClasses();
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
    return statsAttendance
      .filter((att) => att.userId === selectedUser.id)
      .flatMap((att) => att.date)
      .map((d) => new Date(d))
      .filter((d) => d >= start && d <= end && scheduledSet.has(d.toISOString().slice(0, 10)));
  };

  const monthStats = (offset: number): { attended: number; scheduled: number; pct: number } => {
    if (!selectedUser) return { attended: 0, scheduled: 0, pct: 0 };
    const start = getFirstDayOfMonth(offset);
    const end = getLastDayOfMonth(offset);
    const attended = getAttendedDatesInRange(start, end).length;
    const scheduled = getScheduledDatesInRange(start, end).length;
    const pct = scheduled > 0 ? Math.round((attended / scheduled) * 100) : 0;
    return { attended, scheduled, pct };
  };

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
            <h2 className="text-2xl font-bold">
              {selectedUser ? (authLevel === 1 || authLevel === 2) ? `${selectedUser.firstName} ${selectedUser.lastName}` : `${selectedUser.firstName.charAt(0)}.${selectedUser.lastName.charAt(0)}` : "Elevsida"}
              {selectedUser && statusFullLabel(selectedUser.status) && (
                <span className="text-base font-normal text-muted-foreground ml-2">({statusFullLabel(selectedUser.status)})</span>
              )}
            </h2>
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
                  <TabsTrigger value="kontaktinfo">Kontaktinfo</TabsTrigger>
                  <TabsTrigger value="larare">{userType === "Admin" ? "Lärarkontakt" : "Lärare på kursen"}</TabsTrigger>
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
                        {Array.from({ length: 8 }).map((_, index) => {
                          const dayOffset = index < 4 ? index - 6 : index - 3;
                          const attended = attendance.filter((x) => x.userId === item.id).filter((dates) => dates.date.some((d) => compareDates(new Date(d), getDate(dayOffset)))).length > 0;
                          const afterStart = item.startDate !== null && new Date(item.startDate) <= getDate(dayOffset);
                          const hideEmpty = isReducedAttendance(item.status) && !attended;
                          return (
                          <TableCell key={index} className={`text-center${index === 4 ? " border-l-2 border-border" : ""}`}>
                            {afterStart && !hideEmpty && (
                              <Checkbox
                                checked={attended}
                                disabled={userType === "Coach" || seluser !== null}
                                onCheckedChange={() => {}}
                              />
                            )}
                          </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                <div className="mt-6 space-y-1">
                  <p className="text-sm"><strong>Startdatum:</strong> {selectedUser.startDate ? new Date(selectedUser.startDate).toLocaleDateString("sv-SE") : "Ej angivet"}</p>
                  <p className="text-sm"><strong>Senaste närvarodag:</strong> {(() => {
                    const dates = statsAttendance.filter((x) => x.userId === selectedUser.id).flatMap((a) => a.date);
                    if (dates.length === 0) return "Aldrig närvarat";
                    const latest = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
                    return new Date(latest).toLocaleDateString("sv-SE");
                  })()}</p>
                </div>

                <h3 className="text-sm font-semibold mt-4 mb-2">Närvaro per månad</h3>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Månad</TableHead>
                      <TableHead className="text-center">Antal närvaro dagar</TableHead>
                      <TableHead className="text-center">Närvaro i procent utifrån schemalagda dagar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[0, -1, -2].map((offset) => {
                      const m = monthStats(offset);
                      return (
                        <TableRow key={offset}>
                          <TableCell className="font-medium">{getMonthName(offset)}</TableCell>
                          <TableCell className="text-center">{m.attended}</TableCell>
                          <TableCell className="text-center">{m.pct}%</TableCell>
                        </TableRow>
                      );
                    })}
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
                        {users?.filter((u) => u.authLevel <= 2 && u.isActive).map((contact) => (
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
            </Tabs>
          )}

        </>
      )}
    </div>
  );
};

export default CoachAttendance;
