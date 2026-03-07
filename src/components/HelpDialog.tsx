import { useState, useRef, useEffect } from "react";
import { CircleHelp, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { helpContent } from "@/helptext/helpContent";
import { useHelpbot } from "@/hooks/useHelpbot";

interface HelpDialogProps {
  helpKey: string;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

const HelpDialog = ({ helpKey }: HelpDialogProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const helpbot = useHelpbot();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const entry = helpContent[helpKey];
  if (!entry) return null;

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || helpbot.isPending) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");

    helpbot.mutate(
      { message: trimmed, history: updated.slice(0, -1) },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply },
          ]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Något gick fel. Försök igen." },
          ]);
        },
      }
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground">
          <CircleHelp className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[28rem] flex flex-col p-0" align="end">
        {/* Static help text */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm">{entry.title}</h3>
          {entry.content.map((line, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {line}
            </p>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[8rem] max-h-[14rem]">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Ställ en fråga om sidan...
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-xs rounded-lg px-3 py-2 max-w-[90%] ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {helpbot.isPending && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Tänker...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-2 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Skriv en fråga..."
            className="text-xs h-8"
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || helpbot.isPending}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HelpDialog;
