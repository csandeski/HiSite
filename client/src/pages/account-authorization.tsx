import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Clock, Check, AlertCircle, Timer, ChevronLeft, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AUTHORIZATION_AMOUNT_CENTS, formatBRL } from "@shared/constants";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import logoUrl from '@/assets/logo.png';

export default function AccountAuthorization() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  // Get user data to check account status
  const { data: userData } = useQuery({ 
    queryKey: ["/api/auth/me"]
  });

  // Check if user is authenticated
  useEffect(() => {
    if (userData === null) {
      setLocation("/login");
    }
  }, [userData, setLocation]);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAuthorize = () => {
    // Redirect to payment link
    window.location.href = 'https://pay.lirapaybr.com/GEzPWRoy';
  };

  const handleBack = () => {
    setLocation("/resgatar");
  };

  const today = new Date().toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Calculate user balance
  const balance = user ? (user.points * 0.125) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - exactly like dashboard */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side: Back button and Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Voltar"
                data-testid="button-back-navigation"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <img 
                src={logoUrl} 
                alt="RádioPlay" 
                className="h-7 md:h-9 w-auto object-contain" 
                data-testid="authorization-logo"
              />
            </div>

            {/* Right side: Balance display */}
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-sm md:text-base"
                data-testid="balance-display"
              >
                R$ {balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          
          {/* Page Title Card */}
          <Card className="p-6 mb-6 bg-white border-0 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-9 h-9 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Autorização de Conta</h1>
                <p className="text-gray-600 mt-1">Ative sua conta com segurança</p>
              </div>
            </div>
          </Card>

          {/* Promotional Offer Card */}
          <Card className="p-5 mb-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Oferta Especial</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">62% OFF</span>
                  <span className="text-sm text-gray-400 line-through">R$ 79,90</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatBRL(AUTHORIZATION_AMOUNT_CENTS)}</p>
              </div>
              <div className="bg-primary/10 rounded-lg px-4 py-3">
                <Timer className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-sm font-mono font-bold text-primary">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </Card>

          {/* Account Status Card */}
          <Card className="p-5 mb-6 bg-white border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status da Conta</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Status atual:</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-orange-600">Aguardando Autorização</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Taxa de autorização:</span>
                <span className="font-bold text-primary">{formatBRL(AUTHORIZATION_AMOUNT_CENTS)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Validade:</span>
                <span className="font-medium text-green-600">Vitalício</span>
              </div>
            </div>
          </Card>

          {/* Important Notice Card */}
          <Card className="p-5 mb-6 bg-white border-l-4 border-l-orange-500 shadow-sm">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-2">Prazo Importante</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Sua conta precisa ser autorizada até <strong>{today}</strong> para manter acesso completo aos recursos da plataforma.
                </p>
              </div>
            </div>
          </Card>

          {/* Benefits Card */}
          <Card className="p-5 mb-6 bg-white border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefícios da Autorização</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">30 Dias de Garantia</p>
                  <p className="text-sm text-gray-600 mt-0.5">Solicite reembolso completo em até 30 dias</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ativação Instantânea</p>
                  <p className="text-sm text-gray-600 mt-0.5">Conta ativada imediatamente após o pagamento</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Saques Liberados</p>
                  <p className="text-sm text-gray-600 mt-0.5">Realize saques sem restrições em até 5 minutos</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Suporte Prioritário</p>
                  <p className="text-sm text-gray-600 mt-0.5">Atendimento exclusivo disponível 24/7</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Platform Info Card */}
          <Card className="p-5 mb-6 bg-white border-0 shadow-sm">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 mb-2">PLATAFORMA OFICIAL</p>
              <p className="text-lg font-bold text-primary">RadioPlay Brasil</p>
              <p className="text-sm text-gray-600 mt-2">Aplicativo verificado com proteção total de dados</p>
            </div>
          </Card>

        </div>
      </main>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
            onClick={handleAuthorize}
            data-testid="button-authorize-account"
          >
            Autorizar Conta Agora
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Pagamento seguro • Garantia de 30 dias
          </p>
        </div>
      </div>
    </div>
  );
}