import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Music, 
  TrendingUp, 
  DollarSign, 
  Sparkles,
  CheckCircle,
  Users
} from "lucide-react";
import logoUrl from '@/assets/logo.png';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function WelcomeModal({ open, onOpenChange, onComplete }: WelcomeModalProps) {
  
  const handleStart = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] sm:w-full max-w-sm p-0 bg-white rounded-2xl border-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary to-blue-500 p-4 text-white">
          <div className="flex items-center justify-center mb-3">
            <img src={logoUrl} alt="RádioPlay" className="h-8 object-contain brightness-0 invert" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold mb-1">
              Bem-vindo ao RádioPlay! 🎉
            </h2>
            <p className="text-xs text-white/90">
              Ganhe dinheiro ouvindo rádio
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* How it works - super simple */}
          <div className="space-y-2">
            <p className="text-sm text-gray-700 text-center font-medium mb-3">
              Como funciona:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Music className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-gray-600">Escolha uma rádio e escute</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Ganhe pontos automaticamente</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Converta em dinheiro via PIX</p>
              </div>
            </div>
          </div>

          {/* Conversion info */}
          <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Mínimo para saque:</p>
                <p className="text-sm font-bold text-blue-600">R$ 100,00</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-600 mb-0.5">Potencial mensal:</p>
                <p className="text-sm font-bold text-green-600">R$ 500 - R$ 4.500</p>
              </div>
            </div>
          </Card>

          {/* Users badge */}
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <p className="text-xs">
              <strong>+10.000 usuários</strong> já estão ganhando
            </p>
          </div>

          {/* Action button */}
          <Button 
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 text-base rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
            data-testid="button-start-welcome"
          >
            Começar Agora
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>100% Gratuito</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Pagamento Garantido</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}