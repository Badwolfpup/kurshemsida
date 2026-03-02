import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { helpContent } from "@/helptext/helpContent";

interface HelpDialogProps {
  helpKey: string;
}

const HelpDialog = ({ helpKey }: HelpDialogProps) => {
  const entry = helpContent[helpKey];
  if (!entry) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground">
          <CircleHelp className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{entry.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          {entry.content.map((line, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
