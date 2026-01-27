import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cpu } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: string[];
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  models,
}: ModelSelectorProps) {
  const getModelDisplayName = (model: string) => {
    const parts = model.split("/");
    if (parts.length > 1) {
      return parts[1].replace(":free", "");
    }
    return model;
  };

  const getModelProvider = (model: string) => {
    const parts = model.split("/");
    return parts[0] || "Unknown";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground hidden sm:flex">
        <Cpu className="h-4 w-4 text-primary" />
        <span className="text-xs font-mono uppercase tracking-wider">
          Model
        </span>
      </div>

      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[140px] sm:w-[280px] bg-input border-border text-foreground font-mono text-sm hover:border-primary/50 focus:ring-primary transition-all">
          <span className="truncate block w-full text-left">
            <SelectValue placeholder="Select a model" />
          </span>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          {models.map((model) => (
            <SelectItem
              key={model}
              value={model}
              className="font-mono text-sm text-popover-foreground hover:bg-secondary focus:bg-secondary cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-foreground">
                  {getModelDisplayName(model)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getModelProvider(model)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
