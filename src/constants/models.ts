export const MODELS = [
  // Flagship/High-Performance Free Models
  "meta-llama/llama-3.3-70b-instruct:free",

  // New Reasoning & Thinking Models
  "liquid/lfm-2.5-1.2b-instruct:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "allenai/molmo-2-8b:free",

  // Efficient & Specialized Models
  "nvidia/nemotron-3-nano-30b-a3b:free",
  // "xiaomi/mimo-v2-flash:free",

  // DeepSeek / Chimera Variants
  "tngtech/deepseek-r1t2-chimera:free",
  "tngtech/deepseek-r1t-chimera:free",
  "arcee-ai/trinity-mini:free",
  "openai/gpt-oss-20b:free",
];
export type Model = (typeof MODELS)[number];
