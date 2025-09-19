import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PremiumPopup({ open, onOpenChange }: PremiumPopupProps) {
  const { toast } = useToast();

  const handleUnlockPremium = () => {
    toast({
      title: "Premium",
      description: "Em breve você poderá desbloquear o Premium!",
      duration: 3000,
    });
    onOpenChange(false);
  };

  const handleContinueFree = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
          onClick={() => onOpenChange(false)}
          data-testid="close-premium-popup"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
              <Zap className="w-10 h-10 text-white" fill="white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">
            Ganhe até 10x mais rápido!
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed px-4">
            Você já viu funcionando. Agora imagine multiplicar seus ganhos por 10x e ter acesso a todas as estações de rádios!
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-base shadow-lg"
              onClick={handleUnlockPremium}
              data-testid="button-unlock-premium"
            >
              Desbloquear Premium
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-6 text-base font-medium"
              onClick={handleContinueFree}
              data-testid="button-continue-free"
            >
              Continuar Grátis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}