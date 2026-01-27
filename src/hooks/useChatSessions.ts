import { useLocalStorage } from "./useLocalStorage";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
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

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s)),
    );
  };

  return {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    selectSession,
    updateSessionTitle,
  };
}
