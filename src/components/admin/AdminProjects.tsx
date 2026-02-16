import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useAddProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import type ProjectType from "@/Types/ProjectType";

const TYPE_LABELS: Record<string, string> = {
  html: "HTML",
  "html+css": "HTML + CSS",
  "html+css+js": "HTML + CSS + JS",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  html: "",
  css: "",
  javascript: "",
  difficulty: 1,
  projectType: "html+css",
};

export default function AdminProjects() {
  const { data: projects = [], isLoading } = useProjects();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProj = useDeleteProject();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setDialogOpen(true); };

  const openEdit = (p: ProjectType) => {
    setEditId(p.id);
    setForm({ title: p.title, description: p.description, html: p.html, css: p.css, javascript: p.javascript, difficulty: p.difficulty, projectType: p.projectType });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.title.trim()) return;
    if (editId !== null) {
      updateProject.mutate({ id: editId, ...form }, {
        onSuccess: () => { toast({ title: "Projekt uppdaterat" }); setDialogOpen(false); },
      });
    } else {
      addProject.mutate(form, {
        onSuccess: () => { toast({ title: "Projekt skapat" }); setDialogOpen(false); },
      });
    }
  };

  const remove = (p: ProjectType) => {
    deleteProj.mutate({ id: p.id, title: p.title }, {
      onSuccess: () => toast({ title: "Projekt borttaget" }),
    });
  };

  const filtered = projects.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <p className="text-muted-foreground p-4">Laddar...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Projekt</h2>
          <p className="text-sm text-muted-foreground">{projects.length} projekt totalt</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nytt projekt</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Sök projekt..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Inga projekt hittades</p>}
        {filtered.map((p) => (
          <div key={p.id} className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 cursor-pointer" onClick={() => { const s = new Set(expanded); s.has(p.id) ? s.delete(p.id) : s.add(p.id); setExpanded(s); }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{p.title}</span>
                  <Badge variant="outline" className="text-xs">{TYPE_LABELS[p.projectType] || p.projectType}</Badge>
                  <Badge variant="secondary" className="text-xs">Nivå {p.difficulty}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                {expanded.has(p.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            {expanded.has(p.id) && (
              <div className="mt-3 space-y-2 text-sm border-t pt-3">
                {p.html && <div><strong>HTML:</strong><pre className="bg-muted rounded p-2 text-xs overflow-x-auto mt-1">{p.html}</pre></div>}
                {p.css && <div><strong>CSS:</strong><pre className="bg-muted rounded p-2 text-xs overflow-x-auto mt-1">{p.css}</pre></div>}
                {p.javascript && <div><strong>JavaScript:</strong><pre className="bg-muted rounded p-2 text-xs overflow-x-auto mt-1">{p.javascript}</pre></div>}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId !== null ? "Redigera projekt" : "Skapa nytt projekt"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Titel</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Projekttyp</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })}>
                  <option value="html">HTML</option>
                  <option value="html+css">HTML + CSS</option>
                  <option value="html+css+js">HTML + CSS + JS</option>
                </select>
              </div>
              <div>
                <Label>Svårighetsgrad (1-5)</Label>
                <Input type="number" min={1} max={5} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div><Label>Beskrivning</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>HTML</Label><Textarea rows={6} className="font-mono text-xs" value={form.html} onChange={(e) => setForm({ ...form, html: e.target.value })} /></div>
            <div><Label>CSS</Label><Textarea rows={6} className="font-mono text-xs" value={form.css} onChange={(e) => setForm({ ...form, css: e.target.value })} /></div>
            <div><Label>JavaScript</Label><Textarea rows={6} className="font-mono text-xs" value={form.javascript} onChange={(e) => setForm({ ...form, javascript: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Avbryt</Button>
            <Button onClick={save} disabled={!form.title.trim()}>{editId !== null ? "Spara" : "Skapa"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
