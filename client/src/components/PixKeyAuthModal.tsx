import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, Shield, AlertCircle, X, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import PixPaymentModal from "./PixPaymentModal";
import { useAuth } from "@/contexts/AuthContext";

interface PixKeyAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PixKeyAuthModal({ open, onOpenChange }: PixKeyAuthModalProps) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [showPixPayment, setShowPixPayment] = useState(false);

  const handleProceedWithAuth = () => {
    onOpenChange(false);
    setShowPixPayment(true);
  };

  const handleCancel = () => {
    onOpenChange(false);
    toast({
      title: "Autenticação cancelada",
      description: "Você pode autenticar sua chave PIX a qualquer momento para realizar saques.",
      duration: 4000,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-full p-0 overflow-hidden mx-auto rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Autenticação de Chave PIX</DialogTitle>
            <DialogDescription>
              Autentique sua chave PIX para poder realizar saques
            </DialogDescription>
          </DialogHeader>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            data-testid="close-pix-auth-modal"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Autenticação de Segurança</h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Main Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Key className="w-12 h-12 text-blue-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Title and Description */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Autentique sua Chave PIX
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Para sua segurança e poder realizar saques, você precisa autenticar sua chave PIX. 
                Este é um processo único e rápido.
              </p>
            </div>

            {/* Important Info Alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-amber-900">
                    Taxa de Autenticação: R$ 19,90
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Esta taxa é <strong>100% reembolsável</strong> e será devolvida ao seu saldo 
                    após a conclusão da autenticação. É apenas para verificar a titularidade da sua chave PIX.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits list */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Após a autenticação você poderá:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Realizar saques <strong>ilimitados</strong> para sua conta</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Receber os <strong>R$ 19,90 de volta</strong> no seu saldo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Ter sua conta <strong>100% verificada</strong> e segura</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Processo <strong>único</strong> - faça uma vez e use sempre</span>
                </li>
              </ul>
            </div>

            {/* Refund guarantee badge */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  Garantia de Reembolso Total
                </span>
              </div>
              <p className="text-xs text-green-700 text-center mt-1">
                O valor será creditado automaticamente após a autenticação
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6 shadow-lg flex items-center justify-center gap-2"
                onClick={handleProceedWithAuth}
                data-testid="button-proceed-auth"
              >
                <Shield className="w-5 h-5" />
                Autenticar Agora
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-6 text-sm font-medium"
                onClick={handleCancel}
                data-testid="button-cancel-auth"
              >
                Fazer isso depois
              </Button>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>Processo seguro e criptografado</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIX Payment Modal for authentication */}
      {showPixPayment && (
        <PixPaymentModal
          open={showPixPayment}
          onOpenChange={(open) => {
            setShowPixPayment(open);
            // Refresh user data when modal closes after successful payment
            if (!open) {
              refreshUser();
            }
          }}
          type="pix_key_auth"
          amount={19.90}
        />
      )}
    </>
  );
}