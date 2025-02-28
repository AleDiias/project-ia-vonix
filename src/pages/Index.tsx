
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage as ChatMessageType } from "@/lib/api";
import { archiveChat, createChat, getChatHistory, getChatMessages, saveMessage, updateChatTitle } from "@/lib/db";

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [sending, setSending] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatTitle, setChatTitle] = useState("Nova conversa");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        
        if (data && data.user) {
          setUser(data.user);
          
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else {
            setUserProfile(profileData);
          }

          // Register current device
          await registerCurrentDevice(data.user.id);
        } else {
          navigate("/auth");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user data",
        });
        setLoading(false);
      }
    };

    const registerCurrentDevice = async (userId: string) => {
      try {
        // Detectar informações do navegador e dispositivo atual
        const userAgent = window.navigator.userAgent;
        let deviceName = "Dispositivo desconhecido";
        let browser = "Navegador desconhecido";
        
        // Detecção básica de dispositivo
        if (/iPhone|iPad|iPod/.test(userAgent)) {
          deviceName = "iPhone/iPad";
        } else if (/Android/.test(userAgent)) {
          deviceName = "Android";
        } else if (/Windows/.test(userAgent)) {
          deviceName = "Windows";
        } else if (/Mac/.test(userAgent)) {
          deviceName = "Mac";
        } else if (/Linux/.test(userAgent)) {
          deviceName = "Linux";
        }
        
        // Detecção básica de navegador
        if (/Edge|Edg/.test(userAgent)) {
          browser = "Microsoft Edge";
        } else if (/Chrome/.test(userAgent)) {
          browser = "Google Chrome";
        } else if (/Safari/.test(userAgent)) {
          browser = "Safari";
        } else if (/Firefox/.test(userAgent)) {
          browser = "Firefox";
        } else if (/Opera|OPR/.test(userAgent)) {
          browser = "Opera";
        }
        
        // Verificar se já existe um dispositivo atual para este usuário
        const { data: existingDevices, error: checkError } = await supabase
          .from('user_devices')
          .select('*')
          .eq('user_id', userId)
          .eq('is_current', true);
          
        if (checkError) {
          console.error("Erro ao verificar dispositivos:", checkError);
          return;
        }
        
        // Se já existir um dispositivo atual, atualizar o timestamp
        if (existingDevices && existingDevices.length > 0) {
          const { error: updateError } = await supabase
            .from('user_devices')
            .update({ last_active: new Date().toISOString() })
            .eq('id', existingDevices[0].id);
            
          if (updateError) {
            console.error("Erro ao atualizar dispositivo:", updateError);
          }
          return;
        }
        
        // Caso contrário, registrar um novo dispositivo
        const { error: insertError } = await supabase
          .from('user_devices')
          .insert([{
            user_id: userId,
            device_name: deviceName,
            browser: browser,
            ip_address: "IP não armazenado",
            is_current: true
          }]);
        
        if (insertError) {
          console.error("Erro ao registrar dispositivo:", insertError);
        }
      } catch (error) {
        console.error("Erro ao registrar dispositivo:", error);
      }
    };

    fetchUserAndProfile();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  const fetchChatHistory = async () => {
    try {
      const chats = await getChatHistory();
      setChatHistory(chats);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch chat history",
      });
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      const messages = await getChatMessages(chatId);
      setMessages(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch chat messages",
      });
    }
  };

  const newChat = async () => {
    try {
      setMessages([]);
      const chat = await createChat("Nova conversa");
      setCurrentChatId(chat.id);
      setChatTitle("Nova conversa");
      await fetchChatHistory();
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create new chat",
      });
    }
  };

  const selectChat = async (chatId: string, title: string) => {
    setCurrentChatId(chatId);
    setChatTitle(title);
    await fetchChatMessages(chatId);
    setIsSidebarOpen(false);
  };

  const handleTitleChange = async (newTitle: string) => {
    try {
      if (currentChatId) {
        await updateChatTitle(currentChatId, newTitle);
        setChatTitle(newTitle);
        await fetchChatHistory();
      }
    } catch (error) {
      console.error("Error updating chat title:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update chat title",
      });
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      fetchChatMessages(currentChatId);
    }
  }, [currentChatId]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setSending(true);

      // If there's no current chat, create a new one
      if (!currentChatId) {
        const chat = await createChat("Nova conversa");
        setCurrentChatId(chat.id);
        setChatTitle("Nova conversa");
        await fetchChatHistory();
      }

      const userMessage: ChatMessageType = {
        role: "user",
        content: message,
      };

      // Add user message to UI
      setMessages((prev) => [...prev, userMessage]);

      // Save user message to database
      await saveMessage(currentChatId!, userMessage);

      // Simulate AI response
      setTimeout(async () => {
        const aiMessage: ChatMessageType = {
          role: "assistant",
          content: "Esta é uma resposta simulada da IA. Em uma implementação real, aqui viria a resposta da API da OpenAI ou outro serviço de IA.",
        };

        // Add AI message to UI
        setMessages((prev) => [...prev, aiMessage]);

        // Save AI message to database
        await saveMessage(currentChatId!, aiMessage);

        setSending(false);
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
      setSending(false);
    }
  };

  const handleTextToSpeech = (text: string) => {
    // Implementação básica de texto para fala usando a API nativa
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  const getUserInitials = () => {
    if (!userProfile?.full_name) return "U";
    return userProfile.full_name
      .split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onNewChat={newChat}
        onSelectChat={(id, title) => selectChat(id, title)}
        onTitleChange={handleTitleChange}
      />

      <div className="flex flex-col flex-1">
        <header className="border-b p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-md"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            {currentChatId && (
              <Input
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                onBlur={() => handleTitleChange(chatTitle)}
                className="max-w-[200px] md:max-w-xs"
                placeholder="Título da conversa"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              {userProfile && (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:block">
                    {userProfile.full_name}
                  </span>
                </>
              )}
            </div>
            <Link to="/settings">
              <Button variant="ghost" size="icon" title="Configurações">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <h2 className="text-2xl font-bold mb-2">Bem-vindo à IA Vonix</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Você pode me perguntar sobre qualquer assunto.
                Estou aqui para ajudar com soluções em tecnologia e telecomunicações.
              </p>
              <div className="grid gap-3 md:grid-cols-2 max-w-2xl w-full">
                <Button
                  variant="outline"
                  className="justify-start p-4 h-auto"
                  onClick={() => handleSendMessage("O que é VoIP?")}
                >
                  <div className="text-left">
                    <p>O que é VoIP?</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start p-4 h-auto"
                  onClick={() => handleSendMessage("Explique o que é um discador automático e como funciona.")}
                >
                  <div className="text-left">
                    <p>Explique o que é um discador automático</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start p-4 h-auto"
                  onClick={() => handleSendMessage("Quais são as principais métricas para um Call Center?")}
                >
                  <div className="text-left">
                    <p>Principais métricas para Call Center</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start p-4 h-auto"
                  onClick={() => handleSendMessage("Como posso integrar um sistema CRM com telefonia?")}
                >
                  <div className="text-left">
                    <p>Integrar CRM com telefonia</p>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  message={message} 
                  onTextToSpeech={handleTextToSpeech}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
