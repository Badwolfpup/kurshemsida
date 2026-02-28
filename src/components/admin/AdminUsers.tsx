import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  useUsers,
  useAddUser,
  useUpdateUser,
  useUpdateActivityStatus,
  useDeleteUser,
} from '@/hooks/useUsers';
import type UserType from '@/Types/User';

const STUDENT_AUTH_LEVEL = 4;
const COACH_AUTH_LEVEL = 3;
const ADMIN_AUTH_LEVEL = 1;
const TEACHER_AUTH_LEVEL = 2;

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  startDate: '',
  course: '1',
  coachId: '__none__',
  contactId: '__none__',
};

type TabValue = 'admin' | 'larare' | 'coach' | 'deltagare';

function UserTable({
  rows,
  emptyLabel,
  onEdit,
  onToggle,
}: {
  rows: UserType[];
  emptyLabel: string;
  onEdit: (u: UserType) => void;
  onToggle: (id: number, active: boolean) => void;
}) {
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Namn</TableHead>
            <TableHead className="hidden sm:table-cell">E-post</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground py-8"
              >
                {emptyLabel}
              </TableCell>
            </TableRow>
          )}
          {rows.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">
                {u.firstName} {u.lastName}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {u.email || '—'}
              </TableCell>
              <TableCell>{u.telephone || '—'}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(u)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggle(u.id, u.isActive)}
                >
                  {u.isActive ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminUsers() {
  const { user } = useAuth();
  const role = user?.role;
  const { data: users = [], isLoading: loading } = useUsers();
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const toggleActivityMutation = useUpdateActivityStatus();
  const deleteUserMutation = useDeleteUser();
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('deltagare');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const coaches = useMemo(
    () => users.filter((u) => u.authLevel === COACH_AUTH_LEVEL),
    [users]
  );
  const admins = useMemo(
    () =>
      users.filter(
        (u) =>
          u.authLevel === ADMIN_AUTH_LEVEL || u.authLevel === TEACHER_AUTH_LEVEL
      ),
    [users]
  );
  const deltagare = useMemo(
    () => users.filter((u) => u.authLevel === STUDENT_AUTH_LEVEL),
    [users]
  );
  const filtered = deltagare.filter((p) =>
    showInactive ? !p.isActive : p.isActive
  );

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };
  const openEdit = (p: UserType) => {
    setEditId(p.id);
    setForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
      telephone: p.telephone || '',
      startDate: p.startDate
        ? new Date(p.startDate).toISOString().split('T')[0]
        : '',
      course: p.course?.toString() || '1',
      coachId: p.coachId?.toString() || '__none__',
      contactId: p.contactId?.toString() || '__none__',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.firstName || !form.lastName) {
      toast({
        title: 'Fel',
        description: 'Namn krävs',
        variant: 'destructive',
      });
      return;
    }
    try {
      if (editId) {
        await updateUserMutation.mutateAsync({
          id: editId,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          telephone: form.telephone || null,
          startDate: form.startDate ? new Date(form.startDate) : null,
          course: form.course ? parseInt(form.course) : null,
          coachId:
            form.coachId && form.coachId !== '__none__'
              ? parseInt(form.coachId)
              : null,
          contactId:
            form.contactId && form.contactId !== '__none__'
              ? parseInt(form.contactId)
              : null,
        });
        toast({
          title: 'Uppdaterad',
          description: 'Deltagaren har uppdaterats.',
        });
      } else {
        if (!form.email) {
          toast({
            title: 'Fel',
            description: 'E-post krävs för nya deltagare',
            variant: 'destructive',
          });
          return;
        }
        const authLevelMap: Record<TabValue, number> = {
          deltagare: STUDENT_AUTH_LEVEL,
          coach: COACH_AUTH_LEVEL,
          larare: TEACHER_AUTH_LEVEL,
          admin: ADMIN_AUTH_LEVEL,
        };
        await addUserMutation.mutateAsync({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          telephone: form.telephone || undefined,
          ...(activeTab === 'deltagare' && {
            startDate: form.startDate ? new Date(form.startDate) : null,
            course: form.course ? parseInt(form.course) : undefined,
            coachId:
              form.coachId && form.coachId !== '__none__'
                ? parseInt(form.coachId)
                : undefined,
            contactId:
              form.contactId && form.contactId !== '__none__'
                ? parseInt(form.contactId)
                : undefined,
          }),
          authLevel: authLevelMap[activeTab],
        });
        const typeLabel =
          activeTab === 'deltagare'
            ? 'Deltagaren'
            : activeTab === 'coach'
              ? 'Coachen'
              : activeTab === 'larare'
                ? 'Läraren'
                : 'Adminen';
        toast({
          title: 'Tillagd',
          description: `${typeLabel} har lagts till.`,
        });
      }
      setDialogOpen(false);
    } catch {
      toast({
        title: 'Fel',
        description: 'Något gick fel',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: number, active: boolean) => {
    try {
      await toggleActivityMutation.mutateAsync(id);
      toast({ title: active ? 'Inaktiverad' : 'Aktiverad' });
    } catch {
      toast({
        title: 'Fel',
        description: 'Kunde inte ändra status',
        variant: 'destructive',
      });
    }
  };

  const getCoachName = (id: number | null) => {
    if (!id) return '—';
    const c = coaches.find((c) => c.id === id);
    return c ? `${c.firstName} ${c.lastName}` : '—';
  };
  const getContactName = (id: number | null) => {
    if (!id) return '—';
    const a = admins.find((a) => a.id === id);
    return a ? `${a.firstName} ${a.lastName}` : '—';
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Lägg till{' '}
          {activeTab === 'deltagare'
            ? 'deltagare'
            : activeTab === 'coach'
              ? 'coach'
              : activeTab === 'larare'
                ? 'lärare'
                : 'admin'}
        </Button>
        <Button
          variant={showInactive ? 'default' : 'outline'}
          onClick={() => setShowInactive(!showInactive)}
          className="gap-2"
        >
          {showInactive ? (
            <UserX className="h-4 w-4" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
          {showInactive ? 'Visa aktiva' : 'Se inaktiva'}
        </Button>
        <Badge variant="secondary">
          {filtered.length} {showInactive ? 'inaktiva' : 'aktiva'} deltagare
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList className="mb-4">
          {role === 'Admin' && <TabsTrigger value="admin">Admin</TabsTrigger>}
          <TabsTrigger value="larare">Lärare</TabsTrigger>
          <TabsTrigger value="coach">Coach</TabsTrigger>
          <TabsTrigger value="deltagare">Deltagare</TabsTrigger>
        </TabsList>

        {/* Admin tab */}
        {role === 'Admin' && (
          <TabsContent value="admin">
            <UserTable
              rows={users.filter((u) => u.authLevel === ADMIN_AUTH_LEVEL)}
              emptyLabel="Inga admins."
              onEdit={openEdit}
              onToggle={toggleActive}
            />
          </TabsContent>
        )}

        {/* Lärare tab */}
        <TabsContent value="larare">
          <UserTable
            rows={users.filter((u) => u.authLevel === TEACHER_AUTH_LEVEL)}
            emptyLabel="Inga lärare."
            onEdit={openEdit}
            onToggle={toggleActive}
          />
        </TabsContent>

        {/* Coach tab */}
        <TabsContent value="coach">
          <UserTable
            rows={users.filter((u) => u.authLevel === COACH_AUTH_LEVEL)}
            emptyLabel="Inga coacher."
            onEdit={openEdit}
            onToggle={toggleActive}
          />
        </TabsContent>

        {/* Deltagare tab */}
        <TabsContent value="deltagare">
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead className="hidden sm:table-cell">E-post</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Startdatum
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Spår</TableHead>
                  <TableHead>Jobbcoach</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      Inga {showInactive ? 'inaktiva' : 'aktiva'} deltagare.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.firstName} {p.lastName}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {p.email || '—'}
                    </TableCell>
                    <TableCell>{p.telephone || '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {p.startDate
                        ? new Date(p.startDate).toLocaleDateString('sv-SE')
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">
                        {p.course ? `Spår ${p.course}` : '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getCoachName(p.coachId)}</TableCell>
                    <TableCell>{getContactName(p.contactId)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {showInactive ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUserMutation.mutate({ id: p.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(p.id, p.isActive)}
                      >
                        {p.isActive ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          style={{
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? 'Redigera' : 'Lägg till'}{' '}
              {activeTab === 'deltagare'
                ? 'deltagare'
                : activeTab === 'coach'
                  ? 'coach'
                  : activeTab === 'larare'
                    ? 'lärare'
                    : 'admin'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="firstName">Förnamn</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Efternamn</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="telephone">Telefon</Label>
              <Input
                id="telephone"
                value={form.telephone}
                onChange={(e) =>
                  setForm({ ...form, telephone: e.target.value })
                }
              />
            </div>
            {activeTab === 'deltagare' && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="startDate">Startdatum</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Spår</Label>
                  <Select
                    value={form.course}
                    onValueChange={(v) => setForm({ ...form, course: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj spår" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Spår 1</SelectItem>
                      <SelectItem value="2">Spår 2</SelectItem>
                      <SelectItem value="3">Spår 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Jobbcoach</Label>
                  <Select
                    value={form.coachId}
                    onValueChange={(v) => setForm({ ...form, coachId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj jobbcoach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Ingen</SelectItem>
                      {coaches.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.firstName} {c.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Kontaktlärare</Label>
                  <Select
                    value={form.contactId}
                    onValueChange={(v) => setForm({ ...form, contactId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kontaktlärare" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Ingen</SelectItem>
                      {admins.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                          {a.firstName} {a.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Avbryt
            </Button>
            <Button
              onClick={save}
              disabled={
                addUserMutation.isPending || updateUserMutation.isPending
              }
            >
              {editId ? 'Spara' : 'Lägg till'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
