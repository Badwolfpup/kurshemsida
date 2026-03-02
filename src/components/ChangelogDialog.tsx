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
import { useChangelog } from '@/hooks/useChangelog';

const SESSION_KEY = 'changelog_shown';

export function ChangelogDialog() {
  const entries = useChangelog();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (entries.length === 0) return;
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setOpen(true);
    }
  }, [entries.length]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 text-sm">
          <History className="h-4 w-4" />
          <span className="topnav__nyheter-label">Ändringar</span>
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
