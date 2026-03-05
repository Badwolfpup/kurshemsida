import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePosts } from "@/hooks/usePosts";

const LS_KEY = 'nyheter_last_seen';

export function NewsDialog() {
  const { data: posts = [], isLoading } = usePosts();
  const [open, setOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const upcoming = posts
    .filter((p) => new Date(p.publishedAt) >= today)
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

  const past = posts
    .filter((p) => new Date(p.publishedAt) < today)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  // Blue dot: show when at least one post has publishedAt within next 7 days
  const showDot = posts.some((p) => {
    const pubDate = new Date(p.publishedAt);
    pubDate.setHours(0, 0, 0, 0);
    const diffDays = (pubDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  // Auto-open popup on login (only if changelog didn't fire)
  useEffect(() => {
    if (isLoading || posts.length === 0) return;

    // Changelog takes priority — if it fired this session, skip Nyheter popup
    if (sessionStorage.getItem('changelog_popup_fired') === 'true') return;

    const lastSeen = localStorage.getItem(LS_KEY);

    // Check: any post with publishedAt newer than lastSeen (new post user hasn't seen)
    const hasNewPost = posts.some((p) => {
      const pubStr = new Date(p.publishedAt).toISOString().split('T')[0];
      return !lastSeen || pubStr > lastSeen;
    });

    // Check: any post with publishedAt within 3 days from today, and lastSeen is not today
    const hasUpcoming = lastSeen !== todayStr && posts.some((p) => {
      const pubDate = new Date(p.publishedAt);
      pubDate.setHours(0, 0, 0, 0);
      const diffDays = (pubDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 3;
    });

    if (hasNewPost || hasUpcoming) {
      setOpen(true);
    }
  }, [isLoading, posts.length]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      localStorage.setItem(LS_KEY, todayStr);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 text-sm relative">
          <Bell className="h-4 w-4" />
          <span className="topnav__nyheter-label">Nyheter</span>
          {showDot && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Nyheter</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-3 mt-2">
              <h3 className="font-display font-semibold text-foreground">Kommande</h3>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground text-sm">Inga kommande nyheter.</p>
              ) : (
                upcoming.map((p) => (
                  <div key={p.id} className="bg-muted/50 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground text-sm">{p.author || "Okänd"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.publishedAt).toLocaleDateString("sv-SE")}
                      </span>
                    </div>
                    <div
                      className="text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.html || "") }}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 mt-4">
              <h3 className="font-display font-semibold text-foreground">Tidigare</h3>
              {past.length === 0 ? (
                <p className="text-muted-foreground text-sm">Inga tidigare nyheter.</p>
              ) : (
                past.map((p) => (
                  <div key={p.id} className="bg-muted/30 rounded-xl p-4 space-y-1 opacity-75">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground text-sm">{p.author || "Okänd"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.publishedAt).toLocaleDateString("sv-SE")}
                      </span>
                    </div>
                    <div
                      className="text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.html || "") }}
                    />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
