import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Radio } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await login(formData.username, formData.password);
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso"
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Usuário ou senha inválidos",
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
          <CardTitle className="text-2xl font-bold">RádioPlay</CardTitle>
          <CardDescription>
            Entre para começar a ganhar ouvindo rádio
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
                data-testid="input-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                data-testid="input-password"
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
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link href="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}