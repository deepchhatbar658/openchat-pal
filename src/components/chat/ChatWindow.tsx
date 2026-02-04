import { useEffect, useRef, useState, useCallback } from "react";
import { Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Sparkles, Zap, Code, Lightbulb, ArrowRight, ArrowDown } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestionClick?: (text: string) => void;
  onEditLast?: () => void;
  onRegenerateLast?: () => void;
  onQuoteMessage?: (message: Message, mode: "inline" | "block") => void;
  onReplyMessage?: (message: Message) => void;
  costPer1k?: number | null;
}

const suggestions = [
  {
    text: "Explain quantum computing in simple terms",
    icon: Lightbulb,
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    text: "Write a modern React component with TypeScript",
    icon: Code,
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    text: "Help me brainstorm creative ideas for my project",
    icon: Sparkles,
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    text: "Debug this code and explain the issue",
    icon: Zap,
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
];

export function ChatWindow({
  messages,
  isLoading,
  onSuggestionClick,
  onEditLast,
  onRegenerateLast,
  onQuoteMessage,
  onReplyMessage,
  costPer1k,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const lastResponseMessage = [...messages]
    .reverse()
    .find((message) => message.role !== "user");

  const checkIsNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 140;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsNearBottom(distanceFromBottom <= threshold);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    checkIsNearBottom();

    const handleScroll = () => {
      checkIsNearBottom();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [checkIsNearBottom]);

  useEffect(() => {
    if (!isNearBottom) return;
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: isLoading ? "smooth" : "auto" });
    }
  }, [messages, isLoading, isNearBottom]);

  useEffect(() => {
    setShowScrollButton(!isNearBottom && messages.length > 0);
  }, [isNearBottom, messages.length]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 overflow-hidden">
        <div className="text-center space-y-10 max-w-2xl w-full animate-fade-up">
          {/* Hero Section */}
          <div className="relative">
            {/* Orbital decoration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-primary/10 animate-pulse-soft" />
              <div className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full border border-primary/5 animate-breathing" />
            </div>

            {/* Main Icon */}
            <div className="relative mx-auto w-20 h-20 sm:w-28 sm:h-28">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-40 animate-breathing" />
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-xl opacity-30 animate-pulse-soft" />
              <div className="relative w-full h-full rounded-3xl glass flex items-center justify-center shadow-glow hover-scale cursor-default">
                <div className="absolute inset-0 rounded-3xl bg-gradient-primary opacity-10" />
                <Sparkles className="h-9 w-9 sm:h-12 sm:w-12 text-primary relative z-10" />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="text-foreground">How can I </span>
              <span className="text-gradient">help you</span>
              <span className="text-foreground"> today?</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Start a conversation with AI. Ask questions, get creative, or
              explore ideas together.
            </p>
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.text}
                  onClick={() => onSuggestionClick?.(suggestion.text)}
                  className={`
                    group relative text-left p-4 sm:p-5 rounded-2xl 
                    glass-subtle hover:glass-light
                    transition-all duration-300 
                    hover-lift active-press
                    animate-fade-up
                  `}
                  style={{ animationDelay: `${150 + index * 75}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`
                    absolute inset-0 rounded-2xl bg-gradient-to-br ${suggestion.gradient}
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  `}
                  />

                  <div className="relative flex items-start gap-3 sm:gap-4">
                    <div
                      className={`
                      flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl 
                      bg-gradient-to-br ${suggestion.gradient}
                      flex items-center justify-center
                      group-hover:scale-110 transition-transform duration-300
                    `}
                    >
                      <Icon className={`h-5 w-5 ${suggestion.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-snug line-clamp-2">
                        {suggestion.text}
                      </p>
                    </div>
                    <ArrowRight className="flex-shrink-0 h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 mt-0.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Subtle hint */}
          <p
            className="text-xs text-muted-foreground/50 animate-fade-in"
            style={{ animationDelay: "500ms" }}
          >
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-mono text-[10px]">
              Enter
            </kbd>{" "}
            to send a message
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {messages.map((message, index) => {
            const isStreamingMessage =
              isLoading &&
              index === messages.length - 1 &&
              message.role === "assistant";

            return (
              <MessageBubble
                key={message.id}
                message={message}
                index={index}
                isStreaming={isStreamingMessage}
                canEdit={
                  !isLoading &&
                  !!onEditLast &&
                  !!lastUserMessage &&
                  lastUserMessage.id === message.id
                }
                canRegenerate={
                  !isLoading &&
                  !!onRegenerateLast &&
                  !!lastResponseMessage &&
                  lastResponseMessage.id === message.id &&
                  message.role !== "user"
                }
                canQuote={!isLoading && !isStreamingMessage && !!onQuoteMessage}
                canReply={!isLoading && !isStreamingMessage && !!onReplyMessage}
                onEdit={onEditLast}
                onRegenerate={onRegenerateLast}
                onQuote={(mode) => onQuoteMessage?.(message, mode)}
                onReply={() => onReplyMessage?.(message)}
                costPer1k={costPer1k}
              />
            );
          })}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="animate-fade-in">
              <TypingIndicator />
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground shadow-glow-subtle hover:shadow-glow transition-all duration-200 flex items-center justify-center"
          title="Scroll to bottom"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
