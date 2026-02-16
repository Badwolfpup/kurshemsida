import { useState, useEffect } from "react";
import { Briefcase, FolderKanban, Dumbbell, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface Exercise { id: number; title: string; description: string; difficulty: number; exerciseType: string; }
interface Project { id: number; title: string; description: string; difficulty: number; projectType: string; }

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

const Portfolio = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const [exRes, projRes] = await Promise.all([
          fetch("/api/fetch-exercises", { credentials: "include" }),
          fetch("/api/fetch-projects", { credentials: "include" }),
        ]);
        if (exRes.ok) setExercises(await exRes.json());
        if (projRes.ok) setProjects(await projRes.json());
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const getTypeColor = (type: string) => {
    const n = type.toLowerCase().replace(/[^a-z]/g, "");
    return TYPE_COLORS[n] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  if (loading) return <div className="p-6 lg:p-10 max-w-6xl mx-auto"><div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></div>;
  if (!user) return <div className="p-6 lg:p-10 max-w-6xl mx-auto"><div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center"><Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Logga in för att se din portfolio.</p></div></div>;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Min portfolio</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-2xl shadow-card border border-border p-5 text-center">
          <Trophy className="h-7 w-7 text-yellow-500 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-foreground">{exercises.length + projects.length}</p>
          <p className="text-xs text-muted-foreground">Tillgängliga</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card border border-border p-5 text-center">
          <Dumbbell className="h-7 w-7 text-primary mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-foreground">{exercises.length}</p>
          <p className="text-xs text-muted-foreground">Övningar</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card border border-border p-5 text-center">
          <FolderKanban className="h-7 w-7 text-primary mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-foreground">{projects.length}</p>
          <p className="text-xs text-muted-foreground">Projekt</p>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FolderKanban className="h-5 w-5" /> Projekt
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground">{p.title}</h3>
                    {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge className={`text-xs ${getTypeColor(p.projectType)}`}>{p.projectType}</Badge>
                    <Badge className={`text-xs ${DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS[1]}`}>{DIFFICULTY_LABELS[p.difficulty] || "Nybörjare"}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {exercises.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5" /> Övningar
          </h2>
          <div className="flex flex-wrap gap-2">
            {exercises.map((ex) => (
              <Badge key={ex.id} className={`py-1.5 px-3 ${getTypeColor(ex.exerciseType)}`}>{ex.title}</Badge>
            ))}
          </div>
        </div>
      )}

      {exercises.length === 0 && projects.length === 0 && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Inga övningar eller projekt tillgängliga.</p>
          <p className="text-sm text-muted-foreground mt-1">Kontakta din coach för att få tilldelat material!</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
