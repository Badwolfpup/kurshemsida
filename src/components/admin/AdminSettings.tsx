import { useState } from "react";
import { Sun, Moon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { useNoClasses, useUpdateNoClasses } from "@/hooks/useNoClass";
import underconstruction from "@/assets/images/comingsoon.png";

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { data: noClasses = [] } = useNoClasses();
  const updateNoClasses = useUpdateNoClasses();
  const [noClassDate, setNoClassDate] = useState("");

  const addNoClassDay = () => {
    if (!noClassDate) return;
    updateNoClasses.mutate(noClassDate, {
      onSuccess: () => {
        toast({ title: "Ledig dag tillagd", description: `${noClassDate} har markerats som ledig.` });
        setNoClassDate("");
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <img src={underconstruction} alt="Under construction" className="w-64" />
      <h2 className="font-display text-xl font-bold text-foreground">Admininställningar</h2>
      <p className="text-muted-foreground text-center max-w-md">Behövs den här sidan?</p>
    </div>
    // <div className="space-y-6">
    //   <div className="bg-card rounded-2xl shadow-card border border-border p-6">
    //     <h2 className="font-display font-semibold text-lg text-foreground mb-4">Tema</h2>
    //     <div className="flex gap-3">
    //       <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")} className="gap-2">
    //         <Sun className="h-4 w-4" /> Ljust
    //       </Button>
    //       <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")} className="gap-2">
    //         <Moon className="h-4 w-4" /> Mörkt
    //       </Button>
    //     </div>
    //   </div>

    //   <div className="bg-card rounded-2xl shadow-card border border-border p-6">
    //     <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
    //       <Calendar className="h-5 w-5" /> Lediga dagar
    //     </h2>
    //     <p className="text-sm text-muted-foreground mb-4">Markera dagar utan undervisning (helgdagar, planeringsdag etc.)</p>
    //     <div className="flex flex-wrap gap-3">
    //       <Input type="date" value={noClassDate} onChange={(e) => setNoClassDate(e.target.value)} className="w-auto" />
    //       <Button onClick={addNoClassDay} disabled={!noClassDate}>Lägg till</Button>
    //     </div>
    //     {noClasses.length > 0 && (
    //       <div className="mt-4 flex flex-wrap gap-2">
    //         {noClasses.map((d, i) => (
    //           <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{new Date(d).toLocaleDateString("sv-SE")}</span>
    //         ))}
    //       </div>
    //     )}
    //   </div>
    // </div>
  );
}
