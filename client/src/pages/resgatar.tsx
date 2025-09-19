import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Download, Coins, TrendingUp, Clock, ArrowRight, Star, Settings } from "lucide-react";
import logoUrl from '@/assets/logo.png';

interface ResgatarProps {
  playingRadioId: number | null;
  setPlayingRadioId: (id: number | null) => void;
  volume: number;
  setVolume: (volume: number) => void;
  sessionPoints: number;
  setSessionPoints: (points: number | ((prev: number) => number)) => void;
  balance: number;
  setBalance: (balance: number) => void;
}

export default function Resgatar({ balance, sessionPoints }: ResgatarProps) {

  const exchangeOptions = [
    {
      points: 100,
      value: 7.50,
      level: "Iniciante",
      percentage: "+400%",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      points: 300,
      value: 24.00,
      level: "Econômico",
      percentage: "+433%",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      points: 600,
      value: 60.00,
      level: "Vantajoso",
      percentage: "+567%",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgColor: "bg-blue-50",
      popular: true
    },
    {
      points: 1200,
      value: 150.00,
      level: "Máximo",
      percentage: "+733%",
      color: "bg-orange-500",
      textColor: "text-orange-500",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={logoUrl} 
                alt="RádioPlay" 
                className="h-8 md:h-10 w-auto object-contain" 
                data-testid="resgatar-logo"
              />
            </div>

            {/* Balance and Settings */}
            <div className="flex items-center gap-3">
              <div 
                className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-sm md:text-base"
                data-testid="balance-display"
              >
                R$ {balance.toFixed(2)}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="w-9 h-9"
                data-testid="settings-button"
                aria-label="Configurações"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          
          {/* Saldo Card */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 mb-4 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm mb-1">Saldo da sua carteira</p>
                <h2 className="text-3xl font-bold">R$ 0,00</h2>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          {/* Realizar Saque Button */}
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-base font-semibold mb-6"
            data-testid="button-withdraw"
          >
            <Download className="w-5 h-5 mr-2" />
            Realizar Saque
          </Button>

          {/* Como Funciona Section */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Como funciona</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">Ouça suas rádios favoritas e acumule pontos</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">Troque seus pontos por dinheiro real</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">Receba o pagamento via PIX em até 24h</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">Quanto mais pontos, melhor a taxa de conversão</p>
              </div>
            </div>
          </div>

          {/* Pontos Disponíveis */}
          <div className="flex items-center justify-between bg-primary/5 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <span className="font-semibold text-gray-900">Pontos disponíveis:</span>
            </div>
            <span className="font-bold text-xl text-primary">{sessionPoints} pts</span>
          </div>

          {/* Opções de Troca */}
          <div>
            <h3 className="font-bold text-lg mb-3">Opções de Troca</h3>
            <div className="space-y-3">
              {exchangeOptions.map((option, index) => {
                const missingPoints = option.points - sessionPoints;
                const hasEnoughPoints = sessionPoints >= option.points;
                
                return (
                  <Card 
                    key={index}
                    className={`p-4 border ${option.popular ? 'border-blue-500 shadow-md relative' : 'border-gray-200'}`}
                    data-testid={`exchange-option-${option.points}`}
                  >
                    {option.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Popular
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {option.points}pts
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="text-xl font-bold text-green-600">
                            R${option.value.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{option.level}</span>
                          <span className={`text-xs font-semibold ${option.textColor}`}>
                            {option.percentage}
                          </span>
                        </div>
                      </div>
                      
                      {!hasEnoughPoints ? (
                        <Button
                          variant="default"
                          className={`${option.color === 'bg-orange-500' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                          data-testid={`button-missing-${option.points}`}
                        >
                          Falta {missingPoints}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          data-testid={`button-exchange-${option.points}`}
                        >
                          Trocar
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}