import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const authorizationFee = 19.99;

  const handleAuthorize = () => {
    toast({
      title: "Autorização em processamento",
      description: "Você será notificado quando a autorização for concluída.",
      duration: 3000,
    });
    onAuthorize();
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
      <DialogContent className="w-[90%] max-w-sm bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
          onClick={() => onOpenChange(false)}
          data-testid="close-authorization-modal"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="space-y-4 pt-2">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Autorização de Conta Necessária
            </h2>
          </div>

          {/* Status Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Conta Pendente de Autorização
            </h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              Sua conta está em modo básico. Para acessar recursos avançados da plataforma e funcionalidades completas, é necessário autorizar sua conta com uma verificação única de segurança.
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3 px-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Solicitação atual:</span>
              <span className="text-sm font-bold text-gray-900">R$ {amount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Autorização única:</span>
              <span className="text-sm font-bold text-blue-600">R$ {authorizationFee.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Conta autorizada:</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-500">Pendente</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-5 text-sm shadow-lg flex items-center justify-center gap-2"
              onClick={handleAuthorize}
              data-testid="button-authorize-account"
            >
              <Shield className="w-4 h-4" />
              Autorizar Conta - R$ {authorizationFee.toFixed(2)}
            </Button>
            
            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 py-4 text-sm"
              onClick={handleLater}
              data-testid="button-authorize-later"
            >
              Autorizar mais tarde
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}