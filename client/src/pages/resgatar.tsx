import { useState, useEffect } from 'react';
import ConversionModal from '@/components/ConversionModal';
import WithdrawModal from '@/components/WithdrawModal';
import WithdrawProcessingModal from '@/components/WithdrawProcessingModal';
import AccountAuthorizationModal from '@/components/AccountAuthorizationModal';
import PixKeyAuthModal from '@/components/PixKeyAuthModal';
import { useAuth } from '@/contexts/AuthContext';
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
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import logoUrl from '@/assets/logo.png';
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ResgatarProps {
  playingRadioId: number | null;
  setPlayingRadioId: (id: number | null) => void;
  volume: number;
  setVolume: (volume: number) => void;
  sessionPoints: number;
  setSessionPoints: (points: number | ((prev: number) => number)) => void;
  balance: number;
  setBalance: (balance: number | ((prev: number) => number)) => void;
  refreshPoints?: () => Promise<void>;
  isRefreshingPoints?: boolean;
}

export default function Resgatar({ balance, sessionPoints, setSessionPoints, setBalance, refreshPoints, isRefreshingPoints }: ResgatarProps) {
  const { toast } = useToast();
  const { user } = useAuth();
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
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [conversionData, setConversionData] = useState<{points: number, value: number} | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWithdrawProcessing, setShowWithdrawProcessing] = useState(false);
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [showPixKeyAuthModal, setShowPixKeyAuthModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [, setLocation] = useLocation();
  const minimumWithdrawal = 150;

  // Don't refresh points on mount - keep the current state
  // Points are already being tracked and saved in real-time

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

  const handleWithdraw = async () => {
    // Sync points to database before withdraw operation
    if ((window as any).syncCurrentPoints) {
      try {
        console.log('[RESGATAR] Syncing points before withdraw...');
        await (window as any).syncCurrentPoints();
        console.log('[RESGATAR] Points synced successfully');
      } catch (error) {
        console.error('[RESGATAR] Failed to sync points before withdraw:', error);
      }
    }
    
    if (balance < minimumWithdrawal) {
      setShowInsufficientModal(true);
    } else {
      // Check authorization status first
      if (!user?.accountAuthorized) {
        setShowAuthorizationModal(true);
      } else {
        // Account is authorized, proceed to withdrawal modal
        // PIX key authentication will be checked when user confirms the withdrawal
        setShowWithdrawModal(true);
      }
    }
  };
  
  const handleWithdrawConfirm = (amount: number, pixType: string, pixKey: string) => {
    setWithdrawAmount(amount);
    setShowWithdrawModal(false);
    setShowWithdrawProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setShowWithdrawProcessing(false);
      // Process the withdrawal after showing processing
      setBalance(prev => prev - amount);
      // Show success notification
      toast({
        title: "Saque realizado com sucesso!",
        description: `R$ ${amount.toFixed(2)} foi transferido para sua conta.`,
        duration: 5000,
      });
    }, 2000);
  };
  
  const handleAuthorizeAccount = () => {
    setShowAuthorizationModal(false);
    // After account authorization, check if PIX key needs authentication
    if (!user?.pixKeyAuthenticated) {
      toast({
        title: "Conta autorizada!",
        description: "Agora você precisa autenticar sua chave PIX para realizar saques.",
        duration: 5000,
      });
      setTimeout(() => {
        setShowPixKeyAuthModal(true);
      }, 500);
    }
  };
  
  const handleAuthorizeLater = () => {
    setShowAuthorizationModal(false);
    // Return to the main screen without processing
  };

  const handleContinueListening = () => {
    setShowInsufficientModal(false);
    setLocation('/dashboard');
  };

  const handleExchange = async (points: number, value: number) => {
    // Sync points to database before exchange operation
    if ((window as any).syncCurrentPoints) {
      try {
        console.log('[RESGATAR] Syncing points before exchange...');
        await (window as any).syncCurrentPoints();
        console.log('[RESGATAR] Points synced successfully');
      } catch (error) {
        console.error('[RESGATAR] Failed to sync points before exchange:', error);
      }
    }
    
    // Use current points from state - they're already up-to-date
    
    // DEBUG: Log conversion attempt
    console.log('[RESGATAR] Initiating exchange:', {
      sessionPoints: sessionPoints,
      requestedPoints: points,
      requestedValue: value,
      hasEnoughPoints: sessionPoints >= points,
      timestamp: new Date().toISOString()
    });
    
    setSelectedExchange({ points, value });
    setShowConfirmationModal(true);
  };

  const confirmExchange = async () => {
    if (selectedExchange) {
      // Sync points one more time before final confirmation
      if ((window as any).syncCurrentPoints) {
        try {
          console.log('[RESGATAR] Final sync before exchange confirmation...');
          await (window as any).syncCurrentPoints();
          console.log('[RESGATAR] Final sync completed');
        } catch (error) {
          console.error('[RESGATAR] Failed to sync points before confirmation:', error);
        }
      }
      
      // Use current points from state for conversion
      
      // DEBUG: Log confirmation attempt
      console.log('[RESGATAR] Confirming exchange:', {
        sessionPoints: sessionPoints,
        selectedPoints: selectedExchange.points,
        selectedValue: selectedExchange.value,
        validation: sessionPoints >= selectedExchange.points
      });
      
      // Double check points before proceeding
      if (sessionPoints < selectedExchange.points) {
        console.log('[RESGATAR] INSUFFICIENT POINTS on confirm:', {
          available: sessionPoints,
          required: selectedExchange.points,
          shortBy: selectedExchange.points - sessionPoints
        });
        
        toast({
          title: "Pontos insuficientes",
          description: `Você tem ${sessionPoints} pontos, mas precisa de ${selectedExchange.points} pontos para esta conversão.`,
          variant: "destructive",
          duration: 5000,
        });
        setShowConfirmationModal(false);
        return;
      }
      
      // Store conversion data before opening modal
      const dataToConvert = { points: selectedExchange.points, value: selectedExchange.value };
      setConversionData(dataToConvert);
      setShowConfirmationModal(false);
      
      console.log('[RESGATAR] Opening conversion modal with data:', dataToConvert);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        setShowConversionModal(true);
      }, 100);
    }
  };
  
  const handleConversionSuccess = async () => {
    if (conversionData) {
      try {
        // DEBUG: Log before API call
        console.log('[RESGATAR] Starting conversion API call:', {
          conversionData: conversionData,
          currentSessionPoints: sessionPoints,
          currentBalance: balance,
          timestamp: new Date().toISOString()
        });
        
        // Call API to convert points
        const result = await api.convertPoints({
          points: conversionData.points
        });
        
        // DEBUG: Log API response
        console.log('[RESGATAR] Conversion API response:', {
          success: result.success,
          pointsConverted: result.pointsConverted,
          amountAdded: result.amountAdded,
          newPoints: result.newPoints,
          newBalance: result.newBalance
        });
        
        // Update local state with server response
        setSessionPoints(result.newPoints);
        setBalance(result.newBalance);
        
        // Clear conversion data
        setSelectedExchange(null);
        setConversionData(null);
        
        // Show success toast
        toast({
          title: "Conversão realizada com sucesso!",
          description: `${result.pointsConverted} pontos convertidos em R$ ${result.amountAdded.toFixed(2)}`,
          duration: 5000,
        });
      } catch (error: any) {
        console.error('Conversion failed:', error);
        
        // Check if it's an insufficient points error
        const errorMessage = error?.response?.data?.error || error?.message || "Erro desconhecido";
        
        // DEBUG: Log conversion error
        console.log('[RESGATAR] Conversion error:', {
          errorMessage: errorMessage,
          errorResponse: error?.response?.data,
          currentSessionPoints: sessionPoints,
          requestedPoints: conversionData.points,
          timestamp: new Date().toISOString()
        });
        
        if (errorMessage === "Pontos insuficientes") {
          toast({
            title: "Pontos insuficientes",
            description: `Você precisa de ${conversionData.points} pontos para fazer esta conversão. Continue ouvindo para acumular mais pontos!`,
            variant: "destructive",
            duration: 5000,
          });
          
          // Update points from server to ensure we have the latest value
          try {
            const userData = await api.getCurrentUser();
            if (userData?.user) {
              console.log('[RESGATAR] Updated points from server:', {
                oldPoints: sessionPoints,
                newPoints: userData.user.points,
                difference: userData.user.points - sessionPoints
              });
              setSessionPoints(userData.user.points);
            }
          } catch (err) {
            console.error('[RESGATAR] Failed to fetch updated points:', err);
          }
        } else {
          toast({
            title: "Erro na conversão",
            description: errorMessage || "Não foi possível converter os pontos. Tente novamente.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
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
                className="h-7 md:h-9 w-auto object-contain" 
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
              
              <div className="px-4 text-center relative">
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

          {/* Exchange Options Grid - Compacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {filteredOptions.map((option, index) => {
              const percentage = Math.min((sessionPoints / option.points) * 100, 100);
              const missingPoints = Math.max(option.points - sessionPoints, 0);
              const hasEnoughPoints = sessionPoints >= option.points;
              
              return (
                <Card 
                  key={index}
                  className={`p-4 border transition-all ${
                    hasEnoughPoints 
                      ? 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white' 
                      : 'border-gray-100 bg-gray-50/50'
                  }`}
                  data-testid={`exchange-option-${option.points}`}
                >
                  {/* Header - Points and Value */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Coins className={`w-4 h-4 ${hasEnoughPoints ? 'text-gray-600' : 'text-gray-400'}`} />
                        <span className="text-base font-semibold text-gray-900">
                          {option.points} pontos
                        </span>
                      </div>
                      {option.badge && (
                        <Badge 
                          variant="secondary" 
                          className="text-[9px] mt-1 bg-amber-100 text-amber-700 border-amber-200 px-1.5 py-0"
                        >
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Você recebe</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {option.value.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Conversion Rate */}
                  <div className="text-xs text-gray-600 mb-3">
                    Taxa de conversão: <span className="font-medium text-gray-900">{option.conversionRate}</span>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">
                        Progresso: {Math.round(percentage)}%
                      </span>
                      {!hasEnoughPoints && (
                        <span className="text-gray-600">
                          Faltam {missingPoints} pts
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          hasEnoughPoints 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    variant={hasEnoughPoints ? "default" : "ghost"}
                    className={`w-full h-9 font-medium transition-all text-sm ${
                      hasEnoughPoints 
                        ? 'bg-primary hover:bg-primary/90 text-white' 
                        : 'bg-transparent text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                    disabled={!hasEnoughPoints}
                    onClick={() => hasEnoughPoints && handleExchange(option.points, option.value)}
                    data-testid={hasEnoughPoints ? `button-exchange-${option.points}` : `button-missing-${option.points}`}
                  >
                    {hasEnoughPoints ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        Converter
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        Bloqueado
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
        <DialogContent className="w-[90%] max-w-md bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
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
                    Ouça suas rádios favoritas para acumular mais saldo. Com apenas mais {Math.ceil((minimumWithdrawal - balance) / 0.125)} pontos você atinge o mínimo!
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
        <DialogContent className="w-[90%] max-w-md p-0 rounded-2xl max-h-[90vh] overflow-y-auto">

          <div className="p-4 space-y-4">
            {/* Header with Icon */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
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
              <div className="text-xs">
                <span className="font-semibold text-amber-800">Atenção:</span>
                <span className="text-amber-700"> Esta ação não pode ser desfeita. Os pontos serão removidos da sua conta e o valor será adicionado à sua carteira.</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-5"
                onClick={confirmExchange}
                data-testid="button-confirm-exchange"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Conversão
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 py-5"
                onClick={() => setShowConfirmationModal(false)}
                data-testid="button-cancel-exchange"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conversion Processing Modal */}
      <ConversionModal
        open={showConversionModal}
        onOpenChange={setShowConversionModal}
        points={conversionData?.points || selectedExchange?.points || 0}
        value={conversionData?.value || selectedExchange?.value || 0}
        onSuccess={handleConversionSuccess}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
        balance={balance}
        onConfirm={handleWithdrawConfirm}
      />

      {/* Withdraw Processing Modal */}
      <WithdrawProcessingModal
        open={showWithdrawProcessing}
        onOpenChange={setShowWithdrawProcessing}
      />

      {/* Account Authorization Modal */}
      <AccountAuthorizationModal
        open={showAuthorizationModal}
        onOpenChange={setShowAuthorizationModal}
        amount={withdrawAmount}
        onAuthorize={handleAuthorizeAccount}
        onLater={handleAuthorizeLater}
      />

      {/* PIX Key Authentication Modal */}
      <PixKeyAuthModal
        open={showPixKeyAuthModal}
        onOpenChange={setShowPixKeyAuthModal}
      />
    </div>
  );
}