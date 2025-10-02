import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Check, ShieldCheck, AlertCircle, Gift, Timer, Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AUTHORIZATION_AMOUNT_CENTS, formatBRL } from "@shared/constants";
import { useState, useEffect } from "react";

interface AccountAuthorizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onAuthorize: () => void;
  onLater: () => void;
}

export default function AccountAuthorizationModal({ 
  open, 
  onOpenChange,
  amount,
  onAuthorize,
  onLater
}: AccountAuthorizationModalProps) {
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!open) {
      setTimeRemaining(600); // Reset timer when modal closes
      return;
    }

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
  }, [open]);

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
    onOpenChange(false);
  };

  const today = new Date().toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98%] max-w-4xl bg-white rounded-3xl p-0 border-0 max-h-[98vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Professional Red Discount Bar */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-8 py-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="bg-white/25 p-4 rounded-full backdrop-blur">
                <Gift className="w-10 h-10" />
              </div>
              <div>
                <p className="text-lg font-semibold opacity-95 uppercase tracking-wider mb-1">Oferta Exclusiva</p>
                <p className="text-4xl font-black mb-2">62% OFF</p>
                <div className="flex items-center gap-4">
                  <span className="text-xl line-through opacity-70">R$ 79,90</span>
                  <span className="text-3xl font-bold text-yellow-300">R$ 29,90</span>
                </div>
              </div>
            </div>
            <div className="bg-black/30 backdrop-blur-md rounded-2xl px-8 py-5 text-center border border-white/20">
              <Timer className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <span className="font-mono text-2xl font-bold block text-white">{formatTime(timeRemaining)}</span>
              <p className="text-sm mt-1 uppercase tracking-wider opacity-90 text-yellow-300">Restantes</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-10 py-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Shield Icon and Title */}
          <div className="text-center mb-10">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Shield className="w-20 h-20 text-blue-700" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Autorização de Conta
            </h2>
            <p className="text-xl text-gray-600">
              Ative sua conta com uma taxa única de segurança
            </p>
          </div>

          {/* Official App Card */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 flex items-center gap-5 shadow-xl mb-8">
            <div className="bg-white/25 p-4 rounded-full">
              <Star className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-white mb-1">
                APP OFICIAL RADIOPLAY BRASIL
              </p>
              <p className="text-base text-blue-100">
                Plataforma 100% verificada e segura com proteção total dos dados
              </p>
            </div>
          </div>

          {/* Blue Info Box */}
          <div className="bg-blue-50 rounded-2xl p-6 border-l-8 border-blue-600 mb-6">
            <h3 className="text-xl font-bold text-blue-900 mb-3">
              Conta Pendente de Autorização
            </h3>
            <p className="text-base text-blue-800 leading-relaxed">
              Sua conta está em modo básico. Para acessar recursos avançados da plataforma e funcionalidades completas, é necessário autorizar sua conta com uma verificação única de segurança.
            </p>
          </div>

          {/* Warning Alert */}
          <div className="bg-red-50 rounded-2xl p-6 border-l-8 border-red-600 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-8 h-8 text-red-700 mt-1 flex-shrink-0" />
              <div>
                <p className="text-lg text-red-900 font-bold mb-2">
                  Importante: Prazo Limite
                </p>
                <p className="text-base text-red-800">
                  Se a sua conta não for verificada até <strong>hoje, {today}</strong>, sua conta será deletada automaticamente para ceder a vaga a novos ouvintes.
                </p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-8">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Detalhes da Transação</h4>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-lg text-gray-700">Solicitação de saque:</span>
              <span className="text-lg font-bold text-gray-900">R$ {amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-lg text-gray-700">Taxa de autorização:</span>
              <span className="text-lg font-bold text-blue-700">{formatBRL(AUTHORIZATION_AMOUNT_CENTS)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-700">Status da conta:</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-lg font-bold text-orange-600">Aguardando Autorização</span>
              </div>
            </div>
          </div>

          {/* Guarantee Info */}
          <div className="bg-green-50 rounded-2xl p-6 space-y-4 mb-10">
            <div className="flex items-start gap-3">
              <div className="bg-green-200 p-2 rounded-full">
                <Check className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-900 mb-1">
                  30 Dias de Garantia Total
                </p>
                <p className="text-base text-green-800">
                  Você tem 30 dias para solicitar o reembolso completo do valor pago.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-200 p-2 rounded-full">
                <Check className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-900 mb-1">
                  Ativação Instantânea
                </p>
                <p className="text-base text-green-800">
                  Após o pagamento, sua conta é ativada imediatamente e os saques são liberados em até 5 minutos.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Authorize Button */}
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-8 text-2xl flex items-center justify-center gap-3 shadow-xl rounded-2xl"
              onClick={handleAuthorize}
              data-testid="button-authorize-account"
            >
              <Check className="w-8 h-8" />
              Aproveitar Desconto - R$ 29,90
            </Button>

            {/* Back Button */}
            <Button
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-6 text-xl flex items-center justify-center gap-3 rounded-2xl"
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
              Voltar
            </Button>
          </div>

          {/* Extra space for scrolling */}
          <div className="h-10"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}