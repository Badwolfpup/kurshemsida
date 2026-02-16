import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useExercises, useAddExercise, useUpdateExercise, useDeleteExercise } from "@/hooks/useExercises";
import type ExerciseType from "@/Types/ExerciseType";

const TYPE_LABELS: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  javascript: "",
  expectedResult: "",
  difficulty: 1,
  exerciseType: "html",
  clues: "",
  goodToKnow: "",
};

export default function AdminExercises() {
  const { data: exercises = [], isLoading } = useExercises();
  const addExercise = useAddExercise();
  const updateExercise = useUpdateExercise();
  const deleteExercise = useDeleteExercise();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setDialogOpen(true); };

  const openEdit = (ex: ExerciseType) => {
    setEditId(ex.id);
    setForm({
      title: ex.title,
      description: ex.description,
      javascript: ex.javascript,
      expectedResult: ex.expectedResult,
      difficulty: ex.difficulty,
      exerciseType: ex.exerciseType,
      clues: (ex.clues || []).join("\n"),
      goodToKnow: ex.goodToKnow || "",
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.title.trim()) return;
    const cluesArr = form.clues.split("\n").map(s => s.trim()).filter(Boolean);
    if (editId !== null) {
      updateExercise.mutate({ id: editId, title: form.title, description: form.description, javascript: form.javascript, expectedResult: form.expectedResult, difficulty: form.difficulty, exerciseType: form.exerciseType, clues: cluesArr, goodToKnow: form.goodToKnow }, {
        onSuccess: () => { toast({ title: "Övning uppdaterad" }); setDialogOpen(false); },
      });
    } else {
      addExercise.mutate({ title: form.title, description: form.description, javascript: form.javascript, expectedResult: form.expectedResult, difficulty: form.difficulty, exerciseType: form.exerciseType, clues: cluesArr, goodToKnow: form.goodToKnow }, {
        onSuccess: () => { toast({ title: "Övning skapad" }); setDialogOpen(false); },
      });
    }
  };

  const remove = (ex: ExerciseType) => {
    deleteExercise.mutate({ id: ex.id, title: ex.title }, {
      onSuccess: () => toast({ title: "Övning borttagen" }),
    });
  };

  const filtered = exercises.filter((ex) => {
    if (filterType !== "all" && ex.exerciseType !== filterType) return false;
    if (search && !ex.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) return <p className="text-muted-foreground p-4">Laddar...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Övningar</h2>
          <p className="text-sm text-muted-foreground">{exercises.length} övningar totalt</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-2"><Plus className="h-4 w-4" /> Ny övning</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sök övning..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-[180px]" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Alla typer</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Inga övningar hittades</p>}
        {filtered.map((ex) => (
          <div key={ex.id} className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 cursor-pointer" onClick={() => { const s = new Set(expanded); s.has(ex.id) ? s.delete(ex.id) : s.add(ex.id); setExpanded(s); }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{ex.title}</span>
                  <Badge variant="outline" className="text-xs">{TYPE_LABELS[ex.exerciseType] || ex.exerciseType}</Badge>
                  <Badge variant="secondary" className="text-xs">Nivå {ex.difficulty}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{ex.description}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(ex)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(ex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                {expanded.has(ex.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            {expanded.has(ex.id) && (
              <div className="mt-3 space-y-2 text-sm border-t pt-3">
                {ex.javascript && <div><strong>Startkod:</strong><pre className="bg-muted rounded p-2 text-xs overflow-x-auto mt-1">{ex.javascript}</pre></div>}
                {ex.expectedResult && <div><strong>Förväntat resultat:</strong><p className="text-muted-foreground">{ex.expectedResult}</p></div>}
                {ex.clues?.length > 0 && <div><strong>Ledtrådar:</strong><ol className="list-decimal ml-4 text-muted-foreground mt-1 space-y-1">{ex.clues.map((c, i) => <li key={i}>{c}</li>)}</ol></div>}
                {ex.goodToKnow && <div><strong>Bra att veta:</strong><p className="text-muted-foreground whitespace-pre-wrap">{ex.goodToKnow}</p></div>}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId !== null ? "Redigera övning" : "Skapa ny övning"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Titel</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Övningstyp</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.exerciseType} onChange={(e) => setForm({ ...form, exerciseType: e.target.value })}>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <Label>Svårighetsgrad (1-5)</Label>
                <Input type="number" min={1} max={5} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div><Label>Beskrivning</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Startkod (JavaScript)</Label><Textarea rows={6} className="font-mono text-xs" value={form.javascript} onChange={(e) => setForm({ ...form, javascript: e.target.value })} /></div>
            <div><Label>Förväntat resultat</Label><Textarea rows={2} value={form.expectedResult} onChange={(e) => setForm({ ...form, expectedResult: e.target.value })} /></div>
            <div><Label>Bra att veta (förklaring)</Label><Textarea rows={3} value={form.goodToKnow} onChange={(e) => setForm({ ...form, goodToKnow: e.target.value })} placeholder="Förklara hur lösningen fungerar..." /></div>
            <div><Label>Ledtrådar (en per rad)</Label><Textarea rows={4} value={form.clues} onChange={(e) => setForm({ ...form, clues: e.target.value })} placeholder="Ledtråd 1&#10;Ledtråd 2&#10;Ledtråd 3" /></div>
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
