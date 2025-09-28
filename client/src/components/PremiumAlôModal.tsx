import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Zap, X, MessageSquare } from "lucide-react";
import { redirectToLiraPay } from "@/lib/lirapay-redirect";

interface PremiumAloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PremiumAloModal({ open, onOpenChange }: PremiumAloModalProps) {
  const handleUnlockPremium = () => {
    onOpenChange(false);
    // Redirect to LiraPay for premium upgrade
    redirectToLiraPay('premium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-full p-0 overflow-hidden mx-auto rounded-2xl">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
          onClick={() => onOpenChange(false)}
          data-testid="close-premium-alo-modal"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <div className="flex items-center justify-center">
            <Lock className="w-6 h-6 text-white mr-2" />
            <h2 className="text-xl font-bold text-white">Recurso Premium</h2>
          </div>
        </div>

        <div className="p-6 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-purple-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Recurso Exclusivo Premium
            </h3>
            <p className="text-gray-700 text-base leading-relaxed font-medium">
              Para enviar mensagens ou alô torne-se um usuário <span className="font-bold text-purple-600">Premium</span>
            </p>
          </div>

          {/* Benefits list - simplificado */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>✓ Envie mensagens ilimitadas para as rádios</p>
            <p>✓ Ganhe 3x mais pontos por minuto</p>
            <p>✓ Acesso a todas as funcionalidades</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 shadow-lg flex items-center justify-center gap-2"
              onClick={handleUnlockPremium}
              data-testid="button-become-premium"
            >
              <Zap className="w-5 h-5" />
              Tornar-me Premium
            </Button>
            
            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-700 py-5 text-sm"
              onClick={() => onOpenChange(false)}
              data-testid="button-maybe-later"
            >
              Talvez depois
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}