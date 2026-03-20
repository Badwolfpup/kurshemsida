import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLastAttendedDate, useSendAbsenceWarning } from "@/hooks/useAbsenceWarning";
import type { Participant } from "@/pages/Deltagare";

type Mode = "pregenerated" | "custom";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AbsenceWarningDialog({
  participant,
  open,
  onOpenChange,
}: {
  participant: Participant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>("pregenerated");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const { toast } = useToast();

  const { data: lastAttendedData, isLoading: isLoadingDate } =
    useLastAttendedDate(open ? participant?.id ?? null : null);

  const sendMutation = useSendAbsenceWarning();

  const initials = participant
    ? `${participant.firstName.charAt(0)}${participant.lastName.charAt(0)}`
    : "";

  const dateStr = useMemo(() => {
    if (lastAttendedData?.lastAttendedDate) {
      return formatDate(lastAttendedData.lastAttendedDate);
    }
    if (participant?.startDate) {
      return formatDate(participant.startDate);
    }
    return "okänt datum";
  }, [lastAttendedData, participant?.startDate]);

  const pregeneratedSubject = `Frånvarovarning ${initials}`;
  const pregeneratedBody = `${initials} har inte varit närvarande sedan ${dateStr} och heller inte meddelat oss orsaken.`;

  const handleSend = () => {
    if (!participant?.coachEmail) return;

    const subject = mode === "pregenerated" ? pregeneratedSubject : (customSubject.trim() || pregeneratedSubject);
    const body = mode === "pregenerated" ? pregeneratedBody : customBody;

    if (!body.trim()) {
      toast({ title: "Meddelande krävs", variant: "destructive" });
      return;
    }

    sendMutation.mutate(
      { coachEmail: participant.coachEmail, subject, body },
      {
        onSuccess: () => {
          toast({ title: "Frånvarovarning skickad" });
          onOpenChange(false);
          setMode("pregenerated");
          setCustomSubject("");
          setCustomBody("");
        },
        onError: () => {
          toast({
            title: "Fel",
            description: "Kunde inte skicka varningen.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skicka frånvarovarning</DialogTitle>
          <DialogDescription>
            Skickas till: {participant.coach} ({participant.coachEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === "pregenerated" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("pregenerated")}
            >
              Förgenerat meddelande
            </Button>
            <Button
              variant={mode === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("custom")}
            >
              Eget meddelande
            </Button>
          </div>

          {mode === "pregenerated" ? (
            <div className="space-y-2">
              {isLoadingDate ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <p className="text-sm font-medium">{pregeneratedSubject}</p>
                  <p className="text-sm text-muted-foreground">{pregeneratedBody}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Ämne</Label>
                <Input
                  id="subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder={`Frånvarovarning ${initials}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="body">Meddelande</Label>
                <Textarea
                  id="body"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Skriv ditt meddelande..."
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              sendMutation.isPending ||
              (mode === "pregenerated" && isLoadingDate)
            }
          >
            {sendMutation.isPending ? "Skickar..." : "Skicka"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
