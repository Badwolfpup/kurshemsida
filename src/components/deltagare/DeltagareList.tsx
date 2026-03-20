import { useState } from "react";
import { AlertTriangle, ChevronRight, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Participant } from "@/pages/Deltagare";
import { useUnreadCounts } from "@/hooks/useMessages";
import { AbsenceWarningDialog } from "./AbsenceWarningDialog";

export function hasAbsenceAlert(p: Participant): boolean {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);

  const recentDates = Object.keys(p.attendance).filter((d) => {
    const date = new Date(d);
    return date >= twoWeeksAgo && date <= today;
  });

  const recentPresent = recentDates.filter((d) => p.attendance[d]);
  return p.active && recentPresent.length === 0;
}

export function DeltagareList({
  participants,
  onSelect,
}: {
  participants: Participant[];
  onSelect: (id: number) => void;
}) {
  const { unreadStudentIds } = useUnreadCounts();
  const [warningTarget, setWarningTarget] = useState<Participant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const nameSort = (a: Participant, b: Participant) =>
    a.firstName.localeCompare(b.firstName, "sv") || a.lastName.localeCompare(b.lastName, "sv");
  const active = participants.filter((p) => p.active).sort((a, b) => {
    const aWarn = hasAbsenceAlert(a) ? 1 : 0;
    const bWarn = hasAbsenceAlert(b) ? 1 : 0;
    return aWarn - bWarn || nameSort(a, b);
  });
  const inactive = participants.filter((p) => !p.active).sort(nameSort);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {active.filter(hasAbsenceAlert).length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive text-sm">Frånvarovarning</p>
            <p className="text-sm text-destructive/80">
              {active
                .filter(hasAbsenceAlert)
                .map((p) => `${p.firstName} ${p.lastName.charAt(0)}.`)
                .join(", ")}{" "}
              har inte varit närvarande de senaste 2 veckorna.
            </p>
          </div>
        </div>
      )}

      {/* Active */}
      <div>
        <h2 className="font-display font-semibold text-foreground mb-3">
          Aktiva deltagare ({active.length})
        </h2>
        <div className="bg-card rounded-2xl shadow-card border border-border divide-y divide-border overflow-hidden">
          {active.length === 0 && (
            <p className="px-5 py-4 text-sm text-muted-foreground italic">Inga aktiva deltagare.</p>
          )}
          {active.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                  {p.firstName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                    <span className="truncate">{p.firstName} {p.lastName}</span>
                    {unreadStudentIds.has(p.id) && (
                      <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                    )}
                    {hasAbsenceAlert(p) && (
                      <>
                        <AlertTriangle className="inline h-3.5 w-3.5 text-destructive shrink-0" />
                        {p.coachEmail && (
                          <span onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setWarningTarget(p);
                                setDialogOpen(true);
                              }}
                              className="inline-flex items-center hover:text-destructive transition-colors"
                              aria-label="Skicka frånvarovarning"
                            >
                              <Mail className="inline h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </button>
                          </span>
                        )}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                  Spår {p.track}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-muted-foreground mb-3">
            Inaktiva ({inactive.length})
          </h2>
          <div className="bg-card rounded-2xl shadow-card border border-border divide-y divide-border overflow-hidden opacity-60">
            {inactive.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold">
                    {p.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
      <AbsenceWarningDialog
        participant={warningTarget}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
