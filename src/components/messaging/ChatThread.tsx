import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThreadMessages, useSendMessage, useMarkThreadViewed } from "@/hooks/useMessages";

interface ChatThreadProps {
  threadId: number | null;
  recipientId: number;
  studentContextId?: number | null;
}

export default function ChatThread({ threadId, recipientId, studentContextId }: ChatThreadProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [take, setTake] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useThreadMessages(threadId, take);
  const sendMessage = useSendMessage();
  const markViewed = useMarkThreadViewed();
  const prevMessageCountRef = useRef(0);

  // Mark thread as viewed on open and when genuinely new messages arrive
  useEffect(() => {
    if (threadId) {
      markViewed.mutate(threadId);
    }
    prevMessageCountRef.current = 0;
  }, [threadId]);

  useEffect(() => {
    if (!threadId || messages.length === 0) return;
    // Only mark viewed when count increases from new messages, not from "show more"
    const latestMessage = messages[0]; // newest first from API
    if (latestMessage && latestMessage.senderId !== user?.id && prevMessageCountRef.current > 0 && messages.length > prevMessageCountRef.current) {
      markViewed.mutate(threadId);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    sendMessage.mutate(
      {
        recipientId,
        content: trimmed,
        studentContextId: studentContextId ?? null,
      },
      {
        onSuccess: () => {
          setMessageText("");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Messages come newest-first from API, reverse for display
  const displayMessages = [...messages].reverse();

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border flex flex-col">
      {/* Messages area */}
      <div className="p-4 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : displayMessages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Inga meddelanden ännu. Skriv det första!
          </p>
        ) : (
          <>
            {/* Show more / show fewer controls */}
            <div className="flex justify-center gap-2">
              {messages.length >= take && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTake((t) => t + 5)}
                  className="text-xs gap-1"
                >
                  <ChevronUp className="w-3 h-3" />
                  Visa fler
                </Button>
              )}
              {take > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTake(5)}
                  className="text-xs gap-1"
                >
                  <ChevronDown className="w-3 h-3" />
                  Visa färre
                </Button>
              )}
            </div>

            {displayMessages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleString("sv-SE", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-3 flex gap-2">
        <Textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Skriv ett meddelande..."
          className="min-h-[40px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!messageText.trim() || sendMessage.isPending}
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
