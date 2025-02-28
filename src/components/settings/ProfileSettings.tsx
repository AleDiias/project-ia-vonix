
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ProfileSettingsProps {
  profile: any;
  setProfile: (profile: any) => void;
}

export function ProfileSettings({ profile, setProfile }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("O arquivo deve ser uma imagem");
      return;
    }
    
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
        
      const publicUrl = data.publicUrl;
      
      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      
      if (updateError) throw updateError;
      
      setAvatarUrl(publicUrl);
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Avatar atualizado com sucesso");
      
    } catch (error: any) {
      console.error("Erro ao fazer upload do avatar:", error);
      toast.error(`Erro ao fazer upload do avatar: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }
  
  async function handleSaveProfile() {
    if (!fullName.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
      
      if (error) throw error;
      
      setProfile({ ...profile, full_name: fullName });
      toast.success("Perfil atualizado com sucesso");
      
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast.error(`Erro ao salvar perfil: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }
  
  const getUserInitials = () => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e como você aparece no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="text-lg bg-secondary">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Alterar avatar</span>
                  </>
                )}
              </Button>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={profile.email || ""}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                E-mail não pode ser alterado
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveProfile} 
            disabled={isSaving}
            className="hover-pulse"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
