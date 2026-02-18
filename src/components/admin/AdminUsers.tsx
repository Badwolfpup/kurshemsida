import { useState, useMemo } from "react";
import { Plus, Pencil, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUsers, useAddUser, useUpdateUser, useUpdateActivityStatus } from "@/hooks/useUsers";
import { useUserRole } from "@/hooks/useUserRole";
import type UserType from "@/Types/User";

const STUDENT_AUTH_LEVEL = 4;
const COACH_AUTH_LEVEL = 3;
const ADMIN_AUTH_LEVEL = 1;
const TEACHER_AUTH_LEVEL = 2;

const emptyForm = { firstName: "", lastName: "", email: "", telephone: "", startDate: "", course: "1", coachId: "__none__", contactId: "__none__" };

export default function AdminUsers() {
  const { data: users = [], isLoading: loading } = useUsers();
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const toggleActivityMutation = useUpdateActivityStatus();
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const { role } = useUserRole();
  const [activeTab, setActiveTab] = useState<"admin" | "larare" | "coach" | "deltagare">("deltagare");

  const adminUsers = useMemo(() => users.filter((u) => u.authLevel === ADMIN_AUTH_LEVEL), [users]);
  const teachers = useMemo(() => users.filter((u) => u.authLevel === TEACHER_AUTH_LEVEL), [users]);
  const coaches = useMemo(() => users.filter((u) => u.authLevel === COACH_AUTH_LEVEL), [users]);
  const admins = useMemo(() => users.filter((u) => u.authLevel === ADMIN_AUTH_LEVEL || u.authLevel === TEACHER_AUTH_LEVEL), [users]);
  const deltagare = useMemo(() => users.filter((u) => u.authLevel === STUDENT_AUTH_LEVEL), [users]);

  const tabUsers = useMemo(() => {
    switch (activeTab) {
      case "admin":     return adminUsers;
      case "larare":    return teachers;
      case "coach":     return coaches;
      case "deltagare": return deltagare.filter((p) => showInactive ? !p.isActive : p.isActive);
    }
  }, [activeTab, adminUsers, teachers, coaches, deltagare, showInactive]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: UserType) => {
    setEditId(p.id);
    setForm({
      firstName: p.firstName || "", lastName: p.lastName || "", email: p.email || "",
      telephone: p.telephone || "", startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
      course: p.course?.toString() || "1", coachId: p.coachId?.toString() || "__none__", contactId: p.contactId?.toString() || "__none__",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.firstName || !form.lastName) { toast({ title: "Fel", description: "Namn krävs", variant: "destructive" }); return; }
    try {
      if (editId) {
        await updateUserMutation.mutateAsync({
          id: editId, firstName: form.firstName, lastName: form.lastName, email: form.email || undefined,
          telephone: form.telephone || null, startDate: form.startDate ? new Date(form.startDate) : null,
          course: form.course ? parseInt(form.course) : null,
          coachId: form.coachId && form.coachId !== "__none__" ? parseInt(form.coachId) : null,
          contactId: form.contactId && form.contactId !== "__none__" ? parseInt(form.contactId) : null,
        });
        toast({ title: "Uppdaterad", description: "Deltagaren har uppdaterats." });
      } else {
        if (!form.email) { toast({ title: "Fel", description: "E-post krävs för nya deltagare", variant: "destructive" }); return; }
        await addUserMutation.mutateAsync({
          firstName: form.firstName, lastName: form.lastName, email: form.email,
          telephone: form.telephone || undefined, startDate: form.startDate ? new Date(form.startDate) : null,
          course: form.course ? parseInt(form.course) : undefined,
          coachId: form.coachId && form.coachId !== "__none__" ? parseInt(form.coachId) : undefined,
          contactId: form.contactId && form.contactId !== "__none__" ? parseInt(form.contactId) : undefined,
          authLevel: STUDENT_AUTH_LEVEL,
        });
        toast({ title: "Tillagd", description: "Deltagaren har lagts till." });
      }
      setDialogOpen(false);
    } catch { toast({ title: "Fel", description: "Något gick fel", variant: "destructive" }); }
  };

  const toggleActive = async (id: number, active: boolean) => {
    try { await toggleActivityMutation.mutateAsync(id); toast({ title: active ? "Inaktiverad" : "Aktiverad" }); }
    catch { toast({ title: "Fel", description: "Kunde inte ändra status", variant: "destructive" }); }
  };

  const getCoachName = (id: number | null) => { if (!id) return "—"; const c = coaches.find((c) => c.id === id); return c ? `${c.firstName} ${c.lastName}` : "—"; };
  const getContactName = (id: number | null) => { if (!id) return "—"; const a = admins.find((a) => a.id === id); return a ? `${a.firstName} ${a.lastName}` : "—"; };

  if (loading) return <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Lägg till deltagare</Button>
        {activeTab === "deltagare" && (
          <>
            <Button variant={showInactive ? "default" : "outline"} onClick={() => setShowInactive(!showInactive)} className="gap-2">
              {showInactive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              {showInactive ? "Visa aktiva" : "Se inaktiva"}
            </Button>
            <Badge variant="secondary">{tabUsers.length} {showInactive ? "inaktiva" : "aktiva"} deltagare</Badge>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-4">
          {role === "Admin" && <TabsTrigger value="admin">Admin</TabsTrigger>}
          <TabsTrigger value="larare">Lärare</TabsTrigger>
          <TabsTrigger value="coach">Coach</TabsTrigger>
          <TabsTrigger value="deltagare">Deltagare</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead><TableHead>E-post</TableHead><TableHead>Telefon</TableHead>
              <TableHead>Startdatum</TableHead><TableHead>Spår</TableHead><TableHead>Jobbcoach</TableHead>
              <TableHead>Kontakt</TableHead><TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabUsers.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Inga användare.</TableCell></TableRow>}
            {tabUsers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.firstName} {p.lastName}</TableCell>
                <TableCell>{p.email || "—"}</TableCell>
                <TableCell>{p.telephone || "—"}</TableCell>
                <TableCell>{p.startDate ? new Date(p.startDate).toLocaleDateString("sv-SE") : "—"}</TableCell>
                <TableCell><Badge variant="outline">{p.course ? `Spår ${p.course}` : "—"}</Badge></TableCell>
                <TableCell>{getCoachName(p.coachId)}</TableCell>
                <TableCell>{getContactName(p.contactId)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(p.id, p.isActive)}>{p.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Redigera deltagare" : "Lägg till deltagare"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label htmlFor="firstName">Förnamn</Label><Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="lastName">Efternamn</Label><Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label htmlFor="email">E-post</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="telephone">Telefon</Label><Input id="telephone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="startDate">Startdatum</Label><Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Spår</Label><Select value={form.course} onValueChange={(v) => setForm({ ...form, course: v })}><SelectTrigger><SelectValue placeholder="Välj spår" /></SelectTrigger><SelectContent><SelectItem value="1">Spår 1</SelectItem><SelectItem value="2">Spår 2</SelectItem><SelectItem value="3">Spår 3</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label>Jobbcoach</Label><Select value={form.coachId} onValueChange={(v) => setForm({ ...form, coachId: v })}><SelectTrigger><SelectValue placeholder="Välj jobbcoach" /></SelectTrigger><SelectContent><SelectItem value="__none__">Ingen</SelectItem>{coaches.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label>Kontaktlärare</Label><Select value={form.contactId} onValueChange={(v) => setForm({ ...form, contactId: v })}><SelectTrigger><SelectValue placeholder="Välj kontaktlärare" /></SelectTrigger><SelectContent><SelectItem value="__none__">Ingen</SelectItem>{admins.map((a) => <SelectItem key={a.id} value={a.id.toString()}>{a.firstName} {a.lastName}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Avbryt</Button>
            <Button onClick={save} disabled={addUserMutation.isPending || updateUserMutation.isPending}>{editId ? "Spara" : "Lägg till"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
