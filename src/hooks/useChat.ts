import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, sendChatMessage, textToSpeech } from "@/lib/api";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
    {
      id: "1",
      title: "Primeira conversa",
      timestamp: new Date(),
    },
  ]);
  const [currentChatId, setCurrentChatId] = useState<string>("1");

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    try {
      setIsLoading(true);
      addMessage("user", message);
      
      const response = await sendChatMessage(message);
      addMessage("assistant", response);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, toast]);

  const handleTextToSpeech = useCallback(async (text: string) => {
    try {
      const audioData = await textToSpeech(text);
      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao reproduzir áudio. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSpeechToText = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao iniciar gravação. Verifique as permissões do microfone.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handlePauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Gravação Pausada",
        description: "Clique no microfone para continuar gravando.",
      });
    }
  }, [isRecording, toast]);

  const handleNewChat = useCallback(() => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: "Nova conversa",
      timestamp: new Date(),
    };
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages([]);
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    setCurrentChatId(id);
    setMessages([]);
  }, []);

  return {
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
  };
}
