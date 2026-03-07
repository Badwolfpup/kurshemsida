import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface HelpVideoModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpVideoModal({ videoId, open, onOpenChange }: HelpVideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[50vw] p-0 overflow-hidden [&>button]:hidden">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {open && (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&fs=0`}
              allow="autoplay; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Hjälpvideo"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
