import { useState } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSubmitBugReport } from "@/hooks/useBugReports";

export default function FeedbackForm() {
  const { toast } = useToast();
  const submitBugReport = useSubmitBugReport();
  const [bugReport, setBugReport] = useState("");
  const [reportType, setReportType] = useState<"bug" | "idea">("bug");

  const handleSubmitReport = () => {
    if (!bugReport.trim()) return;
    submitBugReport.mutate(
      { type: reportType, content: bugReport },
      {
        onSuccess: () => {
          toast({
            title: reportType === "bug" ? "Buggrapport skickad" : "Idé skickad",
            description: "Tack för din feedback!",
          });
          setBugReport("");
        },
      }
    );
  };

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-6">
      <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
        <Bug className="h-5 w-5" /> Feedback
      </h2>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setReportType("bug")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            reportType === "bug"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Bugg
        </button>
        <button
          onClick={() => setReportType("idea")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            reportType === "idea"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Idé
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {reportType === "bug"
          ? "Hittade du något som inte fungerar? Beskriv det nedan."
          : "Har du en idé för förbättring? Beskriv den nedan."}
      </p>
      <Textarea
        placeholder={reportType === "bug" ? "Beskriv buggen..." : "Beskriv din idé..."}
        value={bugReport}
        onChange={(e) => setBugReport(e.target.value)}
        rows={4}
      />
      <Button
        className="mt-3"
        onClick={handleSubmitReport}
        disabled={!bugReport.trim() || submitBugReport.isPending}
      >
        {reportType === "bug" ? "Skicka rapport" : "Skicka idé"}
      </Button>
    </div>
  );
}
