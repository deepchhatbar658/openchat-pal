export interface ModelPricing {
  inputPer1kUsd?: number;
  outputPer1kUsd?: number;
}

export interface ModelCatalogEntry {
  id: string;
  contextLength?: number;
  pricing?: ModelPricing;
  tags?: string[];
  description?: string;
}

export interface ModelMeta extends ModelCatalogEntry {
  displayName: string;
  provider: string;
  isFree: boolean;
}

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  // Flagship/High-Performance Free Models
  { id: "meta-llama/llama-3.3-70b-instruct:free", tags: ["free"] },

  // New Reasoning & Thinking Models
  { id: "liquid/lfm-2.5-1.2b-instruct:free", tags: ["free"] },
  { id: "liquid/lfm-2.5-1.2b-thinking:free", tags: ["free"] },
  { id: "allenai/molmo-2-8b:free", tags: ["free"] },

  // Efficient & Specialized Models
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", tags: ["free"] },
  // { id: "xiaomi/mimo-v2-flash:free", tags: ["free"] },

  // DeepSeek / Chimera Variants
  { id: "tngtech/deepseek-r1t2-chimera:free", tags: ["free"] },
  { id: "tngtech/deepseek-r1t-chimera:free", tags: ["free"] },
  { id: "arcee-ai/trinity-mini:free", tags: ["free"] },
  { id: "openai/gpt-oss-20b:free", tags: ["free"] },
];

const modelCatalogById = new Map(
  MODEL_CATALOG.map((entry) => [entry.id, entry]),
);

const formatDisplayName = (modelId: string) => {
  const parts = modelId.split("/");
  const name = parts.length > 1 ? parts[1] : modelId;
  return name.replace(":free", "");
};

const formatProvider = (modelId: string) => {
  const parts = modelId.split("/");
  const provider = parts[0] || "Unknown";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

export const getModelMeta = (modelId: string): ModelMeta => {
  const entry = modelCatalogById.get(modelId);
  const isFree = modelId.includes(":free");
  const tags = Array.from(
    new Set([...(entry?.tags ?? []), isFree ? "free" : "paid"]),
  );

  return {
    id: modelId,
    displayName: formatDisplayName(modelId),
    provider: formatProvider(modelId),
    isFree,
    tags,
    contextLength: entry?.contextLength,
    pricing: entry?.pricing,
    description: entry?.description,
  };
};

export const MODELS = MODEL_CATALOG.map((entry) => entry.id);
export type Model = (typeof MODELS)[number];
