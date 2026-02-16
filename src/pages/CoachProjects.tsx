import { FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";

const TYPE_LABELS: Record<string, string> = {
  html: "HTML",
  "html+css": "HTML + CSS",
  "html+css+js": "HTML + CSS + JS",
};

const CoachProjects = () => {
  const { data: projects = [], isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <FolderKanban className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Projekt</h1>
        <Badge variant="secondary">{projects.length} projekt</Badge>
      </div>

      {projects.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <p className="text-muted-foreground">Inga projekt tillgängliga.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl shadow-card border border-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display font-semibold text-foreground">{p.title}</h3>
                <Badge variant="outline" className="text-xs">{TYPE_LABELS[p.projectType] || p.projectType}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
              <div className="mt-3">
                <Badge variant="secondary" className="text-xs">Nivå {p.difficulty}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachProjects;
