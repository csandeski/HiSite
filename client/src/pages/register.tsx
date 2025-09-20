import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Radio } from "lucide-react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.username || !formData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName || undefined,
        password: formData.password
      });
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao RádioPlay"
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar sua conta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Radio className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Cadastre-se e comece a ganhar dinheiro ouvindo rádio
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Usuário *</Label>
              <Input
                id="username"
                type="text"
                placeholder="Escolha um nome de usuário"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
                data-testid="input-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo (opcional)"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={loading}
                data-testid="input-fullname"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                data-testid="input-password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                data-testid="input-confirm-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
              data-testid="button-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link href="/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </div>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link href="/terms" className="underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="underline">
              Política de Privacidade
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}