import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 sm:gap-4 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-subtle flex items-center justify-center">
        <Bot className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-primary" />
      </div>

      {/* Thinking bubble */}
      <div className="glass-subtle rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gradient-primary thinking-dot" />
          <span className="w-2 h-2 rounded-full bg-gradient-primary thinking-dot" />
          <span className="w-2 h-2 rounded-full bg-gradient-primary thinking-dot" />
        </div>
        <span className="text-sm text-muted-foreground ml-1">Thinking</span>
      </div>
    </div>
  );
}
