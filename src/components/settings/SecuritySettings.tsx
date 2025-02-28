
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { KeyRound, Loader2, LogOut, ShieldCheck, ShieldOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  
  useEffect(() => {
    async function fetchDevices() {
      try {
        setLoadingDevices(true);
        
        // Obter o usuário atual
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error("Usuário não autenticado");
          return;
        }
        
        // Buscar dispositivos conectados
        const { data: deviceData, error } = await supabase
          .from('user_devices')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('last_active', { ascending: false });
        
        if (error) {
          console.error("Erro ao buscar dispositivos:", error);
          toast.error("Erro ao carregar dispositivos conectados");
          return;
        }
        
        // Se não houver dispositivos, registre o dispositivo atual
        if (deviceData.length === 0) {
          await registerCurrentDevice(userData.user.id);
          return;
        }
        
        setDevices(deviceData);
      } catch (error) {
        console.error("Erro ao buscar dispositivos:", error);
        toast.error("Erro ao carregar dispositivos conectados");
      } finally {
        setLoadingDevices(false);
      }
    }
    
    async function registerCurrentDevice(userId: string) {
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
        
        // Registrar dispositivo atual
        const { data, error } = await supabase
          .from('user_devices')
          .insert([{
            user_id: userId,
            device_name: deviceName,
            browser: browser,
            ip_address: "IP não armazenado",
            is_current: true
          }])
          .select()
          .single();
        
        if (error) {
          console.error("Erro ao registrar dispositivo atual:", error);
          return;
        }
        
        setDevices([data]);
      } catch (error) {
        console.error("Erro ao registrar dispositivo:", error);
      } finally {
        setLoadingDevices(false);
      }
    }
    
    fetchDevices();
  }, []);
  
  async function handleChangePassword() {
    // Validate passwords
    if (!currentPassword) {
      toast.error("Senha atual é obrigatória");
      return;
    }
    
    if (!newPassword) {
      toast.error("Nova senha é obrigatória");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Senha alterada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error(`Erro ao alterar senha: ${error.message}`);
    } finally {
      setIsChangingPassword(false);
    }
  }
  
  async function handleToggle2FA() {
    try {
      setIsToggling2FA(true);
      
      // Simulando ativação/desativação de 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIs2FAEnabled(!is2FAEnabled);
      toast.success(`Autenticação em dois fatores ${!is2FAEnabled ? "ativada" : "desativada"} com sucesso`);
      
    } catch (error: any) {
      console.error("Erro ao alterar 2FA:", error);
      toast.error(`Erro ao alterar 2FA: ${error.message}`);
    } finally {
      setIsToggling2FA(false);
    }
  }
  
  async function handleLogoutDevice(deviceId: string) {
    try {
      // Remover dispositivo do banco de dados
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);
      
      if (error) throw error;
      
      setDevices(devices.filter(device => device.id !== deviceId));
      toast.success("Dispositivo desconectado com sucesso");
      
    } catch (error: any) {
      console.error("Erro ao desconectar dispositivo:", error);
      toast.error(`Erro ao desconectar dispositivo: ${error.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Atualize sua senha para manter sua conta segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente sua nova senha"
            />
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleChangePassword} 
              disabled={isChangingPassword}
              className="w-full sm:w-auto hover-pulse"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando senha...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {is2FAEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            ) : (
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
            )}
            Autenticação em Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            Aumente a segurança da sua conta exigindo um segundo fator de autenticação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">
                {is2FAEnabled ? "Ativado" : "Desativado"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled 
                  ? "Sua conta está protegida com autenticação em dois fatores." 
                  : "Ative a autenticação em dois fatores para aumentar a segurança da sua conta."}
              </p>
            </div>
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={handleToggle2FA}
              disabled={isToggling2FA}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Conectados</CardTitle>
          <CardDescription>
            Gerencie os dispositivos que estão conectados à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDevices ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Última atividade</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.length > 0 ? (
                    devices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {device.device_name} {device.is_current && "(Este dispositivo)"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {device.browser}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(device.last_active).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </TableCell>
                        <TableCell>{device.ip_address}</TableCell>
                        <TableCell className="text-right">
                          {!device.is_current && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <LogOut className="h-4 w-4 mr-1" />
                                  Desconectar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Desconectar dispositivo?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação irá encerrar a sessão neste dispositivo. O usuário precisará fazer login novamente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleLogoutDevice(device.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Desconectar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Nenhum dispositivo encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
