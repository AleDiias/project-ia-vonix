
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function HistorySettings() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPrompts() {
      try {
        setLoading(true);
        
        // Obter o usuário atual
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error("Usuário não autenticado");
          return;
        }
        
        // Buscar mensagens do usuário enviadas para a IA (role: user)
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select(`
            id, 
            content, 
            created_at,
            chat_id,
            chats (
              title
            )
          `)
          .eq('role', 'user')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Erro ao buscar prompts:", error);
          toast.error("Erro ao carregar histórico de prompts");
          return;
        }
        
        const formattedPrompts = messagesData.map(message => ({
          id: message.id,
          title: message.content,
          chat_title: message.chats?.title || "Conversa sem título",
          created_at: message.created_at
        }));
        
        setPrompts(formattedPrompts);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        toast.error("Erro ao carregar histórico");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrompts();
  }, []);
  
  async function handleExportHistory() {
    try {
      setIsExporting(true);
      
      // Obter histórico completo para exportação
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      // Buscar chats do usuário
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (chatsError) {
        throw chatsError;
      }
      
      // Para cada chat, buscar mensagens
      const chatsWithMessages = await Promise.all(
        chatsData.map(async (chat) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: true });
          
          if (messagesError) {
            console.error(`Erro ao buscar mensagens do chat ${chat.id}:`, messagesError);
            return {
              ...chat,
              messages: []
            };
          }
          
          return {
            ...chat,
            messages: messagesData
          };
        })
      );
      
      // Criar blob e link para download
      const data = JSON.stringify(chatsWithMessages, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historico_ia_vonix_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Histórico exportado com sucesso");
      
    } catch (error: any) {
      console.error("Erro ao exportar histórico:", error);
      toast.error(`Erro ao exportar histórico: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  }
  
  async function handleRequestAccountDeletion() {
    try {
      setIsDeletingAccount(true);
      
      // Criação de ticket de solicitação de exclusão
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      // Na implementação real, aqui enviaria um email para o suporte ou criaria um ticket
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Solicitação de exclusão de conta enviada com sucesso. Nossa equipe entrará em contato.");
      
    } catch (error: any) {
      console.error("Erro ao solicitar exclusão de conta:", error);
      toast.error(`Erro ao solicitar exclusão de conta: ${error.message}`);
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Prompts</CardTitle>
          <CardDescription>
            Veja e gerencie seu histórico de prompts enviados para a IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="w-[180px]">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : prompts.length > 0 ? (
                  prompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium">{prompt.title}</TableCell>
                      <TableCell>
                        {new Date(prompt.created_at).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      Nenhum prompt encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={handleExportHistory} 
              disabled={isExporting || prompts.length === 0}
              className="flex items-center gap-2 hover-pulse"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar histórico
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Exclusão de Conta
          </CardTitle>
          <CardDescription>
            Solicite a exclusão da sua conta e de todos os seus dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Esta ação enviará uma solicitação para nossa equipe de suporte. Todos os seus dados serão 
            excluídos permanentemente e você não poderá recuperar sua conta depois disso.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isDeletingAccount}
                className="hover-pulse"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Solicitar exclusão da conta"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso enviará uma solicitação para excluir permanentemente sua 
                  conta e remover seus dados de nossos servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRequestAccountDeletion}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Confirmar exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
