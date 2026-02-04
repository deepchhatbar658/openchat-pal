import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import {
  User,
  Bot,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Pencil,
  Quote,
  CornerUpLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  message: Message;
  index?: number;
  isStreaming?: boolean;
  canEdit?: boolean;
  canRegenerate?: boolean;
  canQuote?: boolean;
  canReply?: boolean;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onQuote?: (mode: "inline" | "block") => void;
  onReply?: () => void;
  costPer1k?: number | null;
}

export function MessageBubble({
  message,
  index = 0,
  isStreaming = false,
  canEdit = false,
  canRegenerate = false,
  canQuote = false,
  canReply = false,
  onEdit,
  onRegenerate,
  onQuote,
  onReply,
  costPer1k = null,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formattedTime = useMemo(() => {
    return new Date(message.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [message.timestamp]);

  const usage = message.usage;
  const totalTokens =
    usage?.totalTokens ??
    (usage?.promptTokens !== undefined || usage?.completionTokens !== undefined
      ? (usage?.promptTokens ?? 0) + (usage?.completionTokens ?? 0)
      : undefined);

  const isFreeModel = message.model?.includes(":free") ?? false;
  const hasCostInput = typeof costPer1k === "number" && costPer1k >= 0;

  const formatUsd = (value: number) => {
    const fixed = value < 0.01 ? value.toFixed(4) : value.toFixed(2);
    return `$${fixed}`;
  };

  const costFromApi =
    typeof message.costUsd === "number" ? message.costUsd : undefined;
  const estimatedCost =
    costFromApi === undefined &&
    !isFreeModel &&
    hasCostInput &&
    totalTokens !== undefined
      ? (totalTokens / 1000) * (costPer1k as number)
      : undefined;

  const costLabel =
    costFromApi !== undefined
      ? formatUsd(costFromApi)
      : isFreeModel
        ? "$0.00"
        : estimatedCost !== undefined
          ? `~${formatUsd(estimatedCost)}`
          : undefined;

  const tokenLabel = totalTokens !== undefined
    ? `${usage?.estimated ? "~" : ""}${totalTokens} tok`
    : undefined;

  const breakdownLabel =
    usage?.promptTokens !== undefined || usage?.completionTokens !== undefined
      ? `(${usage?.promptTokens ?? 0} in / ${usage?.completionTokens ?? 0} out)`
      : undefined;

  const tokenPart = tokenLabel
    ? `Tokens: ${tokenLabel}${breakdownLabel ? ` ${breakdownLabel}` : ""}`
    : null;

  const metaLabel =
    !isUser && (tokenPart || costLabel)
      ? [tokenPart, costLabel ? `Cost: ${costLabel}` : null]
          .filter(Boolean)
          .join(" • ")
      : null;

  const actionBase = cn(
    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
    isUser
      ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
      : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40",
  );

  const copyLabel = isUser ? "Copy prompt" : isError ? "Copy error" : "Copy response";

  return (
    <div
      className={cn(
        "group flex gap-3 sm:gap-4 animate-message-pop",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300",
          isUser
            ? "bg-gradient-primary text-primary-foreground shadow-glow-subtle"
            : isError
              ? "bg-destructive/15 text-destructive border border-destructive/20"
              : "glass-subtle text-primary",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        ) : isError ? (
          <AlertCircle className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        ) : (
          <Bot className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[80%] rounded-2xl transition-all duration-300",
          isUser
            ? "bg-gradient-primary text-primary-foreground px-4 sm:px-5 py-3 sm:py-3.5 shadow-glow-subtle"
            : isError
              ? "glass-subtle border border-destructive/20 text-destructive px-4 sm:px-5 py-3 sm:py-3.5"
              : "glass-subtle px-4 sm:px-5 py-3 sm:py-4",
        )}
      >
        {/* Copy button */}
        <button
          onClick={() => handleCopy(message.content, "msg-" + message.id)}
          className={cn(
            "absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-all duration-300",
            "opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95",
            isUser
              ? "hover:bg-white/10 text-primary-foreground/60 hover:text-primary-foreground"
              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
          )}
          title="Copy message"
        >
          {copiedId === "msg-" + message.id ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Markdown content */}
        <div
          className={cn(
            "prose prose-sm max-w-none break-words pr-6 leading-relaxed",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-p:leading-relaxed prose-li:leading-relaxed",
            "prose-code:font-mono prose-code:text-[0.9em]",
            isUser
              ? "text-primary-foreground prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-a:text-primary-foreground/90"
              : "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary",
            isStreaming && !isUser && "streaming-text",
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
                node?: unknown;
              }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (!inline && match) {
                  return (
                    <div className="relative my-4 rounded-xl overflow-hidden border border-border/40 bg-[#1e1e1e]">
                      {/* Code header */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-black/20">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                          </div>
                          <span className="text-xs text-muted-foreground/70 font-mono uppercase tracking-wide">
                            {match[1]}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(codeString, codeString)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                          title="Copy code"
                        >
                          {copiedId === codeString ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          padding: "1.25rem",
                          fontSize: "0.85rem",
                          lineHeight: 1.6,
                          backgroundColor: "transparent",
                        }}
                        codeTagProps={{
                          style: {
                            fontFamily: "'JetBrains Mono', monospace",
                          },
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
                      "bg-muted/40 px-1.5 py-0.5 rounded-md font-mono text-[0.9em]",
                      isUser && "bg-white/15",
                      className,
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: ({ className, ...props }) => (
                <p className={cn("mb-3 last:mb-0", className)} {...props} />
              ),
              ul: ({ className, ...props }) => (
                <ul
                  className={cn("my-3 ml-4 list-disc space-y-1.5", className)}
                  {...props}
                />
              ),
              ol: ({ className, ...props }) => (
                <ol
                  className={cn(
                    "my-3 ml-4 list-decimal space-y-1.5",
                    className,
                  )}
                  {...props}
                />
              ),
              li: ({ className, ...props }) => (
                <li className={cn(className)} {...props} />
              ),
              a: ({ className, ...props }) => (
                <a
                  className={cn(
                    "underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors",
                    className,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              h1: ({ className, ...props }) => (
                <h1
                  className={cn(
                    "text-xl font-bold mb-3 mt-5 first:mt-0",
                    className,
                  )}
                  {...props}
                />
              ),
              h2: ({ className, ...props }) => (
                <h2
                  className={cn(
                    "text-lg font-semibold mb-2.5 mt-4 first:mt-0",
                    className,
                  )}
                  {...props}
                />
              ),
              h3: ({ className, ...props }) => (
                <h3
                  className={cn(
                    "text-base font-semibold mb-2 mt-3 first:mt-0",
                    className,
                  )}
                  {...props}
                />
              ),
              blockquote: ({ className, ...props }) => (
                <blockquote
                  className={cn(
                    "border-l-2 border-primary/40 pl-4 italic my-3 text-muted-foreground",
                    className,
                  )}
                  {...props}
                />
              ),
              hr: ({ className, ...props }) => (
                <hr
                  className={cn("my-4 border-border/50", className)}
                  {...props}
                />
              ),
              table: ({ className, ...props }) => (
                <div className="my-4 overflow-x-auto rounded-lg border border-border/40">
                  <table
                    className={cn("w-full text-sm", className)}
                    {...props}
                  />
                </div>
              ),
              th: ({ className, ...props }) => (
                <th
                  className={cn(
                    "px-3 py-2 text-left font-semibold bg-muted/30 border-b border-border/40",
                    className,
                  )}
                  {...props}
                />
              ),
              td: ({ className, ...props }) => (
                <td
                  className={cn(
                    "px-3 py-2 border-b border-border/30",
                    className,
                  )}
                  {...props}
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Actions + Timestamp */}
        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px] select-none font-medium tracking-wide",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          {canEdit && onEdit && (
            <button className={actionBase} onClick={onEdit} title="Edit last message">
              <Pencil className="h-3 w-3" />
              <span>Edit</span>
            </button>
          )}
          {canRegenerate && onRegenerate && (
            <button
              className={actionBase}
              onClick={onRegenerate}
              title="Regenerate last response"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Regenerate</span>
            </button>
          )}
          <button
            className={actionBase}
            onClick={() => handleCopy(message.content, "msg-" + message.id)}
            title="Copy message"
          >
            <Copy className="h-3 w-3" />
            <span>{copyLabel}</span>
          </button>
          {canQuote && onQuote && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={actionBase} title="Quote message" type="button">
                  <Quote className="h-3 w-3" />
                  <span>Quote</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isUser ? "end" : "start"}
                className="glass border-border/30"
              >
                <DropdownMenuItem onClick={() => onQuote("inline")}>
                  Inline quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onQuote("block")}>
                  Blockquote
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {canReply && onReply && (
            <button className={actionBase} onClick={onReply} title="Reply to message">
              <CornerUpLeft className="h-3 w-3" />
              <span>Reply</span>
            </button>
          )}
          {metaLabel && (
            <span
              className={cn(
                isUser
                  ? "text-primary-foreground/50"
                  : "text-muted-foreground/60",
              )}
            >
              {metaLabel}
            </span>
          )}
          <span
            className={cn(
              isUser
                ? "text-primary-foreground/50"
                : "text-muted-foreground/50",
            )}
          >
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
}
