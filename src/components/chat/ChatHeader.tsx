import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { Key, Trash2, Terminal, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: string[]; // Added models prop
  onChangeApiKey: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
  leading?: React.ReactNode;
  onOpenSettings: () => void;
}

export function ChatHeader({
  selectedModel,
  onModelChange,
  models, // Added models destructuring
  onChangeApiKey,
  onClearChat,
  hasMessages,
  leading,
  onOpenSettings,
}: ChatHeaderProps) {
  const getModelShortName = (model: string) => {
    const parts = model.split("/");
    if (parts.length > 1) {
      return parts[1].replace(":free", "");
    }
    return model;
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {leading}
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-mono font-semibold text-foreground hidden sm:block">
              PolyModel
            </h1>
            <p className="text-xs text-muted-foreground font-mono hidden sm:block">
              OpenRouter Chat
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            models={models}
          />

          {hasMessages && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearChat}
              className="border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 font-mono text-xs px-2 sm:px-3"
              title="Clear Chat"
            >
              <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="border-border text-muted-foreground hover:text-primary hover:border-primary/50 font-mono text-xs px-2 sm:px-3"
            title="System Settings"
          >
            <Settings className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onChangeApiKey}
            className="border-border text-muted-foreground hover:text-primary hover:border-primary/50 font-mono text-xs px-2 sm:px-3"
            title="API Key"
          >
            <Key className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">API Key</span>
          </Button>
        </div>
      </div>

      {/* Model Badge */}
      <div className="px-4 pb-3">
        <Badge
          variant="secondary"
          className="bg-secondary text-secondary-foreground font-mono text-xs"
        >
          <span className="text-primary mr-1.5">●</span>
          {getModelShortName(selectedModel)}
        </Badge>
      </div>
    </header>
  );
}
