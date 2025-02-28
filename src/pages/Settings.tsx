
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { HistorySettings } from "@/components/settings/HistorySettings";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          toast.error("Erro ao carregar perfil");
          console.error("Erro ao carregar perfil:", error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        toast.error("Erro ao carregar usuário");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>
      
      <Separator className="mb-6" />

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : profile ? (
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="history">Histórico e Dados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6 space-y-6">
            <ProfileSettings profile={profile} setProfile={setProfile} />
          </TabsContent>
          
          <TabsContent value="security" className="mt-6 space-y-6">
            <SecuritySettings />
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-6 space-y-6">
            <PreferencesSettings profile={profile} setProfile={setProfile} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6 space-y-6">
            <HistorySettings />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center p-8">
          <p className="text-muted-foreground">Erro ao carregar perfil. Por favor, tente novamente.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
