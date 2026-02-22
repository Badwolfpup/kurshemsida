import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface FeedbackData {
  isPositive: boolean;
  reason?: string;
  comment?: string;
}

interface ExerciseFeedbackDialogProps {
  open: boolean;
  mode: "completed" | "abandoned";
  onSubmit: (feedback: FeedbackData) => void;
  reasons?: string[];
}

const FEEDBACK_REASONS = [
  "Övningen var för svår",
  "Övningen var för lätt",
  "Instruktionerna var oklara",
  "Testfallen var felaktiga",
  "Annat",
];

const ExerciseFeedbackDialog = ({ open, mode, onSubmit, reasons }: ExerciseFeedbackDialogProps) => {
  const activeReasons = reasons ?? FEEDBACK_REASONS;
  const [view, setView] = useState<"thumbs" | "reasons">(mode === "abandoned" ? "reasons" : "thumbs");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setView(mode === "abandoned" ? "reasons" : "thumbs");
      setSelectedReason(null);
      setComment("");
    }
  }, [open, mode]);

  const resetState = () => {
    setSelectedReason(null);
    setComment("");
  };

  const handleThumbsUp = () => {
    onSubmit({ isPositive: true });
    resetState();
  };

  const handleThumbsDown = () => {
    setView("reasons");
  };

  const handleSubmitReasons = () => {
    if (!selectedReason) return;
    onSubmit({
      isPositive: false,
      reason: selectedReason,
      comment: comment.trim() || undefined,
    });
    resetState();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="top-[30%] translate-y-0 sm:top-[30%] sm:translate-y-0"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {view === "thumbs" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-2xl">
                Bra jobbat!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Alla testfall godkända. Vad tyckte du om övningen?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-center gap-6 py-6">
              <button
                onClick={handleThumbsUp}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-border hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
              >
                <ThumbsUp className="h-10 w-10 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-muted-foreground">Bra övning</span>
              </button>
              <button
                onClick={handleThumbsDown}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-border hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <ThumbsDown className="h-10 w-10 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-muted-foreground">Kan förbättras</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-xl">
                {mode === "abandoned" ? "Vad tyckte du om övningen?" : "Vad kan förbättras?"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {mode === "abandoned"
                  ? "Berätta varför du vill byta övning."
                  : "Hjälp oss förbättra övningarna genom din feedback."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              {activeReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    selectedReason === reason
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground/30 text-foreground"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Valfri kommentar..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <AlertDialogFooter>
              <Button
                onClick={handleSubmitReasons}
                disabled={!selectedReason}
                className="w-full"
              >
                Skicka
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExerciseFeedbackDialog;
