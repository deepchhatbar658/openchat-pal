import { useState, useCallback, useEffect } from "react";
import { Message } from "@/types/chat";
import { useLocalStorage } from "./useLocalStorage";
import { MODELS } from "@/constants/models";
import { useChatSessions } from "./useChatSessions";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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

  // Reset streaming content when switching sessions
  useEffect(() => {
    setStreamingContent("");
  }, [sessionId]);

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
        const generatedTitle =
          content.slice(0, 30) + (content.length > 30 ? "..." : "");
        updateSessionTitle(sessionId, generatedTitle);
      }

      // Optimistically add user message
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setStreamingContent(""); // Start fresh

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

        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://polymodel.chat.example",
            "X-Title": "PolyModel Chat",
          },
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
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices?.[0]?.delta?.content || "";
                accumulatedContent += delta;
                setStreamingContent(accumulatedContent);
              } catch (e) {
                console.warn("Error parsing SSE message", e);
              }
            }
          }
        }

        // Stream finished, finalize message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: accumulatedContent || "No content received.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
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
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [
      apiKey,
      messages,
      selectedModel,
      setMessages,
      sessionId,
      updateSessionTitle,
      systemPrompt, // Added dependency
    ],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setStreamingContent("");
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
    clearChat,
    systemPrompt,
    setSystemPrompt,
  };
}
