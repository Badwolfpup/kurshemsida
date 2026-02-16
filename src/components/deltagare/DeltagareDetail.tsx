import { useState } from "react";
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  Circle,
  Clock,
  Mail,
  CalendarDays,
  User,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAddTicket } from "@/hooks/useTickets";
import { useToast } from "@/hooks/use-toast";
import type { Participant } from "@/pages/Deltagare";

function getAttendanceRate(p: Participant): number {
  const entries = Object.values(p.attendance);
  if (entries.length === 0) return 0;
  return Math.round((entries.filter(Boolean).length / entries.length) * 100);
}

function hasAbsenceAlert(p: Participant): boolean {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);
  const recentDates = Object.keys(p.attendance).filter((d) => {
    const date = new Date(d);
    return date >= twoWeeksAgo && date <= today;
  });
  return p.active && recentDates.filter((d) => p.attendance[d]).length === 0;
}

function getWeeklyAttendance(p: Participant) {
  const weeks: { label: string; days: { date: string; present: boolean | null }[] }[] = [];
  const allDates = Object.keys(p.attendance).sort();
  if (allDates.length === 0) return weeks;

  const start = new Date(allDates[0]);
  const end = new Date(allDates[allDates.length - 1]);
  const dayNames = ["Mån", "Tis", "Ons", "Tor"];

  const current = new Date(start);
  while (current.getDay() !== 1) current.setDate(current.getDate() - 1);

  while (current <= end) {
    const weekDays: { date: string; present: boolean | null }[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(current);
      d.setDate(current.getDate() + i);
      const key = d.toISOString().split("T")[0];
      weekDays.push({
        date: `${dayNames[i]} ${d.getDate()}/${d.getMonth() + 1}`,
        present: key in p.attendance ? p.attendance[key] : null,
      });
    }
    const oneJan = new Date(current.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((current.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
    );
    weeks.push({ label: `V${weekNum}`, days: weekDays });
    current.setDate(current.getDate() + 7);
  }

  return weeks.slice(-6).reverse();
}

export function DeltagareDetail({ participant: p }: { participant: Participant }) {
  const [message, setMessage] = useState("");
  const addTicket = useAddTicket();
  const { toast } = useToast();

  const exercisesDone = p.exercises.filter((e) => e.completed).length;
  const exercisesTotal = p.exercises.length;

  const weeks = getWeeklyAttendance(p);

  const sendToCoach = () => {
    if (!message.trim()) return;
    addTicket.mutate(
      { subject: `Uppdatering: ${p.firstName}`, message, type: "other" },
      {
        onSuccess: () => {
          toast({
            title: "Meddelande skickat",
            description: `Uppdatering skickad till ${p.coach} (${p.coachEmail})`,
          });
          setMessage("");
        },
        onError: () => {
          toast({
            title: "Fel",
            description: "Kunde inte skicka meddelandet.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground text-xl font-bold">
            {p.firstName.charAt(0)}
            {p.lastName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-xl font-bold text-foreground">
                {p.firstName} {p.lastName}
              </h2>
              <Badge variant={p.active ? "default" : "secondary"}>
                {p.active ? "Aktiv" : "Inaktiv"}
              </Badge>
              <Badge variant="outline">Spår {p.track}</Badge>
              {hasAbsenceAlert(p) && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Frånvaro &gt;2 veckor
                </Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {p.email}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Start: {p.startDate}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Coach: {p.coach}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                Lärare: {p.teacher}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-5">
          <h3 className="font-display font-semibold text-foreground">Progression</h3>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Övningar</span>
              <span className="font-medium text-foreground">
                {exercisesDone}/{exercisesTotal}
              </span>
            </div>
            <Progress
              value={exercisesTotal ? (exercisesDone / exercisesTotal) * 100 : 0}
              className="h-2"
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Projekt</p>
            <div className="space-y-2">
              {p.projects.map((pr) => (
                <div key={pr.name} className="flex items-center gap-2 text-sm">
                  {pr.status === "done" && <CheckCircle2 className="h-4 w-4 text-accent" />}
                  {pr.status === "in-progress" && <Clock className="h-4 w-4 text-primary" />}
                  {pr.status === "not-started" && (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-foreground">{pr.name}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    {pr.status === "done"
                      ? "Klar"
                      : pr.status === "in-progress"
                      ? "Pågår"
                      : "Ej startad"}
                  </Badge>
                </div>
              ))}
              {p.projects.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Inga projekt ännu.</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Övningar</p>
            <div className="space-y-1.5">
              {p.exercises.map((e) => (
                <div key={e.name} className="flex items-center gap-2 text-sm">
                  {e.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={e.completed ? "text-foreground" : "text-muted-foreground"}>
                    {e.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">Närvaro</h3>
            <Badge variant="outline" className="text-sm">
              {getAttendanceRate(p)}% närvarande
            </Badge>
          </div>

          {weeks.length > 0 ? (
            <div className="space-y-2">
              {weeks.map((w) => (
                <div key={w.label} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8 shrink-0 font-medium">
                    {w.label}
                  </span>
                  <div className="flex gap-1.5">
                    {w.days.map((d, i) => (
                      <div
                        key={i}
                        title={d.date}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-medium ${
                          d.present === true
                            ? "bg-accent/20 text-accent"
                            : d.present === false
                            ? "bg-destructive/15 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {d.present === true ? "✓" : d.present === false ? "✗" : "–"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Ingen närvarodata tillgänglig.
            </p>
          )}
        </div>
      </div>

      {/* Send update to coach */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-4">
        <h3 className="font-display font-semibold text-foreground">
          Skicka uppdatering till coach
        </h3>
        <p className="text-sm text-muted-foreground">
          Skicka en skriftlig uppdatering till{" "}
          <span className="font-medium text-foreground">{p.coach}</span>{" "}
          {p.coachEmail && `(${p.coachEmail})`}
        </p>
        <Textarea
          placeholder="Skriv din uppdatering här..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
        <Button
          onClick={sendToCoach}
          disabled={!message.trim() || addTicket.isPending}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {addTicket.isPending ? "Skickar..." : "Skicka till coach"}
        </Button>
      </div>
    </div>
  );
}
