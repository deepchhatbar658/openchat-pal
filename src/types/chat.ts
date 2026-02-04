export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: number;
  model?: string;
  usage?: MessageUsage;
  costUsd?: number;
}

export interface MessageUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimated?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  selectedModel: string;
  apiKey: string | null;
}
