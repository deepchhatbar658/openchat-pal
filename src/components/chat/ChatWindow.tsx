import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto animate-pulse-glow">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-mono text-foreground">Start a conversation</h2>
          <p className="text-sm text-muted-foreground font-mono">
            Send a message to begin chatting with the AI. Your conversation history will be saved locally.
          </p>
          <div className="pt-4 space-y-2">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Explain quantum computing', 'Write a haiku', 'Debug my code'].map((suggestion) => (
                <span
                  key={suggestion}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-xs font-mono"
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isLoading && <TypingIndicator />}
      
      <div ref={bottomRef} />
    </div>
  );
}
