import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatSidebar } from "./ChatSidebar";
import { ChatSession } from "@/hooks/useChatSessions";
import { useState } from "react";

interface MobileChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
}

export function MobileChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
}: MobileChatSidebarProps) {
  const [open, setOpen] = useState(false);

  const handleSelectSession = (id: string) => {
    onSelectSession(id);
    setOpen(false);
  };

  const handleCreateSession = () => {
    onCreateSession();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={onDeleteSession}
          className="w-full h-full border-none"
        />
      </SheetContent>
    </Sheet>
  );
}
