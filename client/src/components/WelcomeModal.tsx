import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Music, TrendingUp, DollarSign, Sparkles } from "lucide-react";
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
      <DialogContent className="w-[95%] max-w-md max-h-[90vh] bg-white rounded-3xl p-0 overflow-y-auto flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Bem-vindo ao RádioPlay</DialogTitle>
          <DialogDescription>
            Descubra como ganhar dinheiro ouvindo suas rádios favoritas
          </DialogDescription>
        </DialogHeader>
        
        {/* Logo Section */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 pb-6 sm:pb-8 flex-shrink-0">
          <div className="flex justify-center mb-3">
            <img src={logoUrl} alt="RádioPlay" className="h-10 sm:h-12 object-contain" />
          </div>
          <h1 className="text-white text-lg sm:text-xl font-bold text-center">
            Bem-vindo ao RádioPlay! 🎉
          </h1>
        </div>
        
        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 -mt-3 sm:-mt-4 flex-1 overflow-y-auto">
          {/* Welcome message */}
          <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-gray-700 text-center leading-relaxed">
              Transforme seu tempo ouvindo rádio em <span className="font-semibold text-blue-600">dinheiro real</span> no seu PIX!
            </p>
          </div>
          
          {/* How it works */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Music className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Ouça suas rádios favoritas</h3>
                <p className="text-xs text-gray-600 mt-0.5">Escolha entre diversas estações disponíveis</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Acumule pontos automaticamente</h3>
                <p className="text-xs text-gray-600 mt-0.5">Ganhe pontos enquanto ouve música</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Converta em dinheiro real</h3>
                <p className="text-xs text-gray-600 mt-0.5">Saque direto para seu PIX quando quiser!</p>
              </div>
            </div>
          </div>
          
          {/* Motivational badge */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3 mb-4 sm:mb-5 border border-blue-100">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              <p className="text-xs font-medium text-blue-700">
                Comece agora e ganhe seus primeiros pontos!
              </p>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
            </div>
          </div>
          
          {/* Start button */}
          <Button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 sm:py-5 text-xs sm:text-sm shadow-lg"
            data-testid="button-start-welcome"
          >
            Começar a ganhar dinheiro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}