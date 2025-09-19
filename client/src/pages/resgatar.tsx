import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Wallet, 
  Download, 
  Coins, 
  AlertCircle, 
  Settings,
  CheckCircle,
  Clock,
  PiggyBank
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
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
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [, setLocation] = useLocation();
  const minimumWithdrawal = 150;

  const handleWithdraw = () => {
    if (balance < minimumWithdrawal) {
      setShowInsufficientModal(true);
    } else {
      alert('Saque processado com sucesso!');
    }
  };

  const handleContinueListening = () => {
    setShowInsufficientModal(false);
    setLocation('/dashboard');
  };

  const exchangeOptions = [
    {
      points: 100,
      value: 7.50,
      conversionRate: "R$ 0,075/pt",
      badge: null,
    },
    {
      points: 300,
      value: 24.00,
      conversionRate: "R$ 0,08/pt",
      badge: null,
    },
    {
      points: 600,
      value: 60.00,
      conversionRate: "R$ 0,10/pt",
      badge: "Popular",
    },
    {
      points: 1200,
      value: 150.00,
      conversionRate: "R$ 0,125/pt",
      badge: "Melhor taxa",
    }
  ];

  const filteredOptions = showOnlyAvailable 
    ? exchangeOptions.filter(option => sessionPoints >= option.points)
    : exchangeOptions;

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

            {/* Settings */}
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
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          
          {/* Compact Stats Section */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="p-4 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Saldo disponível</p>
                  <p className="text-lg font-bold text-green-600" data-testid="balance-stat">
                    R$ {balance.toFixed(2)}
                  </p>
                </div>
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </Card>
            
            <Card className="p-4 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pontos acumulados</p>
                  <p className="text-lg font-bold text-primary" data-testid="points-stat">
                    {sessionPoints} pts
                  </p>
                </div>
                <Coins className="w-5 h-5 text-primary" />
              </div>
            </Card>
          </div>

          {/* Title and Filter */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Escolha um valor para resgatar
            </h2>
            
            {/* Filter Toggle */}
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="filter-available"
                checked={showOnlyAvailable}
                onCheckedChange={setShowOnlyAvailable}
                data-testid="filter-toggle"
              />
              <Label htmlFor="filter-available" className="text-sm text-gray-600">
                Mostrar apenas disponíveis
              </Label>
            </div>
          </div>

          {/* Exchange Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {filteredOptions.map((option, index) => {
              const percentage = Math.min((sessionPoints / option.points) * 100, 100);
              const missingPoints = Math.max(option.points - sessionPoints, 0);
              const missingPercentage = Math.round(((option.points - sessionPoints) / option.points) * 100);
              const hasEnoughPoints = sessionPoints >= option.points;
              
              return (
                <Card 
                  key={index}
                  className={`p-3 sm:p-4 transition-all ${
                    hasEnoughPoints 
                      ? 'border-primary shadow-md hover:shadow-lg' 
                      : 'border-gray-200 opacity-50'
                  }`}
                  data-testid={`exchange-option-${option.points}`}
                >
                  {/* Badge */}
                  {option.badge && (
                    <Badge 
                      variant="default" 
                      className="mb-2 text-xs bg-primary/10 text-primary border-0"
                    >
                      {option.badge}
                    </Badge>
                  )}
                  
                  {/* Points and Value */}
                  <div className="space-y-1 mb-3">
                    <div className="text-lg font-bold text-gray-900">
                      {option.points} pontos
                    </div>
                    <div className="text-base font-semibold text-green-600">
                      R$ {option.value.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.conversionRate}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                    {!hasEnoughPoints && (
                      <p className="text-xs text-gray-500 mt-1">
                        Faltam {missingPoints} pts ({missingPercentage}%)
                      </p>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    size="sm"
                    variant={hasEnoughPoints ? "default" : "outline"}
                    className={hasEnoughPoints ? "w-full bg-primary hover:bg-primary/90" : "w-full"}
                    disabled={!hasEnoughPoints}
                    data-testid={hasEnoughPoints ? `button-exchange-${option.points}` : `button-missing-${option.points}`}
                  >
                    {hasEnoughPoints ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Trocar
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Indisponível
                      </>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <Card className="p-3 bg-blue-50/50 border-blue-200">
              <div className="flex items-start gap-2">
                <PiggyBank className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">Saque mínimo</p>
                  <p className="text-sm text-blue-700">R$ 150,00</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-green-50/50 border-green-200">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-green-900">Prazo PIX</p>
                  <p className="text-sm text-green-700">Até 24 horas</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Como Funciona Accordion */}
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="how-it-works" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-gray-900">Como funciona?</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                    <p>Ouça rádios e acumule pontos automaticamente</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                    <p>Troque pontos por dinheiro real</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                    <p>Receba via PIX em até 24h</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                    <p>Melhores taxas com mais pontos</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Withdrawal Button */}
          <div className="mt-6">
            <Button 
              variant="outline"
              className="w-full py-2"
              data-testid="button-withdraw"
              onClick={handleWithdraw}
            >
              <Download className="w-4 h-4 mr-2" />
              Realizar Saque
            </Button>
          </div>
        </div>
      </main>

      {/* Insufficient Balance Modal */}
      <Dialog open={showInsufficientModal} onOpenChange={setShowInsufficientModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-orange-500" />
              </div>
              <DialogTitle className="text-xl font-bold">Saldo Insuficiente</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="text-center space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Saque mínimo:</span> R$ {minimumWithdrawal.toFixed(2)}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Seu saldo atual:</span> R$ {balance.toFixed(2)}
              </p>
              <p className="text-red-600 font-semibold">
                <span>Faltam:</span> R$ {(minimumWithdrawal - balance).toFixed(2)}
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-center text-sm">
                Continue ouvindo suas rádios favoritas para acumular mais saldo!
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowInsufficientModal(false)}
                data-testid="button-close-modal"
              >
                Fechar
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={handleContinueListening}
                data-testid="button-continue-listening"
              >
                Continuar Ouvindo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}