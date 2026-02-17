import { useState, useEffect, useMemo } from "react";
import { Dumbbell, ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface Exercise {
  id: number;
  title: string;
  description: string;
  javascript: string;
  expectedResult: string;
  difficulty: number;
  exerciseType: string;
  clues: string[];
  goodToKnow: string;
}

const DIFFICULTY_LABELS: Record<number, string> = { 1: "Nybörjare", 2: "Medel", 3: "Avancerad" };
const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  3: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
const TYPE_COLORS: Record<string, string> = {
  html: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  css: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  javascript: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  react: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  python: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  csharp: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const OvningarSaved = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const response = await fetch("/api/fetch-exercises", { credentials: "include" });
        if (response.ok) setExercises(await response.json());
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const getTypeColor = (type: string) => {
    const n = type.toLowerCase().replace(/[^a-z]/g, "");
    return TYPE_COLORS[n] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const exerciseTypes = useMemo(() => Array.from(new Set(exercises.map((e) => e.exerciseType))).sort(), [exercises]);

  const filtered = useMemo(() => exercises.filter((ex) => {
    if (search && !ex.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (difficultyFilter !== "all" && ex.difficulty !== parseInt(difficultyFilter)) return false;
    if (typeFilter !== "all" && ex.exerciseType !== typeFilter) return false;
    return true;
  }), [exercises, search, difficultyFilter, typeFilter]);

  if (loading) return <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!user) return <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center"><Dumbbell className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Logga in för att se övningar.</p></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sök övning..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Typ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla typer</SelectItem>
            {exerciseTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Svårighet" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla nivåer</SelectItem>
            <SelectItem value="1">Nybörjare</SelectItem>
            <SelectItem value="2">Medel</SelectItem>
            <SelectItem value="3">Avancerad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{exercises.length === 0 ? "Inga övningar tillgängliga." : "Inga övningar matchar dina filter."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ex) => (
            <div key={ex.id} className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <Button variant="ghost" className="w-full flex items-center justify-between p-5 text-left h-auto hover:bg-muted/50" onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}>
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold text-foreground">{ex.title}</span>
                  <Badge className={`text-xs ${getTypeColor(ex.exerciseType)}`}>{ex.exerciseType}</Badge>
                  <Badge className={`text-xs ${DIFFICULTY_COLORS[ex.difficulty] || DIFFICULTY_COLORS[1]}`}>{DIFFICULTY_LABELS[ex.difficulty] || "Nybörjare"}</Badge>
                </div>
                {expandedId === ex.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </Button>
              <AnimatePresence>
                {expandedId === ex.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="p-5 pt-0 border-t border-border">
                      <p className="text-muted-foreground mb-4">{ex.description}</p>
                      {ex.goodToKnow && <div className="mb-4"><h4 className="font-semibold text-sm text-foreground mb-1">Bra att veta:</h4><p className="text-sm text-muted-foreground">{ex.goodToKnow}</p></div>}
                      {ex.clues && ex.clues.length > 0 && <div className="mb-4"><h4 className="font-semibold text-sm text-foreground mb-1">Ledtrådar:</h4><ul className="list-disc list-inside text-sm text-muted-foreground">{ex.clues.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
                      <div className="bg-muted rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Startkod:</h4>
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">{ex.javascript}</pre>
                      </div>
                      {ex.expectedResult && (
                        <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <h4 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-2">Förväntat resultat:</h4>
                          <pre className="text-sm text-green-600 dark:text-green-300 whitespace-pre-wrap font-mono">{ex.expectedResult}</pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OvningarSaved;
