import { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw, Lightbulb, CheckCircle, Copy, Check, Terminal, Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CodeEditorProps {
  starterCode: string;
  solutionCode?: string;
  expectedOutput?: string;
  explanation?: string;
  hints?: { hint_text: string; order_index: number }[];
  language?: string;
  onComplete?: () => void;
  readOnly?: boolean;
}

type TabId = "html" | "css" | "js";
interface TabConfig { id: TabId; label: string; }

function getTabsForCategory(category: string): TabConfig[] {
  switch (category) {
    case "html": return [{ id: "html", label: "HTML" }];
    case "html_css": return [{ id: "html", label: "HTML" }, { id: "css", label: "CSS" }];
    case "html_css_js": return [{ id: "html", label: "HTML" }, { id: "css", label: "CSS" }, { id: "js", label: "JavaScript" }];
    case "react": return [{ id: "js", label: "JSX" }];
    case "python": return [{ id: "js", label: "Python" }];
    case "csharp": return [{ id: "js", label: "C#" }];
    default: return [{ id: "html", label: "HTML" }];
  }
}

function splitStarterCode(code: string, category: string): Record<TabId, string> {
  const result: Record<TabId, string> = { html: "", css: "", js: "" };
  if (category === "html" || category === "react") { result.html = code; return result; }
  if (category === "python" || category === "csharp") { result.js = code; return result; }
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  let html = code;
  if (styleMatch) { result.css = styleMatch[1].trim(); html = html.replace(styleMatch[0], "").trim(); }
  if (scriptMatch) { result.js = scriptMatch[1].trim(); html = html.replace(scriptMatch[0], "").trim(); }
  result.html = html;
  return result;
}

function combineCode(tabs: Record<TabId, string>, category: string): string {
  if (category === "python" || category === "csharp") return tabs.js;
  if (category === "react") return tabs.html || tabs.js;
  let combined = tabs.html || "";
  if (tabs.css?.trim()) {
    combined = combined.includes("</head>")
      ? combined.replace("</head>", `<style>\n${tabs.css}\n</style>\n</head>`)
      : `<style>\n${tabs.css}\n</style>\n${combined}`;
  }
  if (tabs.js?.trim()) {
    combined = combined.includes("</body>")
      ? combined.replace("</body>", `<script>\n${tabs.js}\n<\/script>\n</body>`)
      : `${combined}\n<script>\n${tabs.js}\n<\/script>`;
  }
  return combined;
}

export default function CodeEditor({ starterCode, solutionCode, expectedOutput, explanation, hints = [], language = "html", onComplete, readOnly = false }: CodeEditorProps) {
  const editorTabs = getTabsForCategory(language);
  const initialCode = splitStarterCode(starterCode || "", language);
  const [tabCode, setTabCode] = useState<Record<TabId, string>>(initialCode);
  const [activeTab, setActiveTab] = useState<TabId>(editorTabs[0].id);
  const [showPreview, setShowPreview] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isWebLanguage = ["html", "html_css", "html_css_js", "react"].includes(language);

  const updateTabCode = (tab: TabId, code: string) => setTabCode((prev) => ({ ...prev, [tab]: code }));
  const getCombinedCode = useCallback(() => combineCode(tabCode, language), [tabCode, language]);

  const runCode = useCallback(() => {
    setConsoleOutput([]);
    if (isWebLanguage) {
      setShowPreview(true);
      setShowConsole(true);
      const combined = getCombinedCode();
      const consoleCapture = `<script>(function(){var _l=console.log,_e=console.error,_w=console.warn;function s(t,a){try{window.parent.postMessage({type:'console',method:t,args:Array.from(a).map(function(x){return typeof x==='object'?JSON.stringify(x,null,2):String(x)})},'*')}catch(e){}}console.log=function(){s('log',arguments);_l.apply(console,arguments)};console.error=function(){s('error',arguments);_e.apply(console,arguments)};console.warn=function(){s('warn',arguments);_w.apply(console,arguments)};window.onerror=function(m,u,l){s('error',['Error: '+m+' (rad '+l+')'])}})();<\/script>`;
      let doc = combined;
      if (doc.includes("<head>")) doc = doc.replace("<head>", `<head>${consoleCapture}`);
      else if (doc.includes("<html>")) doc = doc.replace("<html>", `<html><head>${consoleCapture}</head>`);
      else doc = consoleCapture + doc;
      if (iframeRef.current) {
        const fd = iframeRef.current.contentDocument;
        if (fd) { fd.open(); fd.write(doc); fd.close(); }
      }
      if (expectedOutput) {
        const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
        setTimeout(() => {
          if (iframeRef.current?.contentDocument) {
            const body = iframeRef.current.contentDocument.body?.innerHTML || "";
            const match = norm(body).includes(norm(expectedOutput)) || norm(combined).includes(norm(expectedOutput));
            setIsCorrect(match);
            if (match && onComplete) onComplete();
          }
        }, 500);
      }
    } else {
      setConsoleOutput(["Körning av " + language + " stöds inte i webbläsaren. Kopiera koden och kör den lokalt."]);
      setShowPreview(true);
      setShowConsole(true);
    }
  }, [getCombinedCode, isWebLanguage, expectedOutput, language, onComplete]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "console") {
        const prefix = e.data.method === "error" ? "Error: " : e.data.method === "warn" ? "Warning: " : "";
        setConsoleOutput((prev) => [...prev, prefix + (e.data.args || []).join(" ")]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const resetCode = () => { setTabCode(splitStarterCode(starterCode || "", language)); setShowPreview(false); setConsoleOutput([]); setIsCorrect(null); setShowConsole(false); };
  const revealNextHint = () => { if (revealedHints < hints.length) setRevealedHints((p) => p + 1); };
  const copyCode = async () => { await navigator.clipboard.writeText(getCombinedCode()); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const sortedHints = [...hints].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background p-4 overflow-auto" : "space-y-3"}>
      {isFullscreen && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Kodmiljö</span>
          <Button size="sm" variant="ghost" onClick={() => setIsFullscreen(false)}><X className="h-4 w-4 mr-1" /> Stäng</Button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={runCode} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"><Play className="h-3.5 w-3.5" /> Kör</Button>
          <Button size="sm" variant="outline" onClick={resetCode} className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Återställ</Button>
          <Button size="sm" variant="ghost" onClick={copyCode} className="gap-1.5">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Kopierad" : "Kopiera"}</Button>
          <Button size="sm" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)} className="gap-1.5">{isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}</Button>
        </div>
        <div className="flex items-center gap-2">
          {hints.length > 0 && <Button size="sm" variant="outline" onClick={revealNextHint} disabled={revealedHints >= hints.length} className="gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Ledtråd ({revealedHints}/{hints.length})</Button>}
          {solutionCode && <Button size="sm" variant={showSolution ? "secondary" : "outline"} onClick={() => setShowSolution(!showSolution)}>{showSolution ? "Dölj lösning" : "Visa lösning"}</Button>}
          {explanation && <Button size="sm" variant={showExplanation ? "secondary" : "outline"} onClick={() => setShowExplanation(!showExplanation)}>{showExplanation ? "Dölj förklaring" : "Förklaring"}</Button>}
          {isCorrect !== null && <Badge className={isCorrect ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}>{isCorrect ? <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Rätt!</> : "Försök igen"}</Badge>}
        </div>
      </div>

      {revealedHints > 0 && (
        <div className="space-y-2">
          {sortedHints.slice(0, revealedHints).map((h, i) => (
            <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm">
              <span className="font-medium text-yellow-700 dark:text-yellow-400">Ledtråd {i + 1}:</span>{" "}
              <span className="text-yellow-900 dark:text-yellow-200">{h.hint_text}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`grid gap-3 ${isFullscreen ? "grid-cols-2 h-[calc(100vh-200px)]" : "grid-cols-1 lg:grid-cols-2"}`}>
        <div className="flex flex-col">
          {editorTabs.length > 1 && (
            <div className="flex border-b border-border bg-[#252526] rounded-t-lg">
              {editorTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 ${activeTab === tab.id ? "border-primary text-primary bg-[#1e1e1e]" : "border-transparent text-[#858585] hover:text-[#d4d4d4] hover:bg-[#2d2d30]"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          <textarea
            value={tabCode[activeTab]}
            onChange={(e) => updateTabCode(activeTab, e.target.value)}
            readOnly={readOnly}
            className={`w-full flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 ${editorTabs.length > 1 ? "rounded-b-lg border-t-0" : "rounded-lg"} ${isFullscreen ? "min-h-0" : "min-h-[300px]"}`}
            spellCheck={false}
            placeholder="Skriv din kod här..."
            style={{ tabSize: 2, lineHeight: "1.6" }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const t = e.target as HTMLTextAreaElement;
                const s = t.selectionStart, end = t.selectionEnd;
                updateTabCode(activeTab, tabCode[activeTab].substring(0, s) + "  " + tabCode[activeTab].substring(end));
                setTimeout(() => { t.selectionStart = t.selectionEnd = s + 2; }, 0);
              }
            }}
          />
        </div>

        <div className="flex flex-col">
          <div className="flex border-b border-border bg-muted/50 rounded-t-lg">
            <button className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 ${!showConsole ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setShowConsole(false)}>
              {isWebLanguage ? "Förhandsgranskning" : "Utskrift"}
            </button>
            <button className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${showConsole ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setShowConsole(true)}>
              <Terminal className="h-3 w-3" /> Konsol
              {consoleOutput.length > 0 && <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">{consoleOutput.length}</span>}
            </button>
          </div>
          <div className={`border border-border border-t-0 rounded-b-lg overflow-hidden flex-1`}>
            {!showConsole ? (
              isWebLanguage ? (
                <div className={`bg-white ${isFullscreen ? "h-full" : "min-h-[300px]"}`}>
                  {showPreview ? (
                    <iframe ref={iframeRef} title="preview" className={`w-full border-0 ${isFullscreen ? "h-full" : "min-h-[300px]"}`} sandbox="allow-scripts" />
                  ) : (
                    <div className={`flex items-center justify-center text-muted-foreground text-sm ${isFullscreen ? "h-full" : "min-h-[300px]"}`}>Klicka "Kör" för att se resultatet</div>
                  )}
                </div>
              ) : (
                <pre className={`bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 overflow-auto whitespace-pre-wrap ${isFullscreen ? "h-full" : "min-h-[300px]"}`}>
                  {consoleOutput.length > 0 ? consoleOutput.join("\n") : 'Klicka "Kör" för att se utskriften'}
                </pre>
              )
            ) : (
              <div className={`bg-[#1e1e1e] p-3 overflow-auto ${isFullscreen ? "h-full" : "min-h-[300px] max-h-[300px]"}`}>
                {consoleOutput.length === 0 ? (
                  <p className="text-[#858585] text-xs font-mono">Konsolen är tom. Kör koden för att se utskrifter.</p>
                ) : (
                  <div className="space-y-1">
                    {consoleOutput.map((line, i) => (
                      <div key={i} className={`text-xs font-mono ${line.startsWith("Error:") ? "text-red-400" : line.startsWith("Warning:") ? "text-yellow-400" : "text-[#d4d4d4]"}`}>
                        <span className="text-[#858585] mr-2 select-none">{">"}</span>{line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showExplanation && explanation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
          <span className="font-medium text-blue-700 dark:text-blue-400">Förklaring:</span>
          <p className="text-blue-900 dark:text-blue-200 mt-1 whitespace-pre-wrap">{explanation}</p>
        </div>
      )}

      {showSolution && solutionCode && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lösning</label>
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 rounded-lg border border-border overflow-x-auto whitespace-pre-wrap">{solutionCode}</pre>
        </div>
      )}
    </div>
  );
}
