import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Key, Shield, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose?: () => void;
  isChanging?: boolean;
}

export function ApiKeyModal({
  isOpen,
  onSave,
  onClose,
  isChanging = false,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setApiKey("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && isChanging && onClose?.()}
    >
      <DialogContent className="glass border-border/30 sm:max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative p-6 pb-4">
          <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
          <DialogHeader className="relative space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Key className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-center text-xl font-bold">
                {isChanging ? "Update API Key" : "Welcome to PolyModel"}
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground text-sm">
                {isChanging
                  ? "Enter your new OpenRouter API key below."
                  : "Enter your OpenRouter API key to start chatting."}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 space-y-5">
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-12 glass-input border-border/30",
                "text-foreground placeholder:text-muted-foreground/40",
                "text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/30",
                "transition-all rounded-xl",
              )}
            />

            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Get your API key from OpenRouter
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60 glass-subtle rounded-xl py-2.5 px-3">
            <Shield className="h-3.5 w-3.5 text-primary/60" />
            <span>Stored securely in your browser's localStorage</span>
          </div>

          <div className="flex gap-3">
            {isChanging && onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 h-11 hover:bg-muted/50 rounded-xl"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className={cn(
                "flex-1 h-11 rounded-xl font-medium",
                "bg-gradient-primary hover:opacity-90",
                "text-primary-foreground shadow-glow-subtle",
                "disabled:opacity-50 disabled:shadow-none",
                "transition-all duration-300",
              )}
            >
              {isChanging ? "Update Key" : "Get Started"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
