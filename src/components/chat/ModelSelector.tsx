import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
      return parts[1].replace(":free", "").split("-").slice(0, 2).join("-");
    }
    return model;
  };

  const getModelProvider = (model: string) => {
    const parts = model.split("/");
    const provider = parts[0] || "Unknown";
    // Capitalize first letter
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger
        className={cn(
          "w-[120px] sm:w-[180px] h-8 sm:h-9",
          "glass-subtle rounded-xl",
          "text-foreground text-xs sm:text-sm",
          "border-0 hover:bg-muted/50",
          "focus:ring-1 focus:ring-primary/30",
          "transition-all duration-200",
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-primary flex-shrink-0" />
          <span className="truncate font-medium">
            <SelectValue placeholder="Select model" />
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
      </SelectTrigger>
      <SelectContent
        className={cn(
          "glass border-border/30 z-50",
          "max-h-[350px] min-w-[240px]",
          "rounded-xl overflow-hidden",
        )}
      >
        <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
          Select Model
        </div>
        {models.map((model) => (
          <SelectItem
            key={model}
            value={model}
            className={cn(
              "text-sm cursor-pointer rounded-lg mx-1 px-3",
              "hover:bg-primary/10 focus:bg-primary/10",
              "transition-colors duration-150",
            )}
          >
            <div className="flex flex-col py-0.5">
              <span className="font-medium text-foreground">
                {getModelDisplayName(model)}
              </span>
              <span className="text-[11px] text-muted-foreground/60">
                {getModelProvider(model)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
