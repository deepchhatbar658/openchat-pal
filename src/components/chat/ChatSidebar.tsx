import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/hooks/useChatSessions";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  className?: string;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  className,
}: ChatSidebarProps) {
  return (
    <div
      className={cn(
        "w-64 border-r border-border h-full flex flex-col bg-background/50 backdrop-blur-sm",
        className,
      )}
    >
      <div className="p-4 border-b border-border">
        <Button
          onClick={onCreateSession}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
                currentSessionId === session.id && "bg-accent",
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 truncate text-sm font-medium">
                {session.title || "New Chat"}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                title="Delete chat"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              No chats yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
