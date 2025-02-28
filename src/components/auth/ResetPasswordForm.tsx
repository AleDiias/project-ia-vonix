
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ResetPasswordFormProps {
  onLoginClick: () => void;
  onResetSuccess: () => void;
}

export function ResetPasswordForm({ onLoginClick, onResetSuccess }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    // Validar email
    if (!email) {
      newErrors.email = "O email é obrigatório";
    } else if (!email.endsWith("@vonix.com.br")) {
      newErrors.email = "Utilize apenas email corporativo (@vonix.com.br)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      
      toast({
        title: "Solicitação enviada",
        description: "Verifique seu email para redefinir sua senha.",
      });
      
      setTimeout(() => {
        onResetSuccess();
      }, 3000);
    } catch (error: any) {
      setErrors({
        general: "Erro ao solicitar redefinição de senha."
      });
      
      toast({
        title: "Erro ao processar solicitação",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      {!isSuccess ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Informe seu email corporativo para receber instruções de redefinição de senha.
          </p>
          
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="seu.nome@vonix.com.br"
                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errors.email}
              </p>
            )}
          </div>
          
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errors.general}
              </p>
            </div>
          )}
          
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar instruções"}
          </Button>
        </>
      ) : (
        <div className="space-y-4 text-center">
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-600">
              Email de redefinição enviado! Verifique sua caixa de entrada.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Você será redirecionado para a tela de login em instantes...
          </p>
        </div>
      )}
      
      <button
        type="button"
        onClick={onLoginClick}
        className="flex items-center justify-center gap-1 text-sm text-primary hover:underline w-full mt-4"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o login
      </button>
    </form>
  );
}
