import { useState } from "react";
import { FolderOpen, Sparkles, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjektAIGenerate from "./Projekt/ProjektAIGenerate";
import ProjektSaved from "./Projekt/ProjektSaved";
import HelpDialog from "@/components/HelpDialog";

const Projekt = () => {
  const [activeTab, setActiveTab] = useState("ai");
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <FolderOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Projekt</h1>
          <p className="text-sm text-muted-foreground">AI-genererade och sparade webbprojekt</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center gap-2 mb-6">
          <TabsList>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" /> AI-generera
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <BookOpen className="h-4 w-4" /> Sparade
            </TabsTrigger>
          </TabsList>
          <HelpDialog helpKey={`projekt.${activeTab}`} />
        </div>
        <TabsContent value="ai">
          <ProjektAIGenerate />
        </TabsContent>
        <TabsContent value="saved">
          <ProjektSaved />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Projekt;
