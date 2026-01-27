import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      
      <div className="bg-secondary rounded-lg px-4 py-3 flex items-center gap-1">
        <span className="text-sm font-mono text-muted-foreground">AI is thinking</span>
        <div className="flex gap-1 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary thinking-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary thinking-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary thinking-dot" />
        </div>
      </div>
    </div>
  );
}
