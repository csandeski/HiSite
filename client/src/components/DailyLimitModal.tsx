import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface DailyLimitModalProps {
  isOpen: boolean;
}

export default function DailyLimitModal({ isOpen }: DailyLimitModalProps) {
  const [, setLocation] = useLocation();

  const handleActivate = () => {
    setLocation("/account-authorization");
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[90%] sm:max-w-sm p-0 overflow-hidden rounded-xl border-0">
        {/* Simple header with primary color */}
        <div className="bg-gradient-to-r from-primary to-primary/90 p-4 text-white">
          <div className="flex items-center justify-center">
            <Lock className="w-12 h-12" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Title and message */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Limite Diário Atingido
            </h2>
            <p className="text-sm text-gray-600">
              Você atingiu o limite de <strong>600 pontos</strong> para contas gratuitas hoje.
            </p>
          </div>

          {/* Simple alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-blue-900 font-medium mb-1">
                Conta Gratuita Limitada
              </p>
              <p className="text-xs text-blue-800">
                Para continuar ganhando pontos sem limites, ative sua conta Premium.
              </p>
            </div>
          </div>

          {/* Key benefits - super simple */}
          <div className="space-y-2 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Com conta Premium:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Ganhe pontos ilimitados</li>
              <li>✓ Saques liberados a partir de R$ 100</li>
              <li>✓ Até R$ 4.500 por mês</li>
            </ul>
          </div>

          {/* Action button */}
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 text-base rounded-lg"
            onClick={handleActivate}
            data-testid="button-activate-premium"
          >
            Ativar Conta Premium
          </Button>

          <p className="text-[10px] text-center text-gray-500">
            Taxa única • Ativação imediata
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}