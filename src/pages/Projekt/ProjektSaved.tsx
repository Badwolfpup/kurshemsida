import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, Filter, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProjectHistory } from "@/hooks/useProjectHistory";
import { motion, AnimatePresence } from "framer-motion";
import imageMap from "@/assets/images/imagemap";

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

const PROJECT_TYPES = ["html", "html+css", "html+css+js"];

const renderList = (text: string | null) => {
  if (!text) return null;
  return (
    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
      {text.split("\n").filter(Boolean).map((line, i) => {
        const idx = line.search(/[a-zA-Z]/);
        return <li key={i}>{idx !== -1 ? line.slice(idx) : line}</li>;
      })}
    </ul>
  );
};

const ProjektSaved = () => {
  const { data: history = [], isLoading } = useProjectHistory();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCode, setShowCode] = useState<Record<string, boolean>>({});
  const previewRef = useRef<HTMLIFrameElement>(null);

  const filtered = useMemo(() => history.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (difficultyFilter !== "all" && p.difficulty !== parseInt(difficultyFilter)) return false;
    if (typeFilter !== "all" && p.techStack !== typeFilter) return false;
    return true;
  }), [history, search, difficultyFilter, typeFilter]);

  const getTypeColor = (type: string) => {
    const n = type.toLowerCase();
    return TYPE_COLORS[n] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const toggleCode = (key: string) => setShowCode((prev) => ({ ...prev, [key]: !prev[key] }));

  const getImage = (name: string): string => imageMap[name] ?? imageMap["default"];

  // Update preview iframe when expanded item changes
  const expandedProject = history.find((p) => p.id === expandedId);
  useEffect(() => {
    if (expandedProject && previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        const htmlWithImages = (expandedProject.solutionHtml || "")
          .replace(/\{image:(\w+)\}/g, (_: string, name: string) => getImage(name));
        doc.open();
        doc.write(`<html><head><style>${expandedProject.solutionCss || ""}</style></head><body style="background-color: #faf3e8;">${htmlWithImages}<script>${expandedProject.solutionJs || ""}<\/script></body></html>`);
        doc.close();
      }
    }
  }, [expandedId, expandedProject?.solutionHtml, expandedProject?.solutionCss, expandedProject?.solutionJs]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter toolbar */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Projekttyp</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Alla typer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla typer</SelectItem>
                {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Svårighetsgrad</label>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla nivåer</SelectItem>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} - {DIFFICULTY_LABELS[n]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Sök</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Sök titel..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{history.length === 0 ? "Du har inga sparade projekt ännu. Generera ett projekt under AI-generera!" : "Inga projekt matchar dina filter."}</p>
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
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-display font-semibold text-foreground">{project.title}</span>
                  <Badge className={`text-xs ${getTypeColor(project.techStack)}`}>{project.techStack.toUpperCase()}</Badge>
                  <Badge className={`text-xs ${DIFFICULTY_COLORS[project.difficulty] || DIFFICULTY_COLORS[1]}`}>
                    {DIFFICULTY_LABELS[project.difficulty] || "Mycket lätt"}
                  </Badge>
                  {project.isCompleted && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Avklarad</Badge>}
                </div>
                {expandedId === project.id ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
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
                      <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>

                      {project.learningGoals && (
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">Lärandemål</h3>
                          {renderList(project.learningGoals)}
                        </div>
                      )}
                      {project.userStories && (
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">User Stories</h3>
                          {renderList(project.userStories)}
                        </div>
                      )}
                      {project.designSpecs && (
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">Designspecifikationer</h3>
                          {renderList(project.designSpecs)}
                        </div>
                      )}
                      {project.assetsNeeded && (
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">Resurser</h3>
                          {renderList(project.assetsNeeded)}
                        </div>
                      )}
                      {project.starterHtml && (
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">Startkod</h3>
                          <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-64">{project.starterHtml}</pre>
                        </div>
                      )}
                      {project.bonusChallenges && (
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">Bonusutmaningar</h3>
                          {renderList(project.bonusChallenges)}
                        </div>
                      )}

                      {/* Live preview */}
                      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ minHeight: "400px" }}>
                        <div className="px-4 py-2 border-b border-border">
                          <h3 className="font-display font-semibold text-sm text-foreground">Live Preview</h3>
                        </div>
                        <iframe
                          ref={expandedId === project.id ? previewRef : undefined}
                          className="w-full bg-white"
                          style={{ height: "400px" }}
                          title="Live Preview"
                        />
                      </div>

                      {/* Code blocks */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground self-center mr-1">Visa kod:</span>
                        {project.solutionHtml && (
                          <Button size="sm" variant={showCode[`${project.id}-html`] ? "default" : "outline"} onClick={() => toggleCode(`${project.id}-html`)}>HTML</Button>
                        )}
                        {project.solutionCss && (
                          <Button size="sm" variant={showCode[`${project.id}-css`] ? "default" : "outline"} onClick={() => toggleCode(`${project.id}-css`)}>CSS</Button>
                        )}
                        {project.solutionJs && (
                          <Button size="sm" variant={showCode[`${project.id}-js`] ? "default" : "outline"} onClick={() => toggleCode(`${project.id}-js`)}>JavaScript</Button>
                        )}
                      </div>

                      {showCode[`${project.id}-html`] && project.solutionHtml && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">HTML</h4>
                          <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">{project.solutionHtml}</pre>
                        </div>
                      )}
                      {showCode[`${project.id}-css`] && project.solutionCss && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">CSS</h4>
                          <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">{project.solutionCss}</pre>
                        </div>
                      )}
                      {showCode[`${project.id}-js`] && project.solutionJs && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">JavaScript</h4>
                          <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">{project.solutionJs}</pre>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString("sv-SE")}
                      </p>
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
