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
      <DialogContent className="w-[90%] max-w-sm bg-white rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Bem-vindo ao RádioPlay</DialogTitle>
          <DialogDescription>
            Descubra como ganhar dinheiro ouvindo suas rádios favoritas
          </DialogDescription>
        </DialogHeader>
        
        {/* Logo Section */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 pb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <img src={logoUrl} alt="RádioPlay" className="h-12 object-contain" />
            </div>
          </div>
          <h1 className="text-white text-xl font-bold text-center">
            Bem-vindo ao RádioPlay! 🎉
          </h1>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5 -mt-4">
          {/* Welcome message */}
          <div className="bg-purple-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              Transforme seu tempo ouvindo rádio em <span className="font-semibold text-purple-600">dinheiro real</span> no seu PIX!
            </p>
          </div>
          
          {/* How it works */}
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Music className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Ouça suas rádios favoritas</h3>
                <p className="text-xs text-gray-600 mt-0.5">Escolha entre diversas estações disponíveis</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Acumule pontos automaticamente</h3>
                <p className="text-xs text-gray-600 mt-0.5">Ganhe pontos enquanto ouve música</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Converta em dinheiro real</h3>
                <p className="text-xs text-gray-600 mt-0.5">Saque direto para seu PIX quando quiser!</p>
              </div>
            </div>
          </div>
          
          {/* Motivational badge */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-5 border border-purple-100">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-medium text-purple-700">
                Comece agora e ganhe seus primeiros pontos!
              </p>
              <Sparkles className="w-4 h-4 text-pink-500" />
            </div>
          </div>
          
          {/* Start button */}
          <Button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-5 text-sm shadow-lg"
            data-testid="button-start-welcome"
          >
            Começar a ganhar dinheiro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}