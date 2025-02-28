
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Globe, Bell, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PreferencesSettingsProps {
  profile: any;
  setProfile: (profile: any) => void;
}

export function PreferencesSettings({ profile, setProfile }: PreferencesSettingsProps) {
  const [theme, setTheme] = useState(profile.theme || "light");
  const [language, setLanguage] = useState(profile.language || "pt");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile.notifications_enabled !== undefined ? profile.notifications_enabled : true
  );
  const [isSaving, setIsSaving] = useState(false);
  
  // Atualiza o tema do sistema
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  
  async function handleSavePreferences() {
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          theme, 
          language, 
          notifications_enabled: notificationsEnabled 
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      setProfile({ 
        ...profile, 
        theme, 
        language, 
        notifications_enabled: notificationsEnabled 
      });
      
      toast.success("Preferências atualizadas com sucesso");
      
    } catch (error: any) {
      console.error("Erro ao salvar preferências:", error);
      toast.error(`Erro ao salvar preferências: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>
            Escolha como o sistema será exibido para você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className={`h-5 w-5 ${theme === "light" ? "text-orange-500" : "text-muted-foreground"}`} />
              <Label htmlFor="theme-toggle">Alternar Tema</Label>
              <Moon className={`h-5 w-5 ${theme === "dark" ? "text-blue-500" : "text-muted-foreground"}`} />
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma
          </CardTitle>
          <CardDescription>
            Escolha o idioma que você prefere usar no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base">Notificações por E-mail</Label>
              <p className="text-sm text-muted-foreground">
                Receba notificações por e-mail sobre respostas a prompts e novidades do sistema.
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSavePreferences} 
          disabled={isSaving}
          className="hover-pulse"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar preferências"
          )}
        </Button>
      </div>
    </div>
  );
}
