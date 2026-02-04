import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { getModelMeta } from "@/constants/models";

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
  const [searchQuery, setSearchQuery] = useState("");

  const formatContextLength = (length?: number) => {
    if (!length) return null;
    if (length >= 1000) {
      const rounded = Math.round(length / 1000);
      return `${rounded}k`;
    }
    return `${length}`;
  };

  const formatPricing = (pricing?: { inputPer1kUsd?: number; outputPer1kUsd?: number }) => {
    if (!pricing) return null;
    const { inputPer1kUsd, outputPer1kUsd } = pricing;
    if (inputPer1kUsd === undefined && outputPer1kUsd === undefined) return null;
    const inputLabel =
      inputPer1kUsd !== undefined ? `$${inputPer1kUsd.toFixed(4)}/1k in` : null;
    const outputLabel =
      outputPer1kUsd !== undefined ? `$${outputPer1kUsd.toFixed(4)}/1k out` : null;
    return [inputLabel, outputLabel].filter(Boolean).join(" • ");
  };

  const filteredModels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return models;
    return models.filter((model) => {
      const meta = getModelMeta(model);
      const tagString = (meta.tags ?? []).join(" ");
      return (
        meta.id.toLowerCase().includes(query) ||
        meta.displayName.toLowerCase().includes(query) ||
        meta.provider.toLowerCase().includes(query) ||
        tagString.toLowerCase().includes(query)
      );
    });
  }, [models, searchQuery]);

  const handleModelChange = (model: string) => {
    onModelChange(model);
    setSearchQuery("");
  };

  return (
    <Select value={selectedModel} onValueChange={handleModelChange}>
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
          "max-h-[380px] min-w-[260px]",
          "rounded-xl overflow-hidden",
        )}
      >
        <div className="px-3 pt-3 pb-2 space-y-2">
          <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            Select Model
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
            className="h-8 text-xs rounded-lg glass-input border-border/30"
            autoFocus
          />
          <div className="text-[10px] text-muted-foreground/50">
            {filteredModels.length} result
            {filteredModels.length === 1 ? "" : "s"}
          </div>
        </div>
        {filteredModels.length === 0 && (
          <div className="px-3 pb-3 text-xs text-muted-foreground/60">
            No models found. Try a different search.
          </div>
        )}
        {filteredModels.map((model) => {
          const meta = getModelMeta(model);
          const contextLabel = formatContextLength(meta.contextLength);
          const pricingLabel = formatPricing(meta.pricing);
          return (
          <SelectItem
            key={model}
            value={model}
            className={cn(
              "text-sm cursor-pointer rounded-lg mx-1 px-3",
              "hover:bg-primary/10 focus:bg-primary/10",
              "transition-colors duration-150",
            )}
          >
            <div className="flex items-center justify-between gap-3 py-0.5">
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-foreground truncate">
                  {meta.displayName}
                </span>
                <span className="text-[11px] text-muted-foreground/60">
                  {meta.provider} • {meta.isFree ? "Free" : "Paid"}
                </span>
                {(contextLabel || pricingLabel) && (
                  <span className="text-[10px] text-muted-foreground/45">
                    {contextLabel ? `Context: ${contextLabel}` : null}
                    {contextLabel && pricingLabel ? " • " : null}
                    {pricingLabel ? `Pricing: ${pricingLabel}` : null}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/40 truncate">
                  {meta.id}
                </span>
              </div>
              {meta.isFree && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                  Free
                </span>
              )}
            </div>
          </SelectItem>
        );
        })}
      </SelectContent>
    </Select>
  );
}
