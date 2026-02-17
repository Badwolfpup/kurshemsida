import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Search, Filter, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { motion, AnimatePresence } from "framer-motion";

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Mycket lätt", 2: "Lätt", 3: "Medel", 4: "Svår", 5: "Mycket svår",
};
const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  4: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  5: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
const TYPE_COLORS: Record<string, string> = {
  html: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "html+css": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "html+css+js": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const ProjektSaved = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCode, setShowCode] = useState<Record<string, boolean>>({});

  const projectTypes = useMemo(
    () => Array.from(new Set(projects.map((p) => p.projectType))).filter(Boolean).sort(),
    [projects]
  );

  const filtered = useMemo(() => projects.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (difficultyFilter !== "all" && p.difficulty !== parseInt(difficultyFilter)) return false;
    if (typeFilter !== "all" && p.projectType !== typeFilter) return false;
    return true;
  }), [projects, search, difficultyFilter, typeFilter]);

  const getTypeColor = (type: string) => {
    const n = type.toLowerCase();
    return TYPE_COLORS[n] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const toggleCode = (key: string) => setShowCode((prev) => ({ ...prev, [key]: !prev[key] }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sök projekt..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Typ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla typer</SelectItem>
            {projectTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svårighet" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla nivåer</SelectItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} - {DIFFICULTY_LABELS[n]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{projects.length === 0 ? "Inga sparade projekt." : "Inga projekt matchar dina filter."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <div key={project.id} className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-5 text-left h-auto hover:bg-muted/50"
                onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold text-foreground">{project.title}</span>
                  {project.projectType && (
                    <Badge className={`text-xs ${getTypeColor(project.projectType)}`}>{project.projectType}</Badge>
                  )}
                  <Badge className={`text-xs ${DIFFICULTY_COLORS[project.difficulty] || DIFFICULTY_COLORS[1]}`}>
                    {DIFFICULTY_LABELS[project.difficulty] || "Mycket lätt"}
                  </Badge>
                </div>
                {expandedId === project.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </Button>
              <AnimatePresence>
                {expandedId === project.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 border-t border-border space-y-4">
                      <p className="text-muted-foreground">{project.description}</p>

                      {/* Code blocks */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground self-center mr-1">Visa kod:</span>
                        {project.html && (
                          <Button size="sm" variant={showCode[`${project.id}-html`] ? "default" : "outline"} onClick={() => toggleCode(`${project.id}-html`)}>HTML</Button>
                        )}
                        {project.css && (
                          <Button size="sm" variant={showCode[`${project.id}-css`] ? "default" : "outline"} onClick={() => toggleCode(`${project.id}-css`)}>CSS</Button>
                        )}
                        {project.javascript && (
                          <Button size="sm" variant={showCode[`${project.id}-js`] ? "default" : "outline"} onClick={() => toggleCode(`${project.id}-js`)}>JavaScript</Button>
                        )}
                      </div>

                      {showCode[`${project.id}-html`] && project.html && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">HTML</h4>
                          <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">{project.html}</pre>
                        </div>
                      )}
                      {showCode[`${project.id}-css`] && project.css && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">CSS</h4>
                          <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">{project.css}</pre>
                        </div>
                      )}
                      {showCode[`${project.id}-js`] && project.javascript && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">JavaScript</h4>
                          <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">{project.javascript}</pre>
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

export default ProjektSaved;
