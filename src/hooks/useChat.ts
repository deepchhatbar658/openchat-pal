import { useState, useCallback, useEffect, useRef } from "react";
import { Message, MessageUsage } from "@/types/chat";
import { useLocalStorage } from "./useLocalStorage";
import { MODELS } from "@/constants/models";
import { useChatSessions } from "./useChatSessions";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const estimateTokens = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return Math.max(1, Math.ceil(trimmed.length / 4));
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeUsage = (usage: unknown): MessageUsage | null => {
  if (!usage || typeof usage !== "object") return null;
  const u = usage as Record<string, unknown>;
  const promptTokens = toNumber(
    u.prompt_tokens ?? u.promptTokens ?? u.input_tokens ?? u.inputTokens,
  );
  const completionTokens = toNumber(
    u.completion_tokens ?? u.completionTokens ?? u.output_tokens ?? u.outputTokens,
  );
  const totalTokens = toNumber(u.total_tokens ?? u.totalTokens ?? u.tokens ?? u.total);

  const hasAny =
    promptTokens !== undefined ||
    completionTokens !== undefined ||
    totalTokens !== undefined;
  if (!hasAny) return null;

  const resolvedTotal =
    totalTokens ??
    (promptTokens !== undefined || completionTokens !== undefined
      ? (promptTokens ?? 0) + (completionTokens ?? 0)
      : undefined);

  return {
    promptTokens,
    completionTokens,
    totalTokens: resolvedTotal,
  };
};

const extractCostUsd = (data: Record<string, unknown>) => {
  const usage = data.usage;
  const usageCost =
    usage && typeof usage === "object"
      ? (usage as Record<string, unknown>)
      : null;

  const candidates = [
    usageCost?.total_cost,
    usageCost?.totalCost,
    usageCost?.cost,
    data.cost,
    data.total_cost,
    data.totalCost,
  ];

  for (const candidate of candidates) {
    const parsed = toNumber(candidate);
    if (parsed !== undefined) return parsed;
  }

  return undefined;
};

