import { useState, useEffect, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { useChatSessions } from "@/hooks/useChatSessions";
import { useCustomModels } from "@/hooks/useCustomModels";
import { useTheme } from "@/hooks/useTheme";
import { ApiKeyModal } from "@/components/chat/ApiKeyModal";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MobileChatSidebar } from "@/components/chat/MobileChatSidebar";
import { SettingsModal } from "@/components/chat/SettingsModal";

const Index = () => {
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    selectSession,
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
    clearChat,
    systemPrompt,
    setSystemPrompt,
  } = useChat(currentSessionId);

  const { customModels, allModels, addModel, removeModel } = useCustomModels();
  const { theme, setTheme, themes } = useTheme();

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
        />

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading || !apiKey} />
      </div>
    </div>
  );
};

export default Index;
