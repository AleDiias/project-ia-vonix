
import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";

export default function Index() {
  const {
    messages,
    isLoading,
    isRecording,
    recordedAudio,
    audioRef,
    handleSendMessage,
    handleTextToSpeech,
    handleSpeechToText,
    handleStopRecording,
    handlePauseRecording,
    setRecordedAudio,
    chatHistory,
    currentChatId,
    handleNewChat,
    handleSelectChat,
  } = useChat();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-screen">
      <Sidebar 
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
      />

      <main className="flex flex-1 flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="container h-full max-w-3xl py-4">
            <div className="flex h-full flex-col">
              <div className="mb-4 text-center">
                <h1 className="text-2xl font-semibold">VONIX IA</h1>
                {isRecording && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                    <p className="text-sm font-medium text-red-500">Gravando áudio...</p>
                  </div>
                )}
                {!isRecording && (
                  <p className="text-sm text-muted-foreground">
                    Faça uma pergunta a IA Vonix ou clique no microfone para falar
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                <div className="flex flex-col gap-4 pb-4">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      onTextToSpeech={handleTextToSpeech}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                {isRecording && (
                  <div className="mb-2 flex items-center justify-center gap-2 rounded-md bg-red-50 py-2 text-sm text-red-500">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                    Gravando...
                  </div>
                )}
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onSpeechToText={handleSpeechToText}
                  isLoading={isLoading}
                  isRecording={isRecording}
                  recordedAudio={recordedAudio}
                  onStopRecording={handleStopRecording}
                  onPauseRecording={handlePauseRecording}
                  setRecordedAudio={setRecordedAudio}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
