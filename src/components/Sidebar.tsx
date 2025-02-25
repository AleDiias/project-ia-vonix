
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  chatHistory: ChatHistory[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  currentChatId?: string;
}

export function Sidebar({ chatHistory, onNewChat, onSelectChat, currentChatId }: SidebarProps) {
  return (
    <div className="flex h-full w-[260px] flex-col border-r">
      <div className="flex flex-col gap-4 p-4">
        <Button 
          onClick={onNewChat}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo chat
        </Button>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar conversas..."
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 p-2">
          {chatHistory.map((chat) => (
            <Button
              key={chat.id}
              variant={currentChatId === chat.id ? "secondary" : "ghost"}
              className="w-full justify-start text-left"
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="line-clamp-1">{chat.title}</span>
                <span className="text-xs text-muted-foreground">
                  {chat.timestamp.toLocaleDateString()}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
