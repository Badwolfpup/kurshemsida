import { useState } from "react";
import { useBugReports } from "@/hooks/useBugReports";

type BugTab = "bug" | "idea";

export default function AdminBugReports() {
  const [tab, setTab] = useState<BugTab>("bug");
  const { data: reports = [], isLoading } = useBugReports();

  const filtered = reports.filter((r) =>
    tab === "bug" ? r.type === "bug" : r.type === "idea"
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("bug")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "bug"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Buggar
        </button>
        <button
          onClick={() => setTab("idea")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "idea"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Idéer
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 text-center text-muted-foreground">
          {tab === "bug" ? "Inga buggar rapporterade" : "Inga idéer inskickade"}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="bg-card rounded-2xl shadow-card border border-border p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">
                  {report.senderName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(report.createdAt).toLocaleDateString("sv-SE")}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {report.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
