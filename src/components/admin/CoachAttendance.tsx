import React, { useState } from "react";
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
  const [selectedCoachId, setSelectedCoachId] = useState<number>(0);

  const { toast } = useToast();

  const { data: users = [], isLoading: isUsersLoading, isError: isUsersError, error: usersError, refetch: refetchUsers, isFetching: isUsersFetching } = useUsers();
  const { data: attendance = [] as AttendanceType[], isLoading: isAttendanceLoading, isError: isAttendanceError, error: attendanceError, refetch: refetchAttendance, isRefetching: isAttendanceRefetching } = useAttendance(date, 2);
  const { data: noClasses = [] as Date[], isLoading: isNoClassesLoading, isError: isNoClassesError, error: noClassesError, refetch: refetchNoClasses, isRefetching: isNoClassesRefetching } = useNoClasses();
  const updateUserMutation = useUpdateUser();
  const { data: week } = useGetWeek(date, 2);

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

  const getTotalScheduledDaysInMonth = (monthOffset: number): number => {
    if (!selectedUser) return 0;
    const firstday = getFirstDayOfMonth(monthOffset);
    const lastday = getLastDayOfMonth(monthOffset);
    let count = 0;
    for (let d = new Date(firstday); d <= lastday; d.setDate(d.getDate() + 1)) {
      if (attendsScheduledDay(getWeekday(d)) && !noClasses.some((nc) => compareDates(new Date(nc), d)) && !!selectedUser.startDate && d >= new Date(selectedUser.startDate)) count++;
    }
    return count;
  };

  const printScheduledDays = (offset: number): string => {
    if (!selectedUser) return "";
    const attendedDays = attendance.filter((att) => att.userId === selectedUser.id).reduce((acc, att) => acc + att.date.filter((d) => {
      const attDate = new Date(d);
      return attDate >= getFirstDayOfMonth(0) && attDate <= getLastDayOfMonth(0) && attendsScheduledDay(getWeekday(attDate)) && !noClasses.some((nc) => compareDates(new Date(nc), attDate)) && !!selectedUser.startDate && attDate >= new Date(selectedUser.startDate);
    }).length, 0);
    const totalScheduled = getTotalScheduledDaysInMonth(offset);
    return `${attendedDays} / ${totalScheduled} (${totalScheduled > 0 ? Math.round((attendedDays / totalScheduled) * 100) : 0}%)`;
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Elevsida</h2>
            <div className="flex gap-2">
              {seluser === null && <Select value={selectedUser?.id.toString() || "0"} onValueChange={(value) => { setSelectedUserId(Number(value)); setSelectedUser(users.find((u) => u.id === Number(value)) || null); }}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Alla deltagare" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Alla deltagare</SelectItem>
                  {users?.filter((u) => (u.authLevel === 4 && (userType === "Admin" && u.coachId === selectedCoachId)) || (u.authLevel === 4 && userType === "Coach" && u.coachId === userId)).map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>{checkInitials(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>}
              {userType === "Admin" && (
                <Select value={selectedCoachId.toString()} onValueChange={(value) => setSelectedCoachId(Number(value))}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Alla coacher" /></SelectTrigger>
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
            <Tabs defaultValue="narvaro">
              <TabsList className="mb-6">
                <TabsTrigger value="narvaro">Närvaro</TabsTrigger>
                <TabsTrigger value="schema">Schemalagda dagar</TabsTrigger>
                <TabsTrigger value="kontaktinfo">Kontaktinfo</TabsTrigger>
                <TabsTrigger value="larare">Lärare på kursen</TabsTrigger>
                <TabsTrigger value="progression">Progression</TabsTrigger>
                <TabsTrigger value="statistik">Statistik</TabsTrigger>
              </TabsList>
              <TabsContent value="narvaro">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-full"></div><span>Närvaro</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white-300 rounded-full border border-blue-500"></div><span>Ej närvarande</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div><span>Inställd lektion</span></div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button variant="outline" onClick={() => changeWeek(false)}>&#8592;</Button>
                  <span className="font-semibold">{week}</span>
                  <Button variant="outline" onClick={() => changeWeek(true)}>&#8594;</Button>
                </div>

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
                                disabled={userType === "Coach"}
                                onCheckedChange={() => {}}
                              />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="schema">
                <p className="text-sm text-muted-foreground mb-4">Du kan själv ändra deltagarens schema</p>
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
                          <Button variant={users.find((u) => u.id === selectedUserId)?.[field] ? "default" : "outline"} size="sm" onClick={() => {
                            if (!selectedUser) return;
                            const updated = { ...selectedUser, [field]: !selectedUser[field] };
                            setSelectedUser(updated);
                            handleUpdateUser(updated, false);
                          }}>{users.find((u) => u.id === selectedUserId)?.[field] ? "Ja" : "Nej"}</Button>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Eftermiddag</TableCell>
                      {(["scheduledMonPm", "scheduledTuePm", "scheduledWedPm", "scheduledThuPm"] as const).map((field) => (
                        <TableCell key={field}>
                          <Button variant={users.find((u) => u.id === selectedUserId)?.[field] ? "default" : "outline"} size="sm" onClick={() => {
                            if (!selectedUser) return;
                            const updated = { ...selectedUser, [field]: !selectedUser[field] };
                            setSelectedUser(updated);
                            handleUpdateUser(updated, false);
                          }}>{users.find((u) => u.id === selectedUserId)?.[field] ? "Ja" : "Nej"}</Button>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="larare">
                <p className="text-sm text-muted-foreground mb-4">Grön färg är den lärare som ni primärt kontaktar angående elevuppföljning.</p>
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
              </TabsContent>
              <TabsContent value="statistik">
                <p className="text-sm"><strong>Startdatum:</strong> {selectedUser?.startDate ? new Date(selectedUser.startDate).toLocaleDateString("sv-SE") : "Ej angivet"}</p>
                <p className="text-sm"><strong>Senaste närvarodag:</strong> {(() => {
                  const dates = attendance.filter((x) => x.userId === selectedUser.id).flatMap((a) => a.date);
                  if (dates.length === 0) return "Aldrig närvarat";
                  const latest = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
                  return new Date(latest).toLocaleDateString("sv-SE");
                })()}</p>
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
              </TabsContent>
              <TabsContent value="kontaktinfo">
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
              </TabsContent>
              <TabsContent value="progression">
              </TabsContent>
            </Tabs>
          )}

        </>
      )}
    </div>
  );
};

export default CoachAttendance;
