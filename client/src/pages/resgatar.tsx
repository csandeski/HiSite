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
  PiggyBank,
  RefreshCw,
  ArrowRight,
  TrendingUp
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
  setBalance: (balance: number | ((prev: number) => number)) => void;
}

export default function Resgatar({ balance, sessionPoints, setSessionPoints, setBalance }: ResgatarProps) {
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(() => {
    const saved = localStorage.getItem('resgatar-showOnlyAvailable');
    return saved === 'true';
  });
  const [accordionValue, setAccordionValue] = useState<string | undefined>(() => {
    const saved = localStorage.getItem('resgatar-accordionValue');
    return saved || undefined;
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<{points: number, value: number} | null>(null);
  const [, setLocation] = useLocation();
  const minimumWithdrawal = 150;

  // Save checkbox state to localStorage whenever it changes
  const handleShowOnlyAvailableChange = (checked: boolean) => {
    setShowOnlyAvailable(checked);
    localStorage.setItem('resgatar-showOnlyAvailable', checked.toString());
  };

  // Save accordion state to localStorage whenever it changes
  const handleAccordionChange = (value: string) => {
    setAccordionValue(value);
    localStorage.setItem('resgatar-accordionValue', value || '');
  };

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

  const handleExchange = (points: number, value: number) => {
    setSelectedExchange({ points, value });
    setShowConfirmationModal(true);
  };

  const confirmExchange = () => {
    if (selectedExchange) {
      // Deduct points and add to balance
      setSessionPoints((prev: number) => prev - selectedExchange.points);
      setBalance(prev => prev + selectedExchange.value);
      setShowConfirmationModal(false);
      setSelectedExchange(null);
    }
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
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          
          {/* Stats Section - Padronizado */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <div className="px-4 text-center">
                <Wallet className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-900" data-testid="balance-stat">
                  R$ {balance.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-500">Saldo disponível</p>
              </div>
              
              <div className="px-4 text-center">
                <Coins className="w-6 h-6 text-primary mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-900" data-testid="points-stat">
                  {sessionPoints}
                </h3>
                <p className="text-sm text-gray-500">Pontos acumulados</p>
              </div>
            </div>
          </div>

          {/* Withdrawal Button - Destacado */}
          <div className="mb-6">
            <Button 
              variant="default"
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-base shadow-lg"
              data-testid="button-withdraw"
              onClick={handleWithdraw}
            >
              <Download className="w-5 h-5 mr-2" />
              Realizar Saque
            </Button>
          </div>

          {/* Title and Filter */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Escolha um valor para resgatar
            </h2>
            
            {/* Filter Toggle - Estilizado */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3">
              <Switch
                id="filter-available"
                checked={showOnlyAvailable}
                onCheckedChange={handleShowOnlyAvailableChange}
                data-testid="filter-toggle"
              />
              <Label htmlFor="filter-available" className="text-sm font-medium text-gray-700 cursor-pointer">
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
                  className={`p-4 transition-all ${
                    hasEnoughPoints 
                      ? 'border-2 border-primary shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-blue-50/30' 
                      : 'border border-gray-200 opacity-60'
                  }`}
                  data-testid={`exchange-option-${option.points}`}
                >
                  {/* Badge */}
                  {option.badge && (
                    <Badge 
                      variant="default" 
                      className="mb-3 text-sm bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary border border-primary/30 font-semibold px-3 py-1"
                    >
                      {option.badge}
                    </Badge>
                  )}
                  
                  {/* Points and Value */}
                  <div className="space-y-2 mb-4">
                    <div className="text-xl font-bold text-gray-900">
                      {option.points} pontos
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      R$ {option.value.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {option.conversionRate}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <Progress 
                      value={percentage} 
                      className="h-2.5"
                    />
                    {!hasEnoughPoints && (
                      <p className="text-sm text-gray-500 mt-1.5">
                        Faltam {missingPoints} pts ({missingPercentage}%)
                      </p>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    variant={hasEnoughPoints ? "default" : "outline"}
                    className={hasEnoughPoints ? "w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-5" : "w-full py-5"}
                    disabled={!hasEnoughPoints}
                    onClick={() => hasEnoughPoints && handleExchange(option.points, option.value)}
                    data-testid={hasEnoughPoints ? `button-exchange-${option.points}` : `button-missing-${option.points}`}
                  >
                    {hasEnoughPoints ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Trocar Agora
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Indisponível
                      </>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Info Cards - Melhorados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Saque mínimo</p>
                  <p className="text-base font-bold text-blue-700">R$ 150,00</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">Prazo PIX</p>
                  <p className="text-base font-bold text-green-700">Imediato</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Como Funciona Accordion */}
          <Accordion type="single" collapsible className="mb-6" value={accordionValue} onValueChange={handleAccordionChange}>
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
                    <p>Receba via PIX imediato</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                    <p>Melhores taxas com mais pontos</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </main>

      {/* Insufficient Balance Modal */}
      <Dialog open={showInsufficientModal} onOpenChange={setShowInsufficientModal}>
        <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-full bg-white rounded-2xl mx-auto">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-10 h-10 text-orange-500" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">Saldo Insuficiente</DialogTitle>
                <p className="text-sm text-gray-600">Você precisa de mais saldo para realizar o saque</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Balance Info Card */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Saque mínimo:</span>
                  <span className="text-base font-semibold text-gray-900">R$ {minimumWithdrawal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Seu saldo atual:</span>
                  <span className="text-base font-semibold text-gray-900">R$ {balance.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600">Faltam:</span>
                    <span className="text-lg font-bold text-red-600">R$ {(minimumWithdrawal - balance).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress to Goal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Progresso</span>
                <span className="font-medium">{Math.round((balance / minimumWithdrawal) * 100)}%</span>
              </div>
              <Progress value={(balance / minimumWithdrawal) * 100} className="h-2" />
            </div>
            
            {/* Tip Card */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-green-900">Continue ganhando!</p>
                  <p className="text-xs text-green-800">
                    Ouça suas rádios favoritas para acumular mais saldo. Com apenas mais {Math.ceil((minimumWithdrawal - balance) / 0.075)} pontos você atinge o mínimo!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 py-5 border-gray-300 hover:bg-gray-50"
                onClick={() => setShowInsufficientModal(false)}
                data-testid="button-close-modal"
              >
                Fechar
              </Button>
              <Button
                className="flex-1 py-5 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold"
                onClick={handleContinueListening}
                data-testid="button-continue-listening"
              >
                Continuar Ouvindo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-full p-0 overflow-hidden mx-auto rounded-lg">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
            onClick={() => setShowConfirmationModal(false)}
            data-testid="close-conversion-modal"
          >
            <AlertCircle className="w-4 h-4 sr-only" />
            <span className="sr-only">Fechar</span>
          </Button>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Header with Icon */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Confirmar Conversão
              </h2>
              <p className="text-sm text-gray-600">
                Você está prestes a converter seus pontos em dinheiro real!
              </p>
            </div>

            {/* Conversion Details */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Pontos a converter</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{selectedExchange?.points} pts</span>
                </div>
                
                <div className="flex justify-center">
                  <div className="bg-white rounded-full p-2">
                    <ArrowRight className="w-4 h-4 text-green-600 transform rotate-90" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Valor em dinheiro</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">R$ {selectedExchange?.value.toFixed(2)}</span>
                </div>

                <div className="border-t border-green-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Taxa de conversão</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-600">
                        R$ {selectedExchange?.value && selectedExchange?.points ? 
                          (selectedExchange.value / selectedExchange.points).toFixed(3) : '0.000'}/pt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-amber-800">Atenção:</span>
                <span className="text-amber-700"> Esta ação não pode ser desfeita. Os pontos serão removidos da sua conta e o valor será adicionado à sua carteira.</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-5 sm:py-6"
                onClick={confirmExchange}
                data-testid="button-confirm-exchange"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Conversão
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 py-5 sm:py-6"
                onClick={() => setShowConfirmationModal(false)}
                data-testid="button-cancel-exchange"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}