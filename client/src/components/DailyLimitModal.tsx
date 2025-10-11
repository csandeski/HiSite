import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, Clock, Star, Zap, Users, Lock, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { formatBRL, AUTHORIZATION_AMOUNT_CENTS } from "@shared/constants";

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
      <DialogContent className="max-w-[95%] sm:max-w-md md:max-w-lg mx-auto p-0 overflow-hidden rounded-xl">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 text-white">
          <div className="absolute top-0 right-0 p-3">
            <Lock className="w-5 h-5 text-white/70" />
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">🎉 Parabéns! Você Atingiu 600 Pontos!</h2>
            <p className="text-white/90 text-sm">Você alcançou o limite diário de usuário gratuito</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status Message */}
          <Card className="p-4 bg-amber-50 border border-amber-200">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Limite Diário Atingido</p>
                <p className="text-xs text-amber-800">
                  Como usuário gratuito, você pode ganhar até <strong>600 pontos por dia</strong>. 
                  Para continuar ganhando sem limites, ative sua conta Premium agora!
                </p>
              </div>
            </div>
          </Card>

          {/* Benefits */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 text-center">Com a Conta Premium Você:</p>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Ganhos Ilimitados</p>
                  <p className="text-xs text-gray-600">Sem limite diário de pontos</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Até R$ 4.500/mês</p>
                  <p className="text-xs text-gray-600">Potencial de ganhos mensais</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Star className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Saques Liberados</p>
                  <p className="text-xs text-gray-600">Resgatar a partir de R$ 100</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <Gift className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Bônus Exclusivos</p>
                  <p className="text-xs text-gray-600">Promoções e multiplicadores</p>
                </div>
              </div>
            </div>
          </div>

          {/* Limited Time Offer */}
          <Card className="p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Taxa única vitalícia</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">{formatBRL(AUTHORIZATION_AMOUNT_CENTS)}</span>
                  <span className="text-xs text-gray-400 line-through">R$ 79,90</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-orange-600">HOJE APENAS!</p>
                <p className="text-xs text-gray-600">62% OFF</p>
              </div>
            </div>
          </Card>

          {/* Users Count */}
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <p className="text-xs">
              <strong>8.247 usuários</strong> já ativaram hoje
            </p>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-5 text-lg rounded-xl shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
            onClick={handleActivate}
            data-testid="button-activate-premium"
          >
            Ativar Conta Premium Agora
          </Button>

          <p className="text-xs text-center text-gray-500">
            ✓ Pagamento seguro • ✓ Garantia de 30 dias • ✓ Ativação imediata
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}