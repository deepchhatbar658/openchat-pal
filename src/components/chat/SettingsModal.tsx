import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { THEMES, ThemeId } from "@/hooks/useTheme";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSaveSystemPrompt: (prompt: string) => void;
  customModels: string[];
  onAddModel: (model: string) => void;
  onRemoveModel: (model: string) => void;
  currentTheme: ThemeId;
  onSetTheme: (theme: ThemeId) => void;
  themes: typeof THEMES;
}

export function SettingsModal({
  isOpen,
  onClose,
  systemPrompt,
  onSaveSystemPrompt,
  customModels,
  onAddModel,
  onRemoveModel,
  currentTheme,
  onSetTheme,
  themes,
}: SettingsModalProps) {
  const [promptValue, setPromptValue] = useState(systemPrompt);
  const [newModelInput, setNewModelInput] = useState("");

  // Sync prompt with prop when it changes or when modal opens
  useEffect(() => {
    setPromptValue(systemPrompt);
  }, [systemPrompt, isOpen]);

  const handleAddModel = () => {
    if (newModelInput.trim()) {
      onAddModel(newModelInput.trim());
      setNewModelInput("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Configure your AI persona and manage custom models.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="persona"
          className="flex-1 flex flex-col min-h-0 mt-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="persona">Persona</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
          </TabsList>

          {/* SYSTEM PROMPT TAB */}
          <TabsContent
            value="persona"
            className="flex-1 flex flex-col min-h-0 pt-4 gap-4"
          >
            <div className="flex-1 min-h-0">
              <Textarea
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder="Enter specific instructions (e.g., 'You are a pirate')..."
                className="h-full resize-none font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSaveSystemPrompt(promptValue);
                  onClose();
                }}
              >
                Save Persona
              </Button>
            </div>
          </TabsContent>

          {/* MODELS TAB */}
          <TabsContent
            value="models"
            className="flex-1 flex flex-col min-h-0 pt-4 gap-4"
          >
            <div className="flex gap-2">
              <Input
                placeholder="openrouter/model-id"
                value={newModelInput}
                onChange={(e) => setNewModelInput(e.target.value)}
                className="font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
              />
              <Button
                size="icon"
                onClick={handleAddModel}
                disabled={!newModelInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-md p-2 bg-secondary/20">
              {customModels.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2 opacity-70">
                  <AlertCircle className="h-8 w-8" />
                  <span>No custom models added.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {customModels.map((model) => (
                    <div
                      key={model}
                      className="flex items-center justify-between p-2 rounded bg-background border border-border/50 text-sm font-mono group"
                    >
                      <span className="truncate flex-1 mr-2">{model}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => onRemoveModel(model)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Only custom models can be removed. Default models are locked.
            </p>
          </TabsContent>

          {/* THEMES TAB */}
          <TabsContent value="themes" className="flex-1 pt-4">
            <div className="grid grid-cols-2 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onSetTheme(theme.id)}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-lg border-2 transition-all hover:bg-muted/50",
                    currentTheme === theme.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <div
                    className={cn(
                      "w-full h-8 rounded mb-3 border",
                      theme.color,
                    )}
                  />
                  <span className="font-medium text-sm">{theme.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
