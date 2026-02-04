import { useLocalStorage } from "./useLocalStorage";
import { Message } from "@/types/chat";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
}

export interface ImportedSession {
  title?: string;
  createdAt?: number;
  systemPrompt?: string;
  messages?: Message[];
}

export function useChatSessions() {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>(
    "chat_sessions",
    [],
  );
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<
    string | null
  >("current_session_id", null);

  const createSession = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Chat",
      createdAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    // Also remove the messages for this session
    window.localStorage.removeItem(`chat_messages_${sessionId}`);
    // Remove system prompt for this session
    window.localStorage.removeItem(`chat_system_prompt_${sessionId}`);

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    const words = newTitle.trim().split(/\s+/).filter(Boolean);
    const limitedWords = words.slice(0, 4).join(" ");
    let normalizedTitle = limitedWords || "New Chat";
    if (words.length > 4) normalizedTitle += "...";
    if (normalizedTitle.length > 36) {
      normalizedTitle = normalizedTitle.slice(0, 33) + "...";
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, title: normalizedTitle } : s,
      ),
    );
  };

  const importSessions = (sessionsToImport: ImportedSession[]) => {
    if (!sessionsToImport.length) return 0;

    const normalizeTitle = (value: string) => {
      const words = value.trim().split(/\s+/).filter(Boolean);
      const limitedWords = words.slice(0, 4).join(" ");
      let normalizedTitle = limitedWords || "Imported Chat";
      if (words.length > 4) normalizedTitle += "...";
      if (normalizedTitle.length > 36) {
        normalizedTitle = normalizedTitle.slice(0, 33) + "...";
      }
      return normalizedTitle;
    };

    const normalizedSessions: ChatSession[] = [];

    sessionsToImport.forEach((session) => {
      const newId = crypto.randomUUID();
      const createdAt =
        typeof session.createdAt === "number" ? session.createdAt : Date.now();
      const title = normalizeTitle(
        typeof session.title === "string" ? session.title : "Imported Chat",
      );

      const messages =
        session.messages
          ?.filter(
            (m) =>
              m &&
              (m.role === "user" || m.role === "assistant" || m.role === "error") &&
              typeof m.content === "string",
          )
          .map((m) => ({
            id: typeof m.id === "string" ? m.id : crypto.randomUUID(),
            role: m.role,
            content: m.content,
            timestamp: typeof m.timestamp === "number" ? m.timestamp : Date.now(),
            model: typeof m.model === "string" ? m.model : undefined,
            usage:
              m.usage && typeof m.usage === "object"
                ? {
                    promptTokens:
                      typeof (m.usage as any).promptTokens === "number"
                        ? (m.usage as any).promptTokens
                        : undefined,
                    completionTokens:
                      typeof (m.usage as any).completionTokens === "number"
                        ? (m.usage as any).completionTokens
                        : undefined,
                    totalTokens:
                      typeof (m.usage as any).totalTokens === "number"
                        ? (m.usage as any).totalTokens
                        : undefined,
                    estimated:
                      typeof (m.usage as any).estimated === "boolean"
                        ? (m.usage as any).estimated
                        : undefined,
                  }
                : undefined,
            costUsd: typeof m.costUsd === "number" ? m.costUsd : undefined,
          })) ?? [];

      window.localStorage.setItem(
        `chat_messages_${newId}`,
        JSON.stringify(messages),
      );
      window.localStorage.setItem(
        `chat_system_prompt_${newId}`,
        JSON.stringify(
          typeof session.systemPrompt === "string" ? session.systemPrompt : "",
        ),
      );

      normalizedSessions.push({
        id: newId,
        title,
        createdAt,
      });
    });

    setSessions((prev) => [...normalizedSessions, ...prev]);
    if (normalizedSessions[0]) {
      setCurrentSessionId(normalizedSessions[0].id);
    }

    return normalizedSessions.length;
  };

  return {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    selectSession,
    updateSessionTitle,
    importSessions,
  };
}