export function useChat(sessionId: string | null) {
  // We use a dynamic key for localStorage based on sessionId
  const storageKey = sessionId
    ? `chat_messages_${sessionId}`
    : "chat_history_temp";
  const [messages, setMessages] = useLocalStorage<Message[]>(storageKey, []);

  const [systemPrompt, setSystemPrompt] = useLocalStorage<string>(
    sessionId ? `chat_system_prompt_${sessionId}` : "chat_system_prompt_temp",
    "",
  );

  const [selectedModel, setSelectedModel] = useLocalStorage<string>(
    "selected_model",
    MODELS[0],
  );
  const [apiKey, setApiKey] = useLocalStorage<string | null>(
    "openrouter_api_key",
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const { updateSessionTitle } = useChatSessions();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset streaming content when switching sessions
  useEffect(() => {
    setStreamingContent("");
  }, [sessionId]);

  const streamCompletion = useCallback(
    async (apiMessages: { role: string; content: string }[]) => {
      if (!apiKey) throw new Error("Missing API key");

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setStreamingContent("");

      const estimatedPromptTokens = apiMessages.reduce(
        (sum, message) => sum + estimateTokens(message.content),
        0,
      );

      let accumulatedContent = "";
      let streamDone = false;
      let usageFromApi: MessageUsage | null = null;
      let costUsdFromApi: number | undefined;

      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://polymodel.chat.example",
            "X-Title": "PolyModel Chat",
          },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            model: selectedModel,
            stream: true, // Enable streaming
            messages: apiMessages,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || `API Error: ${response.status}`,
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Response body is not readable");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;
            if (!line.startsWith("data:")) continue;

            const dataStr = line.replace(/^data:\s?/, "");
            if (dataStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data && typeof data === "object") {
                const usageCandidate = normalizeUsage(
                  (data as Record<string, unknown>).usage,
                );
                if (usageCandidate) {
                  usageFromApi = usageCandidate;
                }

                const costCandidate = extractCostUsd(
                  data as Record<string, unknown>,
                );
                if (costCandidate !== undefined) {
                  costUsdFromApi = costCandidate;
                }
              }

              const delta = data.choices?.[0]?.delta?.content || "";
              if (delta) {
                accumulatedContent += delta;
                setStreamingContent(accumulatedContent);
              }
            } catch (e) {
              console.warn("Error parsing SSE message", e);
            }
          }

          if (streamDone) break;
        }

        const estimatedCompletionTokens = estimateTokens(accumulatedContent);
        const estimatedUsage: MessageUsage = {
          promptTokens: estimatedPromptTokens,
          completionTokens: estimatedCompletionTokens,
          totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
          estimated: true,
        };

        return {
          content: accumulatedContent,
          aborted: false,
          usage: usageFromApi ?? estimatedUsage,
          costUsd: costUsdFromApi,
        };
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          const estimatedCompletionTokens = estimateTokens(accumulatedContent);
          const estimatedUsage: MessageUsage = {
            promptTokens: estimatedPromptTokens,
            completionTokens: estimatedCompletionTokens,
            totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
            estimated: true,
          };

          return {
            content: accumulatedContent,
            aborted: true,
            usage: usageFromApi ?? estimatedUsage,
            costUsd: costUsdFromApi,
          };
        }
        throw error;
      } finally {
        setIsLoading(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [apiKey, selectedModel],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!apiKey || !content.trim() || !sessionId) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      // If this is the first message, update the session title
      if (messages.length === 0) {
        const words = content.trim().split(/\s+/).filter(Boolean);
        const limitedWords = words.slice(0, 4).join(" ");
        let generatedTitle = limitedWords || "New Chat";
        if (words.length > 4) generatedTitle += "...";
        if (generatedTitle.length > 36) {
          generatedTitle = generatedTitle.slice(0, 33) + "...";
        }
        updateSessionTitle(sessionId, generatedTitle);
      }

      // Optimistically add user message
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Prepare messages with optional system prompt
        const apiMessages = [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          ...messages,
          userMessage,
        ].map((m) => ({
          role: m.role === "error" ? "assistant" : m.role,
          content: m.content,
        }));

        const { content: assistantContent, aborted, usage, costUsd } =
          await streamCompletion(apiMessages);

        if (assistantContent) {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: assistantContent,
            timestamp: Date.now(),
            model: selectedModel,
            usage,
            costUsd,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else if (!aborted) {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "No content received.",
            timestamp: Date.now(),
            model: selectedModel,
            usage,
            costUsd,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (error) {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "error",
          content:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    [
      apiKey,
      messages,
      selectedModel,
      setMessages,
      sessionId,
      streamCompletion,
      updateSessionTitle,
      systemPrompt, // Added dependency
    ],
  );

  const regenerateLastResponse = useCallback(async () => {
    if (!apiKey || !sessionId) return;

    const lastUserIndex = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");

    if (lastUserIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserIndex;
    const trimmedMessages = messages.slice(0, actualIndex + 1);
    setMessages(trimmedMessages);

    const apiMessages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...trimmedMessages,
    ].map((m) => ({
      role: m.role === "error" ? "assistant" : m.role,
      content: m.content,
    }));

    try {
      const { content: assistantContent, aborted, usage, costUsd } =
        await streamCompletion(apiMessages);

      if (assistantContent) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
          timestamp: Date.now(),
          model: selectedModel,
          usage,
          costUsd,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (!aborted) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "No content received.",
          timestamp: Date.now(),
          model: selectedModel,
          usage,
          costUsd,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "error",
        content:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [apiKey, messages, sessionId, setMessages, streamCompletion, systemPrompt]);

  const editLastUserMessage = useCallback(
    async (nextContent: string) => {
      if (!apiKey || !sessionId) return;
      const trimmed = nextContent.trim();
      if (!trimmed) return;

      const lastUserIndex = [...messages]
        .reverse()
        .findIndex((m) => m.role === "user");

      if (lastUserIndex === -1) return;

      const actualIndex = messages.length - 1 - lastUserIndex;
      const updatedMessages = messages
        .slice(0, actualIndex + 1)
        .map((m, index) =>
          index === actualIndex
            ? { ...m, content: trimmed, timestamp: Date.now() }
            : m,
        );

      setMessages(updatedMessages);

      const firstUserIndex = messages.findIndex((m) => m.role === "user");
      if (actualIndex === firstUserIndex) {
        updateSessionTitle(sessionId, trimmed);
      }

      const apiMessages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...updatedMessages,
      ].map((m) => ({
        role: m.role === "error" ? "assistant" : m.role,
        content: m.content,
      }));

      try {
      const { content: assistantContent, aborted, usage, costUsd } =
        await streamCompletion(apiMessages);

      if (assistantContent) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
          timestamp: Date.now(),
          model: selectedModel,
          usage,
          costUsd,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (!aborted) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "No content received.",
          timestamp: Date.now(),
          model: selectedModel,
          usage,
          costUsd,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
      } catch (error) {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "error",
          content:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    [
      apiKey,
      messages,
      sessionId,
      setMessages,
      streamCompletion,
      systemPrompt,
      updateSessionTitle,
    ],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setStreamingContent("");
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, [setMessages]);

  const updateApiKey = useCallback(
    (key: string) => {
      setApiKey(key);
    },
    [setApiKey],
  );

  const removeApiKey = useCallback(() => {
    setApiKey(null);
  }, [setApiKey]);

  const stopGenerating = useCallback(() => {
    if (!abortControllerRef.current) return;
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  // Merge streaming content into messages for display
  const displayedMessages = streamingContent
    ? [
        ...messages,
        {
          id: "streaming-msg",
          role: "assistant" as const,
          content: streamingContent,
          timestamp: Date.now(),
        },
      ]
    : messages;

  return {
    messages: displayedMessages,
    selectedModel,
    setSelectedModel,
    apiKey,
    updateApiKey,
    removeApiKey,
    isLoading,
    sendMessage,
    editLastUserMessage,
    regenerateLastResponse,
    stopGenerating,
    clearChat,
    systemPrompt,
    setSystemPrompt,
  };
}
