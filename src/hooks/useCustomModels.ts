import { useLocalStorage } from "./useLocalStorage";
import { MODELS } from "@/constants/models";
import { useCallback, useMemo } from "react";

export function useCustomModels() {
  const [customModels, setCustomModels] = useLocalStorage<string[]>(
    "custom_models",
    [],
  );

  const addModel = useCallback(
    (modelId: string) => {
      const trimmed = modelId.trim();
      if (!trimmed) return;

      setCustomModels((prev) => {
        if (prev.includes(trimmed) || MODELS.includes(trimmed)) return prev;
        return [...prev, trimmed];
      });
    },
    [setCustomModels],
  );

  const removeModel = useCallback(
    (modelId: string) => {
      setCustomModels((prev) => prev.filter((m) => m !== modelId));
    },
    [setCustomModels],
  );

  const allModels = useMemo(() => [...MODELS, ...customModels], [customModels]);

  return {
    customModels,
    allModels,
    addModel,
    removeModel,
  };
}
