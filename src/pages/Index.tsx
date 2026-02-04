import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useChatSessions, type ImportedSession } from "@/hooks/useChatSessions";
import { useCustomModels } from "@/hooks/useCustomModels";
import { useTheme } from "@/hooks/useTheme";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Message } from "@/types/chat";
import { ApiKeyModal } from "@/components/chat/ApiKeyModal";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MobileChatSidebar } from "@/components/chat/MobileChatSidebar";
import { SettingsModal } from "@/components/chat/SettingsModal";
import { EditLastMessageModal } from "@/components/chat/EditLastMessageModal";

const Index = () => {
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    selectSession,
    importSessions,
  } = useChatSessions();

  // Create initial session if none exist
  useEffect(() => {
    if (sessions.length === 0 && !currentSessionId) {
      createSession();
    } else if (sessions.length > 0 && !currentSessionId) {
      selectSession(sessions[0].id);
    }
  }, [
    sessions.length,
    currentSessionId,
    createSession,
    selectSession,
    sessions,
  ]);

  const {
    messages,
    selectedModel,
    setSelectedModel,
    apiKey,
    updateApiKey,
    isLoading,
    sendMessage,
    editLastUserMessage,
    regenerateLastResponse,
    stopGenerating,
    clearChat,
    systemPrompt,
    setSystemPrompt,
  } = useChat(currentSessionId);

  const { customModels, allModels, addModel, removeModel } = useCustomModels();
  const { theme, setTheme, themes } = useTheme();
  const [costPer1k, setCostPer1k] = useLocalStorage<number | null>(
    "cost_per_1k_usd",
    null,
  );

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditLast, setShowEditLast] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveApiKey = (key: string) => {
    updateApiKey(key);
    setShowApiKeyModal(false);
  };

  const handleSuggestionClick = useCallback(
    (text: string) => {
      if (apiKey) {
        sendMessage(text);
      }
    },
    [sendMessage, apiKey],
  );

  const needsApiKey = !apiKey;
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;
  const exportMessages = messages.filter((m) => m.id !== "streaming-msg");

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const buildExportFilename = (extension: string) => {
    const rawTitle = currentSession?.title || "chat";
    const safeTitle = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const date = new Date().toISOString().slice(0, 10);
    return `polymodel-${safeTitle || "chat"}-${date}.${extension}`;
  };

  const handleExportJson = () => {
    if (!currentSession) return;
    const payload = {
      version: 1,
      app: "PolyModel Chat",
      exportedAt: new Date().toISOString(),
      sessions: [
        {
          title: currentSession.title,
          createdAt: currentSession.createdAt,
          systemPrompt,
          messages: exportMessages,
        },
      ],
    };
    downloadFile(
      buildExportFilename("json"),
      JSON.stringify(payload, null, 2),
      "application/json",
    );
  };

  const handleExportMarkdown = () => {
    if (!currentSession) return;
    const lines: string[] = [];
    lines.push(`# ${currentSession.title || "Chat"}`);
    lines.push(`_Exported ${new Date().toLocaleString()}_`);
    if (systemPrompt.trim()) {
      lines.push("");
      lines.push(`> System prompt: ${systemPrompt}`);
    }
    lines.push("");

    exportMessages.forEach((message) => {
      const roleLabel =
        message.role === "user"
          ? "User"
          : message.role === "assistant"
            ? "Assistant"
            : "Error";
      lines.push(
        `## ${roleLabel} (${new Date(message.timestamp).toLocaleString()})`,
      );
      lines.push("");
      lines.push(message.content);
      lines.push("");
    });

    downloadFile(buildExportFilename("md"), lines.join("\n"), "text/markdown");
  };

  const handleImportJson = (payload: unknown) => {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid file format.");
    }
    const data = payload as Record<string, unknown>;
    const rawSessions = Array.isArray(data.sessions)
      ? (data.sessions as unknown[])
      : data.session
        ? [data.session]
        : Array.isArray(data.messages)
          ? [
              {
                title: data.title,
                createdAt: data.createdAt,
                systemPrompt: data.systemPrompt,
                messages: data.messages,
              },
            ]
          : [];

    const sessionsFromPayload = rawSessions.filter(
      (session): session is ImportedSession =>
        !!session && typeof session === "object",
    );

    if (!sessionsFromPayload.length) {
      throw new Error("No chats found in this file.");
    }

    return importSessions(sessionsFromPayload);
  };

  const roleLabel = (role: Message["role"]) => {
    if (role === "user") return "User";
    if (role === "assistant") return "Assistant";
    return "Error";
  };

  const buildQuoteBlock = (message: Message) => {
    const lines = message.content.split("\n").map((line) => `> ${line}`);
    return [`> ${roleLabel(message.role)}:`, ...lines].join("\n");
  };

  const buildInlineQuote = (message: Message) => {
    const compact = message.content.replace(/\s+/g, " ").trim();
    const excerpt = compact.length > 160 ? `${compact.slice(0, 157)}...` : compact;
    return `"${excerpt}" — ${roleLabel(message.role)}`;
  };

  const appendToDraft = (block: string, withTrailingNewline: boolean) => {
    setDraft((prev) => {
      const hasContent = prev.trim().length > 0;
      const separator = hasContent ? "\n\n" : "";
      const suffix = withTrailingNewline ? "\n\n" : "";
      return `${prev}${separator}${block}${suffix}`;
    });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top gradient orb */}
        <div
          className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Bottom gradient orb */}
        <div
          className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[50%] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Left accent */}
        <div
          className="absolute top-1/2 -left-[10%] w-[30%] h-[40%] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onCreateSession={createSession}
        onDeleteSession={deleteSession}
        className="hidden md:flex"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen min-w-0 relative z-10">
        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={needsApiKey || showApiKeyModal}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiKeyModal(false)}
          isChanging={showApiKeyModal && !needsApiKey}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          systemPrompt={systemPrompt}
          onSaveSystemPrompt={setSystemPrompt}
          customModels={customModels}
          onAddModel={addModel}
          onRemoveModel={removeModel}
          currentTheme={theme}
          onSetTheme={setTheme}
          themes={themes}
          onExportJson={handleExportJson}
          onExportMarkdown={handleExportMarkdown}
          onImportJson={handleImportJson}
          canExport={!!currentSession}
          costPer1k={costPer1k}
          onSetCostPer1k={setCostPer1k}
        />

        {/* Edit Last Message Modal */}
        <EditLastMessageModal
          isOpen={showEditLast}
          onClose={() => setShowEditLast(false)}
          initialValue={lastUserMessage?.content || ""}
          isSaving={isLoading}
          onSave={(value) => {
            editLastUserMessage(value);
            setShowEditLast(false);
          }}
        />

        {/* Header */}
        <ChatHeader
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          models={allModels}
          onChangeApiKey={() => setShowApiKeyModal(true)}
          onClearChat={clearChat}
          hasMessages={messages.length > 0}
          onOpenSettings={() => setShowSettings(true)}
          leading={
            <MobileChatSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={selectSession}
              onCreateSession={createSession}
              onDeleteSession={deleteSession}
            />
          }
        />

        {/* Chat Window */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSuggestionClick={handleSuggestionClick}
          onEditLast={apiKey ? () => setShowEditLast(true) : undefined}
          onRegenerateLast={apiKey ? regenerateLastResponse : undefined}
          onQuoteMessage={
            apiKey
              ? (message, mode) =>
                  appendToDraft(
                    mode === "inline"
                      ? buildInlineQuote(message)
                      : buildQuoteBlock(message),
                    false,
                  )
              : undefined
          }
          onReplyMessage={
            apiKey ? (message) => appendToDraft(buildQuoteBlock(message), true) : undefined
          }
          costPer1k={costPer1k}
        />

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          onStop={stopGenerating}
          disabled={isLoading || !apiKey}
          isLoading={isLoading}
          value={draft}
          onChange={setDraft}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
};

export default Index;
