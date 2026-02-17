import { useState, useEffect } from "react";
import { Sparkles, RotateCcw, Eye, EyeOff, Play, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type AssertExerciseType from "@/Types/AssertExerciseType";
import type { AssertExerciseResponse } from "@/Types/AssertExerciseType";
import { assertService } from "@/api/AssertService";

const TOPICS = [
  "Variables and DataTypes", "Operators", "Conditionals", "Loops",
  "Functions", "Arrays", "Objects", "Strings", "Events",
];

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

const OvningarAIGenerate = () => {
  const [AIModel, setAIModel] = useState("anthropic");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(90);
  const [exercise, setExercise] = useState<AssertExerciseResponse | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [testResults, setTestResults] = useState<{ comment: string; code: string; passed: boolean; error?: string }[] | null>(null);

  useEffect(() => {
    let intervalId: number;
    if (isLoading) {
      setCountdown(90);
      intervalId = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(intervalId); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isLoading]);

  const generate = async () => {
    if (!topic) return;
    setIsLoading(true);
    setExerciseError(null);
    try {
      const request: AssertExerciseType = { topic, language, difficulty: difficultyLevel };
      const result = await assertService.fetchExerciseAssert(request, AIModel);
      setExercise(result);
      setShowSolution(false);
      setUserCode("");
      setTestResults(null);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      setExerciseError(error instanceof Error ? error.message : "Ett fel uppstod vid generering.");
    } finally {
      setIsLoading(false);
    }
  };

  const runTests = () => {
    if (!exercise?.asserts || !userCode.trim()) return;
    const results = exercise.asserts.map((a) => {
      try {
        const wrapped = new Function(`
          ${userCode}
          let __passed = true;
          let __error = "";

          function expect(actual) {
            return {
              toBe(expected) {
                if (actual !== expected) {
                  __passed = false;
                  __error = "Förväntat " + JSON.stringify(expected) + " men fick " + JSON.stringify(actual);
                }
              },
              toEqual(expected) {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                  __passed = false;
                  __error = "Förväntat " + JSON.stringify(expected) + " men fick " + JSON.stringify(actual);
                }
              },
              toBeTruthy() {
                if (!actual) { __passed = false; __error = "Förväntat truthy men fick " + JSON.stringify(actual); }
              },
              toBeFalsy() {
                if (actual) { __passed = false; __error = "Förväntat falsy men fick " + JSON.stringify(actual); }
              },
              toContain(item) {
                if (typeof actual === "string" ? !actual.includes(item) : !Array.isArray(actual) || !actual.includes(item)) {
                  __passed = false;
                  __error = JSON.stringify(actual) + " innehåller inte " + JSON.stringify(item);
                }
              },
              toThrow() {
                if (typeof actual !== "function") { __passed = false; __error = "Förväntat en funktion"; return; }
                try { actual(); __passed = false; __error = "Förväntat att ett fel skulle kastas"; } catch(e) {}
              }
            };
          }

          const originalAssert = console.assert;
          console.assert = function(condition, ...args) {
            if (!condition) {
              __passed = false;
              __error = args.join(" ");
            }
          };

          try {
            ${a.code}
          } catch(e) {
            __passed = false;
            __error = e.message;
          }
          console.assert = originalAssert;
          return { passed: __passed, error: __error };
        `);
        const result = wrapped();
        return { comment: a.comment, code: a.code, passed: result.passed, error: result.error || undefined };
      } catch (e: any) {
        return { comment: a.comment, code: a.code, passed: false, error: e.message };
      }
    });
    setTestResults(results);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">AI-modell</label>
            <Select value={AIModel} onValueChange={setAIModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="deepseek">Deepseek</SelectItem>
                <SelectItem value="grok">Grok</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Ämne</label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger><SelectValue placeholder="Välj ämne..." /></SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Språk</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Svårighetsgrad</label>
            <Select value={String(difficultyLevel)} onValueChange={(v) => setDifficultyLevel(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} - {DIFFICULTY_LABELS[n]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={generate}
            disabled={isLoading || !topic}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? `Genererar... (${countdown}s)` : "Generera"}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Genererar övning... ({countdown}s kvar)</p>
        </div>
      )}

      {/* Error */}
      {exerciseError && !isLoading && (
        <div className="bg-destructive/10 rounded-2xl border border-destructive/20 p-6 mb-6 text-center">
          <p className="text-destructive mb-3">{exerciseError}</p>
          <Button variant="outline" onClick={generate} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Försök igen
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !exerciseError && !exercise && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Välj ämne, språk och svårighetsgrad ovan, klicka sedan Generera.</p>
        </div>
      )}

      {/* Exercise result */}
      {!isLoading && !exerciseError && exercise && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-5">
          {/* Title & badges */}
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{exercise.title}</h2>
            <div className="flex gap-2 mt-2">
              <Badge className={DIFFICULTY_COLORS[difficultyLevel]}>{DIFFICULTY_LABELS[difficultyLevel]}</Badge>
              <Badge variant="secondary">{language}</Badge>
              <Badge variant="outline">{topic}</Badge>
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{exercise.description}</p>
          )}

          {/* Example */}
          {exercise.example && (
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Exempel</h3>
              <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-64">
                {exercise.example}
              </pre>
            </div>
          )}

          {/* Assumptions */}
          {exercise.assumptions && (
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Antaganden</h3>
              <p className="text-sm text-muted-foreground">{exercise.assumptions}</p>
            </div>
          )}

          {/* Function Signature */}
          {exercise.functionSignature && (
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Funktionssignatur</h3>
              <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                {exercise.functionSignature}
              </pre>
            </div>
          )}

          {/* Asserts */}
          {exercise.asserts && exercise.asserts.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-2">Testfall</h3>
              <div className="space-y-2">
                {exercise.asserts.map((a, i) => (
                  <div key={i} className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">// {a.comment}</p>
                    <pre className="text-sm text-foreground font-mono">{a.code}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code testing area */}
          {exercise.asserts && exercise.asserts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Din kod</h3>
              <Textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="Skriv eller klistra in din kod här..."
                className="font-mono text-sm min-h-[160px] resize-y"
              />
              <Button onClick={runTests} disabled={!userCode.trim()} className="gap-2">
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

          {/* Solution (hidden by default) */}
          {exercise.solution && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSolution(!showSolution)}
                className="gap-2 mb-2"
              >
                {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSolution ? "Dölj lösning" : "Visa lösning"}
              </Button>
              {showSolution && (
                <pre className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap font-mono overflow-auto max-h-96">
                  {exercise.solution}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OvningarAIGenerate;
