import { useState, useRef, useEffect } from "react";
import { TerminalIcon, BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FsNode = { [key: string]: FsNode | null };

const initialFs: FsNode = {
  home: {
    user: {
      documents: { "notes.txt": null, "todo.txt": null },
      projects: { app: { "index.html": null, "style.css": null } },
      pictures: {},
    },
  },
};

function deepClone(obj: FsNode): FsNode {
  return JSON.parse(JSON.stringify(obj));
}

function resolvePath(fs: FsNode, parts: string[]): FsNode | null | undefined {
  let current: FsNode | null = fs;
  for (const part of parts) {
    if (current === null || typeof current !== "object" || !(part in current)) return undefined;
    current = current[part];
  }
  return current;
}

const lessons = [
  {
    title: "Navigera i filsystemet",
    steps: [
      { instruction: "Skriv `pwd` för att se var du befinner dig.", check: (cmd: string) => cmd.trim() === "pwd" },
      { instruction: "Skriv `ls` för att lista filer i nuvarande mapp.", check: (cmd: string) => cmd.trim() === "ls" },
      { instruction: "Navigera till mappen 'documents' med `cd documents`.", check: (cmd: string) => cmd.trim() === "cd documents" },
      { instruction: "Gå tillbaka ett steg med `cd ..`.", check: (cmd: string) => cmd.trim() === "cd .." },
    ],
  },
  {
    title: "Hantera mappar och filer",
    steps: [
      { instruction: "Skapa en ny mapp med `mkdir min-mapp`.", check: (cmd: string) => cmd.trim().startsWith("mkdir ") },
      { instruction: "Gå in i den nya mappen med `cd min-mapp`.", check: (cmd: string) => cmd.trim() === "cd min-mapp" },
      { instruction: "Skapa en fil med `touch hello.txt`.", check: (cmd: string) => cmd.trim().startsWith("touch ") },
      { instruction: "Lista filerna med `ls` för att se din nya fil.", check: (cmd: string) => cmd.trim() === "ls" },
    ],
  },
  {
    title: "Utforska fritt",
    steps: [
      { instruction: "Använd `ls`, `cd`, `mkdir`, `touch`, `pwd`, `clear` och `help` fritt! Skriv `help` för alla kommandon.", check: (cmd: string) => cmd.trim() === "help" },
    ],
  },
];

const Terminal = () => {
  const [lines, setLines] = useState<{ text: string; type: "input" | "output" | "error" | "success" }[]>([
    { text: "Välkommen till CUL Terminal! Skriv 'help' för att se tillgängliga kommandon.", type: "success" },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<string[]>(["home", "user"]);
  const [fs, setFs] = useState<FsNode>(deepClone(initialFs));
  const [lessonIdx, setLessonIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [showLessons, setShowLessons] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const prompt = `~/${cwd.slice(1).join("/")}$`;

  const exec = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newLines = [...lines, { text: `${prompt} ${trimmed}`, type: "input" as const }];
    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const arg = parts.slice(1).join(" ");

    const addOutput = (text: string, type: "output" | "error" | "success" = "output") => {
      newLines.push({ text, type });
    };

    switch (command) {
      case "pwd":
        addOutput("/" + cwd.join("/"));
        break;
      case "ls": {
        const node = resolvePath(fs, cwd);
        if (node && typeof node === "object") {
          const items = Object.entries(node).map(([name, val]) => (val === null ? name : `${name}/`));
          addOutput(items.length ? items.join("  ") : "(tom mapp)");
        }
        break;
      }
      case "cd": {
        if (!arg || arg === "~") { setCwd(["home", "user"]); break; }
        if (arg === "..") { if (cwd.length > 1) setCwd((prev) => prev.slice(0, -1)); break; }
        const target = [...cwd, arg];
        const node = resolvePath(fs, target);
        if (node !== undefined && node !== null) { setCwd(target); }
        else { addOutput(`cd: ${arg}: Ingen sådan mapp`, "error"); }
        break;
      }
      case "mkdir": {
        if (!arg) { addOutput("mkdir: ange ett mappnamn", "error"); break; }
        const node = resolvePath(fs, cwd);
        if (node && typeof node === "object") {
          if (arg in node) { addOutput(`mkdir: ${arg}: finns redan`, "error"); break; }
          const newFs = deepClone(fs);
          let curr = newFs;
          for (const p of cwd) curr = curr[p] as FsNode;
          curr[arg] = {};
          setFs(newFs);
          addOutput(`Mapp '${arg}' skapad`, "success");
        }
        break;
      }
      case "touch": {
        if (!arg) { addOutput("touch: ange ett filnamn", "error"); break; }
        const node = resolvePath(fs, cwd);
        if (node && typeof node === "object") {
          const newFs = deepClone(fs);
          let curr = newFs;
          for (const p of cwd) curr = curr[p] as FsNode;
          curr[arg] = null;
          setFs(newFs);
          addOutput(`Fil '${arg}' skapad`, "success");
        }
        break;
      }
      case "clear":
        setLines([]);
        setInput("");
        return;
      case "help":
        addOutput("Tillgängliga kommandon:");
        addOutput("  pwd        - Visa nuvarande mapp");
        addOutput("  ls         - Lista filer och mappar");
        addOutput("  cd <mapp>  - Gå in i en mapp (cd .. för att gå tillbaka)");
        addOutput("  mkdir <namn> - Skapa en ny mapp");
        addOutput("  touch <namn> - Skapa en ny fil");
        addOutput("  clear      - Rensa terminalen");
        addOutput("  help       - Visa denna hjälptext");
        break;
      default:
        addOutput(`${command}: kommandot hittades inte. Skriv 'help' för hjälp.`, "error");
    }

    setLines(newLines);
    setInput("");

    const lesson = lessons[lessonIdx];
    if (lesson && stepIdx < lesson.steps.length) {
      const step = lesson.steps[stepIdx];
      if (step.check(trimmed)) {
        if (stepIdx + 1 < lesson.steps.length) { setStepIdx(stepIdx + 1); }
        else if (lessonIdx + 1 < lessons.length) { setLessonIdx(lessonIdx + 1); setStepIdx(0); }
      }
    }
  };

  const currentLesson = lessons[lessonIdx];
  const currentStep = currentLesson?.steps[stepIdx];

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <TerminalIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Terminal</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Button variant="outline" size="sm" className="w-full gap-2 lg:hidden" onClick={() => setShowLessons(!showLessons)}>
            <BookOpen className="h-4 w-4" />
            {showLessons ? "Dölj lektioner" : "Visa lektioner"}
          </Button>

          <div className={`space-y-3 ${showLessons ? "" : "hidden lg:block"}`}>
            {lessons.map((lesson, li) => (
              <div key={li} className={`bg-card rounded-xl border border-border p-4 ${li === lessonIdx ? "ring-2 ring-primary/30" : "opacity-60"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={li < lessonIdx ? "default" : li === lessonIdx ? "secondary" : "outline"} className="text-[10px]">
                    {li < lessonIdx ? "Klar" : li === lessonIdx ? "Pågår" : `Lektion ${li + 1}`}
                  </Badge>
                  <span className="font-display text-sm font-semibold text-foreground">{lesson.title}</span>
                </div>
                {li === lessonIdx && currentStep && (
                  <div className="flex items-start gap-2 mt-2 bg-primary/5 rounded-lg p-3">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{currentStep.instruction}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[hsl(215,30%,10%)] rounded-2xl border border-[hsl(215,25%,20%)] overflow-hidden shadow-card cursor-text" onClick={() => inputRef.current?.focus()}>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(215,30%,14%)] border-b border-[hsl(215,25%,20%)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-[hsl(45,90%,50%)]" />
                <div className="w-3 h-3 rounded-full bg-accent/80" />
              </div>
              <span className="text-xs text-[hsl(210,25%,55%)] ml-2 font-mono">terminal — bash</span>
            </div>

            <div ref={scrollRef} className="p-4 h-[400px] overflow-y-auto font-mono text-sm space-y-0.5">
              {lines.map((line, i) => (
                <div key={i} className={
                  line.type === "input" ? "text-[hsl(210,25%,85%)]"
                    : line.type === "error" ? "text-destructive"
                    : line.type === "success" ? "text-accent"
                    : "text-[hsl(210,25%,70%)]"
                }>
                  {line.text}
                </div>
              ))}
              <div className="flex items-center gap-2 text-[hsl(210,25%,85%)]">
                <span className="text-accent shrink-0">{prompt}</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") exec(input); }}
                  className="flex-1 bg-transparent outline-none caret-accent text-[hsl(210,25%,85%)]"
                  autoFocus
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
