
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

type AuthView = "login" | "signup" | "reset-password" | "new-password";

export default function Auth() {
  const [view, setView] = useState<AuthView>("login");
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col items-center">
            <img 
              src="/lovable-uploads/1175b20e-5839-483e-9af8-65652b42b639.png" 
              alt="Vonix Logo" 
              className="h-16 mb-4" 
            />
            <h1 className="text-xl font-bold tracking-tight text-primary mt-2">IA Corporativa</h1>
            <p className="mt-2 text-center text-muted-foreground">
              {view === "login" && "Entre com sua conta corporativa"}
              {view === "signup" && "Crie sua conta corporativa"}
              {view === "reset-password" && "Recupere sua senha"}
              {view === "new-password" && "Defina sua nova senha"}
            </p>
          </div>
          
          {view === "login" && (
            <LoginForm 
              onSignupClick={() => setView("signup")}
              onResetPasswordClick={() => setView("reset-password")}
            />
          )}
          
          {view === "signup" && (
            <SignupForm 
              onLoginClick={() => setView("login")}
            />
          )}
          
          {view === "reset-password" && (
            <ResetPasswordForm 
              onLoginClick={() => setView("login")}
              onResetSuccess={() => setView("login")}
            />
          )}
          
          {view === "new-password" && (
            <NewPasswordForm 
              onResetSuccess={() => setView("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
