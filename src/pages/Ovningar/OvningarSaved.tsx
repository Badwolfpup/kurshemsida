import { useState, useMemo } from "react";
import { Dumbbell, ChevronDown, ChevronUp, Filter, Search, Play, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import { parseAsserts, runTests } from "@/lib/exerciseTestRunner";
import { motion, AnimatePresence } from "framer-motion";
import type { ExerciseHistoryItem } from "@/api/ExerciseService";

const ALL_TOPICS = [
  "Variables and DataTypes", "Strings", "Operators", "Conditionals", "Loops",
  "Functions", "Arrays", "Objects", "Events",
];

const LANGUAGES = ["JavaScript"];

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

const OvningarSaved = () => {
  const { data: history = [], isLoading } = useExerciseHistory();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [userCodes, setUserCodes] = useState<Record<number, string>>({});
  const [testResultsMap, setTestResultsMap] = useState<Record<number, { comment: string; code: string; passed: boolean; error?: string }[]>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});

  const parsedAssertsMap = useMemo(() => {
    const map: Record<number, ReturnType<typeof parseAsserts>> = {};
    for (const ex of history) {
      map[ex.id] = parseAsserts(ex.asserts);
    }
    return map;
  }, [history]);

  const filtered = useMemo(() => history.filter((ex) => {
    if (search && !ex.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (topicFilter !== "all" && ex.topic !== topicFilter) return false;
    if (languageFilter !== "all" && ex.language !== languageFilter) return false;
    if (difficultyFilter !== "all" && ex.difficulty !== parseInt(difficultyFilter)) return false;
    return true;
  }), [history, search, topicFilter, languageFilter, difficultyFilter]);

  const handleRunTests = (item: ExerciseHistoryItem) => {
    const code = userCodes[item.id] || "";
    if (!code.trim()) return;
    const asserts = parsedAssertsMap[item.id] || [];
    if (asserts.length === 0) return;
    const results = runTests(code, asserts);
    setTestResultsMap((prev) => ({ ...prev, [item.id]: results }));
  };

  if (isLoading) return <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      {/* Filter toolbar */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Ämne</label>
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Alla ämnen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla ämnen</SelectItem>
                {ALL_TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Språk</label>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla språk</SelectItem>
                {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
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
          <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{history.length === 0 ? "Du har inga sparade övningar ännu. Generera en övning under AI-generera!" : "Inga övningar matchar dina filter."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ex) => {
            const asserts = parsedAssertsMap[ex.id] || [];
            const testResults = testResultsMap[ex.id];
            return (
              <div key={ex.id} className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                <Button variant="ghost" className="w-full flex items-center justify-between p-5 text-left h-auto hover:bg-muted/50" onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-display font-semibold text-foreground">{ex.title}</span>
                    <Badge variant="outline">{ex.topic}</Badge>
                    <Badge variant="secondary">{ex.language}</Badge>
                    <Badge className={`text-xs ${DIFFICULTY_COLORS[ex.difficulty] || DIFFICULTY_COLORS[1]}`}>{DIFFICULTY_LABELS[ex.difficulty] || "Mycket lätt"}</Badge>
                    {ex.isCompleted && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Avklarad</Badge>}
                  </div>
                  {expandedId === ex.id ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                </Button>
                <AnimatePresence>
                  {expandedId === ex.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="p-5 pt-0 border-t border-border space-y-5">
                        <p className="text-muted-foreground text-sm leading-relaxed">{ex.description}</p>

                        {/* Example */}
                        {ex.example && (
                          <div>
                            <h3 className="font-semibold text-sm text-foreground mb-1">Exempel</h3>
                            <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-64">{ex.example}</pre>
                          </div>
                        )}

                        {/* Assumptions */}
                        {ex.assumptions && (
                          <div>
                            <h3 className="font-semibold text-sm text-foreground mb-1">Antaganden</h3>
                            <p className="text-sm text-muted-foreground">{ex.assumptions}</p>
                          </div>
                        )}

                        {/* Function Signature */}
                        {ex.functionSignature && (
                          <div>
                            <h3 className="font-semibold text-sm text-foreground mb-1">Funktionssignatur</h3>
                            <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono">{ex.functionSignature}</pre>
                          </div>
                        )}

                        {/* Test cases */}
                        {asserts.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm text-foreground mb-2">Testfall</h3>
                            <div className="space-y-2">
                              {asserts.map((a, i) => (
                                <div key={i} className="bg-muted rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground mb-1">// {a.comment}</p>
                                  <pre className="text-sm text-foreground font-mono">{a.code}</pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Code testing area */}
                        {asserts.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-foreground">Din kod</h3>
                            <Textarea
                              value={userCodes[ex.id] || ""}
                              onChange={(e) => setUserCodes((prev) => ({ ...prev, [ex.id]: e.target.value }))}
                              placeholder="Skriv eller klistra in din kod här..."
                              className="font-mono text-sm min-h-[160px] resize-y"
                            />
                            <Button onClick={() => handleRunTests(ex)} disabled={!(userCodes[ex.id] || "").trim()} className="gap-2">
                              <Play className="h-4 w-4" /> Testa mot testfallen
                            </Button>

                            {testResults && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm text-foreground">Resultat:</h4>
                                  <span className="text-sm text-muted-foreground">
                                    {testResults.filter((r) => r.passed).length}/{testResults.length} godkända
                                  </span>
                                </div>
                                {testResults.map((r, i) => (
                                  <div key={i} className={`rounded-lg p-3 ${r.passed ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
                                    <div className="flex items-start gap-2">
                                      {r.passed
                                        ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                        : <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                      }
                                      <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground mb-1">// {r.comment}</p>
                                        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{r.code}</pre>
                                        {r.error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{r.error}</p>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Solution — always available, no timer */}
                        {ex.solution && (
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSolution((prev) => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                              className="gap-2 mb-2"
                            >
                              {showSolution[ex.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              {showSolution[ex.id] ? "Dölj lösning" : "Visa lösning"}
                            </Button>
                            {showSolution[ex.id] && (
                              <pre className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap font-mono overflow-auto max-h-96">
                                {ex.solution}
                              </pre>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          {new Date(ex.createdAt).toLocaleDateString("sv-SE")}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OvningarSaved;
