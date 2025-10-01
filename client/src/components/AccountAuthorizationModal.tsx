import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AUTHORIZATION_AMOUNT_CENTS, formatBRL } from "@shared/constants";

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

  const handleAuthorize = () => {
    // Redirect to LiraPay payment link
    window.location.href = 'https://pay.lirapaybr.com/GEzPWRoy';
  };

  const handleLater = () => {
    toast({
      title: "Autorização adiada",
      description: "Você pode autorizar sua conta a qualquer momento.",
      duration: 3000,
    });
    onLater();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-sm bg-white rounded-2xl p-6 border-0">
        <div className="space-y-5">
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

          {/* Blue Info Box */}
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Conta Pendente de Autorização
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Sua conta está em modo básico. Para acessar recursos avançados da plataforma e funcionalidades completas, é necessário autorizar sua conta com uma verificação única de segurança.
            </p>
          </div>

          {/* Details Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Solicitação atual:</span>
              <span className="text-sm font-bold text-gray-900">R$ {amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Autorização única:</span>
              <span className="text-sm font-bold text-blue-600">R$ 19,99</span>
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-sm flex items-center justify-center gap-2"
            onClick={handleAuthorize}
            data-testid="button-authorize-account"
          >
            <Check className="w-4 h-4" />
            Autorizar Conta - R$ 19,99
          </Button>

          {/* Later Link */}
          <button
            onClick={handleLater}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            data-testid="button-authorize-later"
          >
            Autorizar mais tarde
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}