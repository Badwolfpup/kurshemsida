import { useMemo, useState } from "react";
import { Laptop, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import HelpDialog from "@/components/HelpDialog";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import {
  useComputers,
  useComputerAssignments,
  useAddComputer,
  useRemoveComputer,
  useSetComputerOwner,
  useAssignComputerSlot,
  useClearComputerSlot,
} from "@/hooks/useComputers";
import type UserType from "@/Types/User";
import type { Computer, ComputerAssignment } from "@/Types/Computer";

const DAYS = [
  { value: 1, label: "Mån" },
  { value: 2, label: "Tis" },
  { value: 3, label: "Ons" },
  { value: 4, label: "Tor" },
];
const PERIODS = [
  { key: "am", label: "FM" },
  { key: "pm", label: "EM" },
];
const SHARED = "_shared";
const NONE = "_none";

function ComputerCard({
  computer,
  computers,
  assignments,
  students,
  staff,
}: {
  computer: Computer;
  computers: Computer[];
  assignments: ComputerAssignment[];
  students: UserType[];
  // Admins/teachers may also borrow a computer, and aren't limited to one — so
  // they're always shown (never filtered by the one-per-student availability rule).
  staff: UserType[];
}) {
  const { toast } = useToast();
  const removeComputer = useRemoveComputer();
  const setOwner = useSetComputerOwner();
  const assignSlot = useAssignComputerSlot();
  const clearSlot = useClearComputerSlot();

  // A student belongs to at most one computer — hide anyone already assigned
  // (as owner or in a slot) to a *different* computer from this computer's pickers.
  const availableStudents = useMemo(() => {
    const takenByOthers = new Set<number>();
    for (const c of computers) {
      if (c.id !== computer.id && c.ownerStudentId != null) takenByOthers.add(c.ownerStudentId);
    }
    for (const a of assignments) {
      if (a.computerId !== computer.id) takenByOthers.add(a.studentId);
    }
    return students.filter((s) => !takenByOthers.has(s.id));
  }, [computers, assignments, students, computer.id]);

  const personName = (id: number) => {
    const p = students.find((u) => u.id === id) ?? staff.find((u) => u.id === id);
    return p ? `${p.firstName} ${p.lastName}` : "Okänd";
  };

  // Separator + grouped staff entries, appended below the students in every picker.
  const staffOptions =
    staff.length > 0 ? (
      <SelectGroup>
        <SelectSeparator />
        <SelectLabel>Lärare &amp; admin</SelectLabel>
        {staff.map((s) => (
          <SelectItem key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName}</SelectItem>
        ))}
      </SelectGroup>
    ) : null;

  const slotStudentId = (dayOfWeek: number, period: string): number | null =>
    assignments.find((a) => a.computerId === computer.id && a.dayOfWeek === dayOfWeek && a.period === period)?.studentId ?? null;

  const handleOwnerChange = (value: string) => {
    setOwner.mutate({
      computerId: computer.id,
      studentId: value === SHARED ? null : Number(value),
      takesHome: value === SHARED ? false : computer.takesHome,
    });
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Dator {computer.number}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeComputer.mutate(computer.id, { onSuccess: () => toast({ title: "Dator borttagen" }) })}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Ägare</Label>
          <Select value={computer.ownerStudentId?.toString() ?? SHARED} onValueChange={handleOwnerChange}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={SHARED}>Delad (ingen ägare)</SelectItem>
              {availableStudents.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName}</SelectItem>
              ))}
              {staffOptions}
            </SelectContent>
          </Select>
        </div>
        {computer.ownerStudentId != null && (
          <label className="flex items-center gap-2 text-sm cursor-pointer mt-5">
            <Checkbox
              checked={computer.takesHome}
              onCheckedChange={(c) =>
                setOwner.mutate({ computerId: computer.id, studentId: computer.ownerStudentId, takesHome: !!c })
              }
            />
            Tar hem
          </label>
        )}
      </div>

      {computer.ownerStudentId != null ? (
        <p className="text-sm text-muted-foreground">
          Egen dator för {personName(computer.ownerStudentId)}
          {computer.takesHome ? " — tas med hem" : ""}.
        </p>
      ) : (
        <div className="overflow-x-auto">
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
                  {DAYS.map((d) => {
                    const current = slotStudentId(d.value, period.key);
                    return (
                      <TableCell key={d.value} className="text-center">
                        <Select
                          value={current?.toString() ?? NONE}
                          onValueChange={(v) => {
                            if (v === NONE) {
                              clearSlot.mutate({ computerId: computer.id, dayOfWeek: d.value, period: period.key });
                            } else {
                              assignSlot.mutate({ computerId: computer.id, dayOfWeek: d.value, period: period.key, studentId: Number(v) });
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs w-32"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>—</SelectItem>
                            {availableStudents.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName}</SelectItem>
                            ))}
                            {staffOptions}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

export default function Datorer() {
  const { toast } = useToast();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: computers = [], isLoading: computersLoading } = useComputers();
  const { data: assignments = [] } = useComputerAssignments();
  const addComputer = useAddComputer();
  const [newNumber, setNewNumber] = useState("");

  const students = useMemo(
    () =>
      users
        .filter((u) => u.authLevel === 4 && u.isActive)
        .sort((a, b) => a.firstName.localeCompare(b.firstName, "sv")),
    [users]
  );

  // Admins (authLevel 1) and teachers (authLevel 2) — borrowable too, listed below a separator.
  const staff = useMemo(
    () =>
      users
        .filter((u) => (u.authLevel === 1 || u.authLevel === 2) && u.isActive)
        .sort((a, b) => a.firstName.localeCompare(b.firstName, "sv")),
    [users]
  );

  const sharedComputers = useMemo(() => computers.filter((c) => c.ownerStudentId == null), [computers]);
  const ownedComputers = useMemo(() => computers.filter((c) => c.ownerStudentId != null), [computers]);

  const handleAdd = () => {
    const num = parseInt(newNumber, 10);
    if (!num || num < 1) {
      toast({ title: "Ange ett giltigt datornummer", variant: "destructive" });
      return;
    }
    addComputer.mutate(num, {
      onSuccess: () => {
        toast({ title: "Dator tillagd" });
        setNewNumber("");
      },
      onError: () => toast({ title: "Kunde inte lägga till", description: "Numret kanske redan finns.", variant: "destructive" }),
    });
  };

  if (usersLoading || computersLoading) {
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
          <Laptop className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Datorer</h1>
        <HelpDialog helpKey="datorer" />
      </div>

      <div className="flex items-end gap-2 mb-6">
        <div className="space-y-1">
          <Label htmlFor="new-computer">Nytt datornummer</Label>
          <Input
            id="new-computer"
            type="number"
            min={1}
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            className="w-40"
          />
        </div>
        <Button onClick={handleAdd} disabled={addComputer.isPending} className="gap-2">
          <Plus className="h-4 w-4" /> Lägg till
        </Button>
      </div>

      {computers.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">Inga datorer tillagda ännu.</Card>
      ) : (
        <Tabs defaultValue="shared">
          <TabsList>
            <TabsTrigger value="shared">Delade datorer ({sharedComputers.length})</TabsTrigger>
            <TabsTrigger value="owned">Egen dator ({ownedComputers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="shared" className="mt-4">
            {sharedComputers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">Inga delade datorer.</Card>
            ) : (
              <div className="space-y-4">
                {sharedComputers.map((c) => (
                  <ComputerCard key={c.id} computer={c} computers={computers} assignments={assignments} students={students} staff={staff} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="owned" className="mt-4">
            {ownedComputers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">Inga egna datorer.</Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownedComputers.map((c) => (
                  <ComputerCard key={c.id} computer={c} computers={computers} assignments={assignments} students={students} staff={staff} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
