import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { User, Bot, AlertCircle, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const onCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : isError
              ? "bg-destructive/20 text-destructive"
              : "bg-secondary text-primary",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isError ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed overflow-hidden relative group/bubble",
          isUser
            ? "bg-primary text-primary-foreground"
            : isError
              ? "bg-destructive/10 border border-destructive/30 text-destructive"
              : "bg-secondary text-secondary-foreground",
        )}
      >
        <button
          onClick={() => {
            navigator.clipboard.writeText(message.content);
            setCopiedCode("MESSAGE_CONTENT"); // Reusing state key for simplicity or separate it
            setTimeout(() => setCopiedCode(null), 2000);
          }}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-md transition-all opacity-0 group-hover/bubble:opacity-100",
            isUser
              ? "hover:bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground"
              : "hover:bg-background/50 text-muted-foreground hover:text-foreground",
          )}
          title="Copy message"
        >
          {copiedCode === "MESSAGE_CONTENT" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>

        <div
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none break-words pr-6", // Added pr-6 to prevent text overlap with button
            isUser &&
              "text-primary-foreground prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-code:text-primary-foreground",
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({
                node,
                inline,
                className,
                children,
                ...props
              }: React.ComponentPropsWithoutRef<"code"> & {
                inline?: boolean;
                node?: any;
              }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (!inline && match) {
                  return (
                    <div className="relative my-4 rounded-md overflow-hidden border border-border bg-zinc-950">
                      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-border/40">
                        <span className="text-xs text-zinc-400 font-mono">
                          {match[1]}
                        </span>
                        <button
                          onClick={() => onCopy(codeString)}
                          className="hover:bg-zinc-800 p-1.5 rounded-md transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === codeString ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-zinc-400" />
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          padding: "1rem",
                          fontSize: "0.875rem",
                          backgroundColor: "transparent",
                        }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code
                    className={cn(
                      "bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-[0.9em]",
                      className,
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: ({ className, ...props }) => (
                <p
                  className={cn("mb-2 last:mb-0 leading-7", className)}
                  {...props}
                />
              ),
              ul: ({ className, ...props }) => (
                <ul
                  className={cn("my-4 ml-6 list-disc [&>li]:mt-2", className)}
                  {...props}
                />
              ),
              ol: ({ className, ...props }) => (
                <ol
                  className={cn(
                    "my-4 ml-6 list-decimal [&>li]:mt-2",
                    className,
                  )}
                  {...props}
                />
              ),
              li: ({ className, ...props }) => (
                <li className={cn("leading-7", className)} {...props} />
              ),
              a: ({ className, ...props }) => (
                <a
                  className={cn(
                    "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
                    className,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "mt-2 text-[10px] opacity-50 select-none",
            isUser ? "text-right" : "text-left",
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
