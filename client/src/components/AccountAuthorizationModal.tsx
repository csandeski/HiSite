import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Check, ShieldCheck, AlertCircle, Gift, Timer } from "lucide-react";
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

  const today = new Date().toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-sm bg-white rounded-2xl p-6 border-0 max-h-[90vh] flex flex-col">
        <div className="space-y-4 overflow-y-auto">
          {/* Discount Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Desconto Exclusivo!</span>
            </div>
            <p className="text-[10px] mb-2">
              Parabéns! Por já ter conquistado pontos no RádioPlay, você ganhou um desconto especial:
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] line-through opacity-70">De R$ 79,90</p>
                <p className="text-lg font-bold">Por R$ 29,90</p>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span className="font-mono text-sm font-bold">{formatTime(timeRemaining)}</span>
                </div>
                <p className="text-[9px] text-center mt-0.5">restantes</p>
              </div>
            </div>
          </div>

          {/* Shield Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-9 h-9 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-gray-900">
            Autorização de Conta Necessária
          </h2>

          {/* Official App Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-white flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">
                VOCÊ ESTÁ NO APP OFICIAL 100% SEGURO
              </p>
              <p className="text-[10px] text-blue-100 mt-0.5">
                Plataforma verificada e protegida
              </p>
            </div>
          </div>

          {/* Blue Info Box */}
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Conta Pendente de Autorização
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Sua conta está em modo básico. Para acessar recursos avançados da plataforma e funcionalidades completas, é necessário autorizar sua conta com uma verificação única de segurança.
            </p>
          </div>

          {/* Warning Alert */}
          <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-500">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-800 font-semibold">
                  Importante:
                </p>
                <p className="text-[11px] text-red-700 mt-1">
                  Se a sua conta não for verificada até dia <strong>{today}</strong>, sua conta será deletada afim de ceder a vaga a novos ouvintes.
                </p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Solicitação atual:</span>
              <span className="text-sm font-bold text-gray-900">R$ {amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Autorização única:</span>
              <span className="text-sm font-bold text-blue-600">{formatBRL(AUTHORIZATION_AMOUNT_CENTS)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conta autorizada:</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-orange-500" />
                <span className="text-sm font-bold text-orange-500">Pendente</span>
              </div>
            </div>
          </div>

          {/* Guarantee Info */}
          <div className="bg-green-50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs text-green-800">
                  <strong>30 dias de garantia:</strong> Você tem 30 dias de garantia para solicitar o reembolso total do valor.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs text-green-800">
                  <strong>Ativação imediata:</strong> Após o pagamento a ativação é feita imediata e seu dinheiro cai em até 5 minutos depois de confirmado o saque no RádioPlay Oficial!
                </p>
              </div>
            </div>
          </div>

          {/* Authorize Button */}
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 text-base flex items-center justify-center gap-2 shadow-lg"
            onClick={handleAuthorize}
            data-testid="button-authorize-account"
          >
            <Check className="w-5 h-5" />
            Aproveitar Desconto - R$ 29,90
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}