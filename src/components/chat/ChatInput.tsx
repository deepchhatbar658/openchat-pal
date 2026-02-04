import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export function ChatInput({
  onSend,
  onStop,
  disabled,
  isLoading,
  value,
  onChange,
  inputRef,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef ?? internalRef;

  const isControlled = value !== undefined && onChange !== undefined;
  const messageValue = isControlled ? value : message;
  const setMessageValue = (nextValue: string) => {
    if (isControlled && onChange) {
      onChange(nextValue);
    } else {
      setMessage(nextValue);
    }
  };

  const handleSubmit = () => {
    if (messageValue.trim() && !disabled) {
      onSend(messageValue);
      setMessageValue("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [messageValue, textareaRef]);

  const hasContent = messageValue.trim().length > 0;

  return (
    <div
      className="p-3 sm:p-4 animate-fade-up"
      style={{ animationDelay: "100ms" }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={cn(
            "relative glass rounded-2xl transition-all duration-300",
            isFocused && "ring-1 ring-primary/30 shadow-glow-subtle",
          )}
        >
          {/* Gradient border effect when focused */}
          {isFocused && (
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-primary opacity-20 blur-sm pointer-events-none" />
          )}

          <div className="relative flex items-end gap-2 p-2 sm:p-3">
            {/* Input area */}
            <div className="flex-1 relative min-w-0">
              <Textarea
                ref={textareaRef}
                value={messageValue}
                onChange={(e) => setMessageValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Message PolyModel..."
                disabled={disabled}
                rows={1}
                className={cn(
                  "w-full resize-none bg-transparent border-0",
                  "text-foreground placeholder:text-muted-foreground/50",
                  "text-sm sm:text-base leading-relaxed",
                  "min-h-[44px] sm:min-h-[48px] max-h-[200px]",
                  "py-3 px-3 sm:px-4",
                  "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  "transition-colors duration-200",
                )}
              />
            </div>

            {/* Send / Stop button */}
            {isLoading ? (
              <Button
                onClick={onStop}
                size="icon"
                className={cn(
                  "h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex-shrink-0",
                  "transition-all duration-300 active:scale-95",
                  "bg-destructive/15 text-destructive hover:bg-destructive/25",
                )}
                title="Stop generating"
              >
                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-sm bg-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!hasContent || disabled}
                size="icon"
                className={cn(
                  "h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex-shrink-0",
                  "transition-all duration-300 active:scale-95",
                  hasContent && !disabled
                    ? "bg-gradient-primary text-primary-foreground shadow-glow-subtle hover:shadow-glow hover:scale-105"
                    : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed",
                )}
                title="Send"
              >
                <Send
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300",
                    hasContent && "translate-x-0.5 -translate-y-0.5",
                  )}
                />
              </Button>
            )}
          </div>
        </div>

        {/* Subtle footer hint */}
        <div className="flex justify-center mt-2.5 sm:mt-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground/40">
            <kbd className="px-1 py-0.5 rounded bg-muted/30 font-mono text-[9px] sm:text-[10px]">
              Shift + Enter
            </kbd>
            <span className="mx-1.5">for new line</span>
          </p>
        </div>
      </div>
    </div>
  );
}
