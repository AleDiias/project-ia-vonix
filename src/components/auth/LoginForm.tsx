
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onSignupClick: () => void;
  onResetPasswordClick: () => void;
}

export function LoginForm({ onSignupClick, onResetPasswordClick }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Validar email
    if (!email) {
      newErrors.email = "O email é obrigatório";
    } else if (!email.endsWith("@vonix.com.br")) {
      newErrors.email = "Utilize apenas email corporativo (@vonix.com.br)";
    }
    
    // Validar senha
    if (!password) {
      newErrors.password = "A senha é obrigatória";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando para o dashboard...",
      });
      
      navigate("/");
    } catch (error: any) {
      setErrors({
        general: "Credenciais inválidas. Verifique seu email e senha."
      });
      
      toast({
        title: "Erro ao fazer login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
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
      
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.password}
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
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
      
      <div className="space-y-2">
        <button
          type="button"
          onClick={onResetPasswordClick}
          className="text-sm text-primary hover:underline w-full text-center"
          disabled={isLoading}
        >
          Esqueci minha senha
        </button>
        
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className="text-muted-foreground">Ainda não tem conta?</span>
          <button
            type="button"
            onClick={onSignupClick}
            className="text-primary hover:underline"
            disabled={isLoading}
          >
            Cadastre-se
          </button>
        </div>
      </div>
    </form>
  );
}
