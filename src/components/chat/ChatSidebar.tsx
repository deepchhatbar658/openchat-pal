import { Plus, MessageSquare, Trash2, History } from "lucide-react";
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
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className={cn(
        "w-72 lg:w-80 h-full flex flex-col relative",
        "m-3 sm:m-4 mr-0 rounded-2xl overflow-hidden",
        "glass animate-slide-in-right",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-subtle flex items-center justify-center border border-primary/20">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">History</h2>
            <p className="text-xs text-muted-foreground">
              {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <Button
          onClick={onCreateSession}
          className={cn(
            "w-full justify-center gap-2",
            "bg-gradient-primary text-primary-foreground",
            "hover:opacity-90 hover-lift",
            "transition-all duration-300 rounded-xl h-10",
          )}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl cursor-pointer",
                "transition-all duration-200",
                "hover:bg-muted/30",
                currentSessionId === session.id
                  ? "bg-primary/10 border border-primary/20"
                  : "border border-transparent",
                "animate-fade-in",
              )}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => onSelectSession(session.id)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  "transition-colors duration-200",
                  currentSessionId === session.id
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/50 text-muted-foreground group-hover:text-foreground",
                )}
              >
                <MessageSquare className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate transition-colors duration-200",
                    currentSessionId === session.id
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {session.title || "New Chat"}
                </p>
                <p className="text-[11px] text-muted-foreground/60">
                  {formatDate(session.createdAt)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className={cn(
                  "p-1.5 rounded-lg flex-shrink-0",
                  "text-muted-foreground/50 hover:text-destructive",
                  "hover:bg-destructive/10",
                  "opacity-0 group-hover:opacity-100",
                  "transition-all duration-200",
                )}
                title="Delete chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-12 px-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                No chats yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Start a new conversation
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/30">
        <div className="glass-subtle rounded-xl p-3 text-center">
          <p className="text-[11px] text-muted-foreground/60">
            Stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
