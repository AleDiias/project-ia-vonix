
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, sendChatMessage, textToSpeech } from "@/lib/api";
import * as db from "@/lib/db";
import { format, differenceInDays, isThisWeek, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Chat {
  id: string;
  title: string;
  created_at: string;
  archived: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await db.getChatHistory();
      setChatHistory(history);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico de conversas.",
        variant: "destructive",
      });
    }
  };

  const generateTitle = (message: string) => {
    return message.length > 50 ? `${message.slice(0, 47)}...` : message;
  };

  const addMessage = useCallback(async (role: "user" | "assistant", content: string) => {
    if (!currentChatId) return;

    const newMessage: ChatMessage = { role, content };
    setMessages(prev => [...prev, newMessage]);
    
    try {
      await db.saveMessage(currentChatId, newMessage);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar mensagem.",
        variant: "destructive",
      });
    }
  }, [currentChatId, toast]);

  const handleSendMessage = useCallback(async (message: string) => {
    try {
      setIsLoading(true);
      
      if (!currentChatId) {
        // Criar novo chat
        const title = generateTitle(message);
        const newChat = await db.createChat(title);
        setCurrentChatId(newChat.id);
        setChatHistory(prev => [newChat, ...prev]);
        
        // Adicionar mensagem do usuário ao estado antes de enviar para a API
        const userMessage: ChatMessage = { role: "user", content: message };
        setMessages([userMessage]);
        
        // Salvar mensagem no banco de dados
        await db.saveMessage(newChat.id, userMessage);
        
        // Enviar para a API e obter resposta
        const response = await sendChatMessage(message);
        
        // Adicionar resposta ao estado e salvar no banco
        const assistantMessage: ChatMessage = { role: "assistant", content: response };
        setMessages(prev => [...prev, assistantMessage]);
        await db.saveMessage(newChat.id, assistantMessage);
      } else {
        // Adicionar mensagem do usuário ao estado
        const userMessage: ChatMessage = { role: "user", content: message };
        setMessages(prev => [...prev, userMessage]);
        
        // Salvar mensagem no banco de dados
        await db.saveMessage(currentChatId, userMessage);
        
        // Enviar para a API e obter resposta
        const response = await sendChatMessage(message);
        
        // Adicionar resposta ao estado e salvar no banco
        const assistantMessage: ChatMessage = { role: "assistant", content: response };
        setMessages(prev => [...prev, assistantMessage]);
        await db.saveMessage(currentChatId, assistantMessage);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, toast]);

  const handleSelectChat = useCallback(async (id: string) => {
    try {
      const messages = await db.getChatMessages(id);
      setMessages(messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })));
      setCurrentChatId(id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar conversa.",
        variant: "destructive",
      });
    }
  }, []);

  const handleNewChat = useCallback(async () => {
    setCurrentChatId(null);
    setMessages([]);
  }, []);

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

  const handleArchiveChat = useCallback(async (id: string) => {
    try {
      await db.archiveChat(id);
      setChatHistory(prev => prev.filter(chat => chat.id !== id));
      if (currentChatId === id) {
        setCurrentChatId(null);
        setMessages([]);
      }
      toast({
        title: "Conversa arquivada",
        description: "A conversa foi arquivada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao arquivar conversa.",
        variant: "destructive",
      });
    }
  }, [currentChatId, toast]);

  const handleDeleteChat = useCallback(async (id: string) => {
    try {
      await db.deleteChat(id);
      setChatHistory(prev => prev.filter(chat => chat.id !== id));
      if (currentChatId === id) {
        setCurrentChatId(null);
        setMessages([]);
      }
      toast({
        title: "Conversa excluída",
        description: "A conversa foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir conversa.",
        variant: "destructive",
      });
    }
  }, [currentChatId, toast]);

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
    handleArchiveChat,
    handleDeleteChat,
  };
}
