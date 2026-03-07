import { useState } from "react";
import { CircleHelp, CirclePlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { helpContent } from "@/helptext/helpContent";
import { helpVideos } from "@/helptext/helpVideos";
import { HelpVideoModal } from "@/components/HelpVideoModal";

interface HelpDialogProps {
  helpKey: string;
}

const HelpDialog = ({ helpKey }: HelpDialogProps) => {
  const [videoOpen, setVideoOpen] = useState(false);

  const entry = helpContent[helpKey];
  if (!entry) return null;

  const videoId = helpVideos[helpKey];

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground">
            <CircleHelp className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 flex flex-col p-0" align="end">
          {/* Static help text */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-sm">{entry.title}</h3>
            {entry.content.map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {line}
              </p>
            ))}
          </div>

          {/* Video thumbnail */}
          {videoId && (
            <>
              <div className="border-t border-border" />
              <button
                onClick={() => setVideoOpen(true)}
                className="relative group cursor-pointer m-3 rounded-md overflow-hidden"
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt="Hjälpvideo"
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <CirclePlay className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {videoId && (
        <HelpVideoModal
          videoId={videoId}
          open={videoOpen}
          onOpenChange={setVideoOpen}
        />
      )}
    </>
  );
};

export default HelpDialog;
