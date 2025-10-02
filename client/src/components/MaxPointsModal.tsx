import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Check, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface MaxPointsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MaxPointsModal({ 
  open, 
  onOpenChange
}: MaxPointsModalProps) {
  const [, setLocation] = useLocation();

  const handleGoToWithdraw = () => {
    onOpenChange(false);
    setLocation("/resgatar");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Limite de 800 Pontos Atingido
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          {/* Alert Card */}
          <Card className="p-3 mb-3 bg-amber-50 border border-amber-200">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Parabéns pela conquista!</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Você acumulou 800 pontos. Para continuar ganhando e realizar saques, é necessário verificar sua conta.
                </p>
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="p-3 mb-3 bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Importante:</strong> Após verificar, você poderá acumular pontos ilimitadamente e sacar quando quiser.
            </p>
          </Card>

          {/* Benefits Card */}
          <Card className="p-3 mb-3 bg-white border border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-2">Ao verificar sua conta:</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-700">Acúmulo ilimitado de pontos</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-700">Saques disponíveis a qualquer momento</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-700">Pagamento via PIX em até 5 minutos</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Fixed Footer with Button */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <Button
            className="w-full"
            size="default"
            onClick={handleGoToWithdraw}
            data-testid="button-go-to-withdraw"
          >
            Verificar Conta e Sacar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}