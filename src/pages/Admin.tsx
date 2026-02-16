import { useState } from "react";
import {
  ShieldCheck, Users, CalendarCheck, Megaphone, Settings,
  ArrowLeft, Dumbbell, Ticket, FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAttendance from "@/components/admin/AdminAttendance";
import AdminExercises from "@/components/admin/AdminExercises";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminPosts from "@/components/admin/AdminPosts";
import AdminSettings from "@/components/admin/AdminSettings";
import CoachAttendance from "@/components/admin/CoachAttendance";
import AdminTickets from "@/components/admin/AdminTickets";

const StubPanel = ({ label }: { label: string }) => (
  <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
    <p className="text-muted-foreground">{label} — coming soon.</p>
  </div>
);

const menuItems = [
  { id: "users", label: "Hantera deltagare", icon: Users },
  { id: "exercises", label: "Hantera övningar", icon: Dumbbell },
  { id: "projects", label: "Hantera projekt", icon: FolderKanban },
  { id: "posts", label: "Nyheter & Event", icon: Megaphone },
  { id: "attendance", label: "Närvarohantering", icon: CalendarCheck },
  { id: "coach-attendance", label: "Coach Närvarohantering", icon: CalendarCheck },
  { id: "tickets", label: "Inkomna ärenden", icon: Ticket },
  { id: "settings", label: "Admin Inställningar", icon: Settings },
] as const;

type AdminView = (typeof menuItems)[number]["id"] | "menu";

const Admin = () => {
  const [view, setView] = useState<AdminView>("menu");

  const renderContent = () => {
    switch (view) {
      case "users": return <AdminUsers />;
      case "attendance": return <AdminAttendance />;
      case "exercises": return <AdminExercises />;
      case "projects": return <AdminProjects />;
      case "posts": return <AdminPosts />;
      case "coach-attendance": return <CoachAttendance />;
      case "tickets": return <AdminTickets />;
      case "settings": return <AdminSettings />;
      default: return null;
    }
  };

  if (view !== "menu") {
    const current = menuItems.find((m) => m.id === view);
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setView("menu")} className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </Button>
          <h1 className="font-display text-2xl font-bold text-foreground">{current?.label}</h1>
        </div>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => setView(item.id)} className="flex items-center gap-4 p-6 bg-card rounded-2xl shadow-card border border-border hover:shadow-card-hover transition-shadow duration-200 text-left">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shrink-0">
              <item.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Admin;
