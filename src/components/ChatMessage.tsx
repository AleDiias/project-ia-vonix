
import { ChatMessage as MessageType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: MessageType;
  onTextToSpeech: (text: string) => void;
}

export function ChatMessage({ message, onTextToSpeech }: ChatMessageProps) {
  const isAI = message.role === "assistant";

  return (
    <div
      className={cn(
        "group flex w-full items-start gap-2 py-2 animate-message-appear",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "relative flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3 text-sm",
          isAI
            ? "bg-chat-ai text-white"
            : "bg-chat-user text-primary-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {isAI && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-10 top-2 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onTextToSpeech(message.content)}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
