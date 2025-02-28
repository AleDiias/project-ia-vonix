
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface SignupFormProps {
  onLoginClick: () => void;
}

export function SignupForm({ onLoginClick }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    // Validar nome
    if (!name.trim()) {
      newErrors.name = "O nome completo é obrigatório";
    }
    
    // Validar email
    if (!email) {
      newErrors.email = "O email é obrigatório";
    } else if (!email.endsWith("@vonix.com.br")) {
      newErrors.email = "Utilize apenas email corporativo (@vonix.com.br)";
    }
    
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Você pode fazer login agora.",
      });
      
      onLoginClick();
    } catch (error: any) {
      setErrors({
        general: "Erro ao criar conta. O email pode já estar em uso."
      });
      
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente mais tarde.",
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
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            id="name"
            type="text"
            placeholder="Nome completo"
            className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.name}
          </p>
        )}
      </div>
      
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
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
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
            placeholder="Confirme a senha"
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
        {isLoading ? "Cadastrando..." : "Cadastrar"}
      </Button>
      
      <div className="text-center">
        <span className="text-sm text-muted-foreground">Já tem uma conta?</span>{" "}
        <button
          type="button"
          onClick={onLoginClick}
          className="text-sm text-primary hover:underline"
          disabled={isLoading}
        >
          Entrar
        </button>
      </div>
    </form>
  );
}
