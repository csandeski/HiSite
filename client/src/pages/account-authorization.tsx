import { Button } from "@/components/ui/button";
import { Shield, Clock, Check, AlertCircle, Timer, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AUTHORIZATION_AMOUNT_CENTS, formatBRL } from "@shared/constants";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function AccountAuthorization() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header with Back Button */}
      <div className="sticky top-0 bg-white shadow-sm z-50">
        <div className="flex items-center p-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Voltar"
            data-testid="button-back-navigation"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 ml-2">Autorização de Conta</h1>
        </div>
      </div>

      {/* Red Discount Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider opacity-90">Oferta Exclusiva</p>
              <p className="text-3xl font-bold">62% OFF</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm line-through opacity-75">R$ 79,90</span>
                <span className="text-2xl font-bold">R$ 29,90</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 text-center">
              <Timer className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24 max-w-lg mx-auto">
        {/* Icon and Title */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-14 h-14 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Autorização de Conta</h2>
          <p className="text-gray-600 mt-2">Ative sua conta com uma taxa única de segurança</p>
        </div>

        {/* Official App Badge */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-5 mb-6 shadow-lg">
          <p className="text-lg font-bold text-center">APP OFICIAL RADIOPLAY BRASIL</p>
          <p className="text-sm text-center mt-2 opacity-95">Plataforma 100% verificada e segura com proteção total dos dados</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <h3 className="font-bold text-blue-900 text-lg mb-2">
            Conta Pendente de Autorização
          </h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            Sua conta está em modo básico. Para acessar recursos avançados e funcionalidades completas, é necessário autorizar sua conta.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-bold text-red-800">
                Importante: Prazo Limite
              </p>
              <p className="text-sm text-red-700 mt-2 leading-relaxed">
                Se não for verificada até dia <strong>{today}</strong>, sua conta será deletada para ceder vaga a novos ouvintes.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Detalhes da Transação</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Taxa de autorização:</span>
              <span className="font-bold text-blue-600">{formatBRL(AUTHORIZATION_AMOUNT_CENTS)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Status da conta:</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-orange-500 whitespace-nowrap">Aguardando Autorização</span>
              </div>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Validade:</span>
              <span className="font-semibold text-green-600">Vitalício</span>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">30 Dias de Garantia Total</p>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">Você tem 30 dias para solicitar o reembolso completo do valor pago.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Ativação Instantânea</p>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">Após o pagamento, sua conta é ativada imediatamente e os saques são liberados em até 5 minutos.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Suporte Prioritário</p>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">Acesso ao suporte exclusivo com atendimento prioritário 24/7.</p>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-lg mx-auto">
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-6 text-xl rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]"
              onClick={handleAuthorize}
              data-testid="button-authorize-account"
            >
              Aproveitar Desconto de 62%
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}