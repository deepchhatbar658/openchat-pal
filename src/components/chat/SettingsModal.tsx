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
import {
  Trash2,
  Plus,
  AlertCircle,
  User,
  Cpu,
  Palette,
  Check,
  Download,
  Upload,
} from "lucide-react";
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
  onExportJson: () => void;
  onExportMarkdown: () => void;
  onImportJson: (payload: unknown) => number;
  canExport?: boolean;
  costPer1k?: number | null;
  onSetCostPer1k: (value: number | null) => void;
}

const themeDescriptions: Record<ThemeId, string> = {
  zinc: "Elegant purple accents",
  ocean: "Deep teal vibes",
  sunset: "Warm coral gradient",
  hacker: "Matrix green glow",
};

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
  onExportJson,
  onExportMarkdown,
  onImportJson,
  canExport = true,
  costPer1k = null,
  onSetCostPer1k,
}: SettingsModalProps) {
  const [promptValue, setPromptValue] = useState(systemPrompt);
  const [newModelInput, setNewModelInput] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [costInput, setCostInput] = useState(
    costPer1k !== null && costPer1k !== undefined ? String(costPer1k) : "",
  );

  useEffect(() => {
    setPromptValue(systemPrompt);
  }, [systemPrompt, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setImportStatus(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setCostInput(
      costPer1k !== null && costPer1k !== undefined ? String(costPer1k) : "",
    );
  }, [costPer1k, isOpen]);

  const handleAddModel = () => {
    if (newModelInput.trim()) {
      onAddModel(newModelInput.trim());
      setNewModelInput("");
    }
  };

  const handleCostChange = (value: string) => {
    setCostInput(value);
  };

  const applyCostInput = () => {
    const trimmed = costInput.trim();
    if (!trimmed) {
      onSetCostPer1k(null);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onSetCostPer1k(parsed);
    }
  };

  const handleImportFile = async (file: File) => {
    setImportStatus(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const count = onImportJson(parsed);
      setImportStatus(
        count > 0
          ? `Imported ${count} chat${count === 1 ? "" : "s"}.`
          : "No chats found to import.",
      );
    } catch (error) {
      setImportStatus(
        error instanceof Error
          ? error.message
          : "Failed to import file.",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] h-[580px] flex flex-col glass border-border/30 rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Customize your AI experience
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs
          defaultValue="persona"
          className="flex-1 flex flex-col min-h-0 px-6 pb-6"
        >
          <TabsList className="grid w-full grid-cols-4 glass-subtle p-1 rounded-xl mt-4 h-11">
            <TabsTrigger
              value="persona"
              className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all text-sm"
            >
              <User className="h-4 w-4 mr-2" />
              Persona
            </TabsTrigger>
            <TabsTrigger
              value="models"
              className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all text-sm"
            >
              <Cpu className="h-4 w-4 mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger
              value="themes"
              className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all text-sm"
            >
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* PERSONA TAB */}
          <TabsContent
            value="persona"
            className="flex-1 flex flex-col min-h-0 pt-4 gap-4"
          >
            <div className="flex-1 min-h-0">
              <Textarea
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder="Give your AI a personality (e.g., 'You are a helpful coding assistant that explains concepts clearly...')"
                className="h-full resize-none text-sm glass-input border-border/30 focus:ring-2 focus:ring-primary/20 rounded-xl placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="hover:bg-muted/50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSaveSystemPrompt(promptValue);
                  onClose();
                }}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-xl shadow-glow-subtle"
              >
                Save Changes
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
                placeholder="openrouter/model-name"
                value={newModelInput}
                onChange={(e) => setNewModelInput(e.target.value)}
                className="text-sm glass-input border-border/30 focus:ring-2 focus:ring-primary/20 rounded-xl h-10"
                onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
              />
              <Button
                size="icon"
                onClick={handleAddModel}
                disabled={!newModelInput.trim()}
                className="h-10 w-10 rounded-xl bg-gradient-primary hover:opacity-90 text-primary-foreground disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto glass-subtle rounded-xl p-3">
              {customModels.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <span className="text-muted-foreground/70">
                    No custom models added
                  </span>
                  <span className="text-xs text-muted-foreground/50">
                    Add models from OpenRouter
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {customModels.map((model) => (
                    <div
                      key={model}
                      className="flex items-center justify-between p-3 rounded-xl glass-subtle group hover:bg-muted/30 transition-colors"
                    >
                      <span className="truncate flex-1 mr-2 text-sm font-medium text-foreground/90">
                        {model}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                        onClick={() => onRemoveModel(model)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground/50 text-center">
              Default models cannot be removed
            </p>
          </TabsContent>

          {/* THEMES TAB */}
          <TabsContent value="themes" className="flex-1 pt-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onSetTheme(theme.id)}
                  className={cn(
                    "relative flex flex-col items-start p-4 rounded-xl transition-all duration-300",
                    "border-2 hover-lift",
                    currentTheme === theme.id
                      ? "border-primary bg-primary/5 shadow-glow-subtle"
                      : "border-border/30 hover:border-primary/30 bg-muted/10",
                  )}
                >
                  {/* Selected indicator */}
                  {currentTheme === theme.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "w-full h-10 rounded-lg mb-3 border border-border/20",
                      theme.color,
                    )}
                  />
                  <span className="font-semibold text-sm text-foreground">
                    {theme.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {themeDescriptions[theme.id]}
                  </span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* DATA TAB */}
          <TabsContent value="data" className="flex-1 pt-4 overflow-y-auto">
            <div className="space-y-6">
              <div className="glass-subtle rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Export current chat
                </h3>
                <p className="text-xs text-muted-foreground/70 mb-3">
                  Download your current conversation as JSON or Markdown.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={onExportJson}
                    disabled={!canExport}
                    className="rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onExportMarkdown}
                    disabled={!canExport}
                    className="rounded-xl hover:bg-muted/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Markdown
                  </Button>
                </div>
              </div>

              <div className="glass-subtle rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Cost estimate
                </h3>
                <p className="text-xs text-muted-foreground/70 mb-3">
                  Optional: set a default price per 1K tokens to estimate costs for paid models.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.0001"
                    min="0"
                    placeholder="0.0025"
                    value={costInput}
                    onChange={(e) => handleCostChange(e.target.value)}
                    onBlur={applyCostInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCostInput();
                      }
                    }}
                    className="text-xs h-10 rounded-xl"
                  />
                  <Button
                    variant="ghost"
                    className="h-10 rounded-xl hover:bg-muted/50"
                    onClick={() => {
                      handleCostChange("");
                      onSetCostPer1k(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground/60">
                  Free models display $0.00 automatically.
                </p>
              </div>

              <div className="glass-subtle rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Import chats
                </h3>
                <p className="text-xs text-muted-foreground/70 mb-3">
                  Import a previously exported JSON file. Chats will be added as new sessions.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="application/json"
                    className="text-xs h-10 rounded-xl"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      handleImportFile(file);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button
                    variant="ghost"
                    className="h-10 rounded-xl hover:bg-muted/50"
                    onClick={() => setImportStatus(null)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
                {importStatus && (
                  <p className="mt-2 text-[11px] text-muted-foreground/80">
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
