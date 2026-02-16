import { useState, useRef, useEffect } from "react";
import { FolderOpen, Sparkles, Eye, Code2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type AssertProjectType from "@/Types/AssertProjectType";
import type { AssertProjectResponse } from "@/Types/AssertProjectType";
import dummyPic from "@/assets/images/dummypic";
import { assertService } from "@/api/AssertService";

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

const Projekt = () => {
  const [showingSolution, setShowingSolution] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const [showHTML, setShowHTML] = useState(true);
  const [showCSS, setShowCSS] = useState(false);
  const [showJS, setShowJS] = useState(false);
  const [AIProject, setAIProject] = useState<AssertProjectResponse | null>(null);
  const [AIModel, setAIModel] = useState("anthropic");
  const [course, setCourse] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(90);

  useEffect(() => {
    if (AIProject && previewIframeRef.current) {
      const doc = previewIframeRef.current.contentDocument;
      if (doc) {
        const htmlWithImages = (AIProject.solutionHtml || "").replace(/{dummyPic}/g, dummyPic);
        doc.open();
        doc.write(`<html><head><style>${AIProject.solutionCss || ""}</style></head><body style="background-color: #faf3e8;">${htmlWithImages}<script>${AIProject.solutionJs || ""}<\/script></body></html>`);
        doc.close();
      }
    }
  }, [AIProject]);

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
    if (!course) return;
    setIsLoading(true);
    setProjectError(null);
    try {
      const request = { techStack: course, difficulty: difficultyLevel } as AssertProjectType;
      const result = await assertService.fetchProjectAssert(request, AIModel);
      setAIProject(result);
      setShowingSolution(false);
    } catch (error) {
      console.error("Error fetching project:", error);
      setProjectError(error instanceof Error ? error.message : "Ett fel uppstod vid generering.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderList = (text: string | undefined) => {
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

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <FolderOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Projekt</h1>
          <p className="text-sm text-muted-foreground">AI-genererade webbprojekt</p>
        </div>
      </div>

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
          <div className="flex-1 min-w-[160px]">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Projekttyp</label>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger><SelectValue placeholder="Välj typ..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="html+css">HTML + CSS</SelectItem>
                <SelectItem value="html+css+js">HTML + CSS + JS</SelectItem>
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
            disabled={isLoading || !course}
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
          <p className="text-muted-foreground">Genererar projekt... ({countdown}s kvar)</p>
        </div>
      )}

      {/* Error */}
      {projectError && !isLoading && (
        <div className="bg-destructive/10 rounded-2xl border border-destructive/20 p-6 mb-6 text-center">
          <p className="text-destructive mb-3">{projectError}</p>
          <Button variant="outline" onClick={generate} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Försök igen
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !projectError && !AIProject && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Välj projekttyp och svårighetsgrad ovan, klicka sedan Generera.</p>
        </div>
      )}

      {/* Project content */}
      {!isLoading && !projectError && AIProject && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: details or code */}
          <div className="space-y-4">
            {/* Toggle buttons */}
            <div className="flex gap-3">
              <Button
                variant={!showingSolution ? "default" : "outline"}
                onClick={() => setShowingSolution(false)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" /> Uppgift
              </Button>
              <Button
                variant={showingSolution ? "default" : "outline"}
                onClick={() => setShowingSolution(true)}
                className="gap-2"
              >
                <Code2 className="h-4 w-4" /> Kodlösning
              </Button>
            </div>

            {!showingSolution ? (
              /* Project details */
              <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{AIProject.title}</h2>
                  <div className="flex gap-2 mt-2">
                    <Badge className={DIFFICULTY_COLORS[AIProject.difficulty]}>{DIFFICULTY_LABELS[AIProject.difficulty]}</Badge>
                    <Badge variant="secondary">{AIProject.techStack}</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{AIProject.description}</p>

                {AIProject.learningGoals && (
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">Lärandemål</h3>
                    {renderList(AIProject.learningGoals)}
                  </div>
                )}
                {AIProject.userStories && (
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">User Stories</h3>
                    {renderList(AIProject.userStories)}
                  </div>
                )}
                {AIProject.designSpecs && (
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">Designspecifikationer</h3>
                    {renderList(AIProject.designSpecs)}
                  </div>
                )}
                {AIProject.assetsNeeded && (
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">Resurser</h3>
                    {renderList(AIProject.assetsNeeded)}
                  </div>
                )}
                {AIProject.starterHtml && (
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">Startkod</h3>
                    <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-64">
                      {AIProject.starterHtml}
                    </pre>
                  </div>
                )}
                {AIProject.bonusChallenges && (
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">Bonusutmaningar</h3>
                    {renderList(AIProject.bonusChallenges)}
                  </div>
                )}
              </div>
            ) : (
              /* Solution code blocks */
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground self-center mr-1">Visa:</span>
                  {AIProject.solutionHtml && (
                    <Button size="sm" variant={showHTML ? "default" : "outline"} onClick={() => setShowHTML((p) => !p)}>HTML</Button>
                  )}
                  {AIProject.solutionCss && (
                    <Button size="sm" variant={showCSS ? "default" : "outline"} onClick={() => setShowCSS((p) => !p)}>CSS</Button>
                  )}
                  {AIProject.solutionJs && (
                    <Button size="sm" variant={showJS ? "default" : "outline"} onClick={() => setShowJS((p) => !p)}>JavaScript</Button>
                  )}
                </div>
                {showHTML && AIProject.solutionHtml && (
                  <div className="bg-card rounded-2xl shadow-card border border-border p-5">
                    <h3 className="font-semibold text-sm text-foreground mb-2">HTML</h3>
                    <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">
                      {AIProject.solutionHtml}
                    </pre>
                  </div>
                )}
                {showCSS && AIProject.solutionCss && (
                  <div className="bg-card rounded-2xl shadow-card border border-border p-5">
                    <h3 className="font-semibold text-sm text-foreground mb-2">CSS</h3>
                    <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">
                      {AIProject.solutionCss}
                    </pre>
                  </div>
                )}
                {showJS && AIProject.solutionJs && (
                  <div className="bg-card rounded-2xl shadow-card border border-border p-5">
                    <h3 className="font-semibold text-sm text-foreground mb-2">JavaScript</h3>
                    <pre className="bg-muted rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">
                      {AIProject.solutionJs}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: live preview */}
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm text-foreground">Live Preview</h3>
            </div>
            <iframe
              ref={previewIframeRef}
              className="w-full min-h-[500px] bg-white"
              title="Live Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Projekt;
