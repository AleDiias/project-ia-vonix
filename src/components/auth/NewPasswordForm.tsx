
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface NewPasswordFormProps {
  onResetSuccess: () => void;
}

export function NewPasswordForm({ onResetSuccess }: NewPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {
      password?: string;
      confirmPassword?: string;
    } = {};
    
    // Validar senha
    if (!password) {
      newErrors.password = "A senha é obrigatória";
    } else if (password.length < 8) {
      newErrors.password = "A senha deve ter pelo menos 8 caracteres";
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = "A senha deve conter letras maiúsculas, minúsculas e números";
    }
    
    // Validar confirmação de senha
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const passwordStrength = () => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      
      toast({
        title: "Senha redefinida com sucesso",
        description: "Você pode fazer login com sua nova senha.",
      });
      
      setTimeout(() => {
        onResetSuccess();
      }, 3000);
    } catch (error: any) {
      setErrors({
        general: "Erro ao redefinir senha."
      });
      
      toast({
        title: "Erro ao redefinir senha",
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
            Defina uma nova senha para sua conta.
          </p>
          
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
            
            {password && (
              <div className="space-y-2">
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength()
                          ? passwordStrength() >= 3
                            ? "bg-green-500"
                            : passwordStrength() === 2
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Check className={`h-3 w-3 ${password.length >= 8 ? "text-green-500" : "text-gray-300"}`} />
                    <span>Mínimo de 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Check className={`h-3 w-3 ${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-300"}`} />
                    <span>Letra maiúscula</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Check className={`h-3 w-3 ${/[a-z]/.test(password) ? "text-green-500" : "text-gray-300"}`} />
                    <span>Letra minúscula</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Check className={`h-3 w-3 ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-300"}`} />
                    <span>Número</span>
                  </div>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errors.password}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirme a nova senha"
                className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errors.confirmPassword}
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
            {isLoading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </>
      ) : (
        <div className="space-y-4 text-center">
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-600">
              Senha redefinida com sucesso!
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Você será redirecionado para a tela de login em instantes...
          </p>
        </div>
      )}
    </form>
  );
}
