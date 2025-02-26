
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Archive, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface SidebarProps {
  chatHistory: Chat[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onArchiveChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  currentChatId?: string | null;
}

export function Sidebar({
  chatHistory,
  onNewChat,
  onSelectChat,
  onArchiveChat,
  onDeleteChat,
  currentChatId,
}: SidebarProps) {
  return (
    <div className="flex h-full w-[260px] flex-col border-r">
      <div className="flex flex-col gap-4 p-4">
        <Button onClick={onNewChat} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo chat
        </Button>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar conversas..." className="pl-8" />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 p-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="group relative flex items-center gap-2"
            >
              <Button
                variant={currentChatId === chat.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left pr-8"
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="line-clamp-1">{chat.title}</span>
                  <span className="text-xs text-muted-foreground">
                    { format( new Date(chat. created_at ) , "dd 'de' MMMM", { locale: ptBR } )}
                  </span>
                </div>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onArchiveChat(chat.id)}>
                    <Archive className="mr-2 h-4 w-4" />
                    Arquivar conversa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDeleteChat(chat.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir conversa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
