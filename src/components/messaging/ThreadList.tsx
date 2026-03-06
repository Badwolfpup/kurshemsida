import type { ThreadType } from "@/Types/MessageType";
import { useAuth } from "@/contexts/AuthContext";

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Nu";
  if (diffMin < 60) return `${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d`;
  return date.toLocaleDateString("sv-SE");
}

interface ThreadListProps {
  threads: ThreadType[];
  selectedThreadId: number | null;
  onSelect: (thread: ThreadType) => void;
}

export default function ThreadList({ threads, selectedThreadId, onSelect }: ThreadListProps) {
  const { user } = useAuth();

  if (threads.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-card border border-border p-6 text-center text-muted-foreground">
        Inga konversationer
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const otherName =
          thread.user1Id === user?.id ? thread.user2Name : thread.user1Name;
        const isSelected = thread.id === selectedThreadId;
        const preview = thread.lastMessage
          ? `${thread.lastMessage.senderName}: ${thread.lastMessage.content}`
          : "Ingen meddelande ännu";
        const time = thread.lastMessage
          ? formatRelativeTime(thread.lastMessage.createdAt)
          : "";

        return (
          <button
            key={thread.id}
            onClick={() => onSelect(thread)}
            className={`w-full text-left p-4 rounded-xl border transition-colors ${
              isSelected
                ? "bg-accent border-primary/30"
                : "bg-card border-border hover:bg-accent/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {otherName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground truncate">
                    {otherName}
                    {thread.studentContextId && thread.studentContextName && (
                      <span className="text-muted-foreground text-xs ml-1.5">
                        (om {thread.studentContextName})
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {time && (
                      <span className="text-xs text-muted-foreground">{time}</span>
                    )}
                    {thread.hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {preview.length > 60 ? preview.slice(0, 60) + "..." : preview}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
