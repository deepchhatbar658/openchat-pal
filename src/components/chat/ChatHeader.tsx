import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { Key, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: string[];
  onChangeApiKey: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
  leading?: React.ReactNode;
  onOpenSettings: () => void;
}

export function ChatHeader({
  selectedModel,
  onModelChange,
  models,
  onChangeApiKey,
  onClearChat,
  hasMessages,
  leading,
  onOpenSettings,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-20 px-3 sm:px-4 pt-3 sm:pt-4 animate-fade-in">
      <div className="glass rounded-2xl">
        <div className="flex items-center justify-between p-3 sm:p-4 gap-3">
          {/* Left: Mobile menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {leading}

            {/* Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-subtle flex items-center justify-center border border-primary/20">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
                    <path d="M12 12L20 7.5" />
                    <path d="M12 12V21" />
                    <path d="M12 12L4 7.5" />
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  PolyModel
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground/70 font-medium">
                  AI Assistant
                </p>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              models={models}
            />

            {hasMessages && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearChat}
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-xl",
                  "text-muted-foreground hover:text-destructive",
                  "hover:bg-destructive/10 transition-all duration-300",
                )}
                title="Clear Chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 rounded-xl",
                "text-muted-foreground hover:text-primary",
                "hover:bg-primary/10 transition-all duration-300",
              )}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onChangeApiKey}
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 rounded-xl",
                "text-muted-foreground hover:text-primary",
                "hover:bg-primary/10 transition-all duration-300",
              )}
              title="API Key"
            >
              <Key className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
