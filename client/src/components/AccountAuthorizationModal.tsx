import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Check, AlertCircle, Gift, Timer, ArrowLeft } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[90%] p-0 rounded-2xl overflow-hidden">
        {/* Red Discount Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider opacity-90">Oferta Exclusiva</p>
              <p className="text-2xl font-bold">62% OFF</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm line-through opacity-75">R$ 79,90</span>
                <span className="text-xl font-bold">R$ 29,90</span>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
              <Timer className="w-4 h-4 mx-auto mb-1" />
              <span className="text-sm font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Title Section */}
          <div className="text-center mb-5">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-9 h-9 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Autorização de Conta</h2>
            <p className="text-sm text-gray-600 mt-1">Ative sua conta com uma taxa única de segurança</p>
          </div>

          {/* Official App Badge */}
          <div className="bg-blue-600 text-white rounded-lg p-3 mb-4">
            <p className="text-sm font-bold text-center">APP OFICIAL RADIOPLAY BRASIL</p>
            <p className="text-xs text-center mt-1 opacity-90">Plataforma 100% verificada e segura com proteção total dos dados</p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
            <h3 className="font-semibold text-blue-900 text-sm mb-1">
              Conta Pendente de Autorização
            </h3>
            <p className="text-xs text-blue-700">
              Sua conta está em modo básico. Para acessar recursos avançados e funcionalidades completas, é necessário autorizar sua conta.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-800">
                  Importante: Prazo Limite
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Se não for verificada hoje, sua conta será deletada para ceder vaga a novos ouvintes.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Solicitação atual:</span>
                <span className="font-semibold">R$ {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxa de autorização:</span>
                <span className="font-semibold text-blue-600">{formatBRL(AUTHORIZATION_AMOUNT_CENTS)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status da conta:</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span className="font-semibold text-orange-500">Aguardando Autorização</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div className="space-y-3 mb-5">
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">30 Dias de Garantia Total</p>
                <p className="text-xs text-gray-600">Você tem 30 dias para solicitar o reembolso completo do valor pago.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Ativação Instantânea</p>
                <p className="text-xs text-gray-600">Após o pagamento, sua conta é ativada imediatamente e os saques são liberados em até 5 minutos.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-base"
              onClick={handleAuthorize}
              data-testid="button-authorize-account"
            >
              Aproveitar Desconto - R$ 29,90
            </Button>
            
            <Button
              variant="outline"
              className="w-full font-semibold py-3 text-base"
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}