import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import type { ChangelogItem } from '@/hooks/useChangelog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useChangelog, getLatestChangelogDate } from '@/hooks/useChangelog';
import { useUserRole } from '@/hooks/useUserRole';

const LS_KEY = 'changelog_last_seen';

export function ChangelogDialog() {
  const entries = useChangelog();
  const [open, setOpen] = useState(false);
  const { isCoach, isStudent } = useUserRole();

  const latestDate = getLatestChangelogDate();

  // Show dot for Coach/Student when latest entry is less than 7 days old
  const showDot = (() => {
    if (!latestDate || (!isCoach && !isStudent)) return false;
    const entryDate = new Date(latestDate);
    const now = new Date();
    const diffDays = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  })();

  // Auto-open on login if there's a new entry the user hasn't seen
  useEffect(() => {
    if (entries.length === 0 || !latestDate) return;
    const lastSeen = localStorage.getItem(LS_KEY);
    if (!lastSeen || latestDate > lastSeen) {
      setOpen(true);
      // Signal for Nyheter popup coordination — set immediately on open
      // so NewsDialog's useEffect sees it before deciding to auto-open
      sessionStorage.setItem('changelog_popup_fired', 'true');
    }
  }, [entries.length, latestDate]);

  // When dialog is dismissed, mark as seen
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      localStorage.setItem(LS_KEY, new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-muted-foreground gap-2 text-sm">
          <History className="h-4 w-4" />
          <span className="topnav__nyheter-label">Ändringar</span>
          {showDot && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Ändringar</DialogTitle>
        </DialogHeader>

        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm mt-2">Inga ändringar att visa ännu.</p>
        ) : (
          <div className="space-y-6 mt-2">
            {entries.map(({ displaydate, items }) => (
              <div key={displaydate}>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {new Date(displaydate).toLocaleDateString('sv-SE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <div className="bg-muted/50 rounded-xl p-4">
                  <ul className="space-y-1 list-disc list-inside">
                    {items.map((item, i) => (
                      <li key={i} className="text-muted-foreground text-sm leading-relaxed">
                        {typeof item === 'string' ? item : (
                          <>
                            {item.text}
                            <ul className="mt-1 ml-4 space-y-0.5 list-[circle] list-inside">
                              {item.children.map((child, j) => (
                                <li key={j} className="text-muted-foreground text-sm leading-relaxed">
                                  {child}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
