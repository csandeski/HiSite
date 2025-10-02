import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, AlertCircle } from "lucide-react";
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
      <DialogContent className="sm:max-w-[425px] w-full max-w-full p-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10" />
            <div className="text-center">
              <p className="text-2xl font-bold">Limite Atingido!</p>
              <p className="text-base mt-1 opacity-90">Você atingiu 800 pontos</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Alert Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-orange-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
            Você Atingiu o Máximo no Momento!
          </h2>

          {/* Description */}
          <p className="text-base text-center text-gray-600 mb-6 leading-relaxed">
            Parabéns! Você acumulou 800 pontos. Para continuar ganhando e realizar seu primeiro saque, é necessário verificar sua conta.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Após verificar sua conta, você poderá continuar acumulando pontos ilimitadamente e realizar saques quando quiser.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-green-900 mb-2">Ao verificar sua conta você terá:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-green-800">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Acúmulo ilimitado de pontos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-green-800">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Saques disponíveis a qualquer momento</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-green-800">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Pagamento via PIX em até 5 minutos</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
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