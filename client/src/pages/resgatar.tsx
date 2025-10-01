import { useState } from 'react';
import ConversionModal from '@/components/ConversionModal';
import WithdrawModal from '@/components/WithdrawModal';
import WithdrawProcessingModal from '@/components/WithdrawProcessingModal';
import AccountAuthorizationModal from '@/components/AccountAuthorizationModal';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  Coins, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Link2,
  Calendar,
  Star,
  DollarSign,
  Check,
  Download,
  Info,
  Sparkles
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import Header from '@/components/Header';
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<{points: number, value: number} | null>(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [conversionData, setConversionData] = useState<{points: number, value: number} | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWithdrawProcessing, setShowWithdrawProcessing] = useState(false);
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [showProcessingBeforeAuth, setShowProcessingBeforeAuth] = useState(false);
  const [, setLocation] = useLocation();
  const minimumWithdrawal = 150;

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
      setShowWithdrawModal(true);
    }
  };
  
  const handleWithdrawConfirm = (amount: number, pixType: string, pixKey: string) => {
    setWithdrawAmount(amount);
    
    if (!user?.accountAuthorized) {
      setShowWithdrawModal(false);
      setShowProcessingBeforeAuth(true);
      
      setTimeout(() => {
        setShowProcessingBeforeAuth(false);
        setShowAuthorizationModal(true);
      }, 4000);
      return;
    }
    
    setShowWithdrawModal(false);
    setShowWithdrawProcessing(true);
    
    setTimeout(() => {
      setShowWithdrawProcessing(false);
      setBalance(prev => prev - amount);
      toast({
        title: "Saque realizado com sucesso!",
        description: `R$ ${amount.toFixed(2)} foi transferido para sua conta.`,
        duration: 5000,
      });
    }, 2000);
  };
  
  const handleAuthorizeAccount = () => {
    setShowAuthorizationModal(false);
    toast({
      title: "Conta autorizada com sucesso!",
      description: "Agora você pode realizar seu saque.",
      duration: 5000,
    });
    setTimeout(() => {
      setShowWithdrawModal(true);
    }, 500);
  };
  
  const handleAuthorizeLater = () => {
    setShowAuthorizationModal(false);
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
      
      const dataToConvert = { points: selectedExchange.points, value: selectedExchange.value };
      setConversionData(dataToConvert);
      setShowConfirmationModal(false);
      
      console.log('[RESGATAR] Opening conversion modal with data:', dataToConvert);
      
      setTimeout(() => {
        setShowConversionModal(true);
      }, 100);
    }
  };
  
  const handleConversionSuccess = async () => {
    if (conversionData) {
      try {
        console.log('[RESGATAR] Starting conversion API call:', {
          conversionData: conversionData,
          currentSessionPoints: sessionPoints,
          currentBalance: balance,
          timestamp: new Date().toISOString()
        });
        
        const result = await api.convertPoints({
          points: conversionData.points
        });
        
        console.log('[RESGATAR] Conversion API response:', {
          success: result.success,
          pointsConverted: result.pointsConverted,
          amountAdded: result.amountAdded,
          newPoints: result.newPoints,
          newBalance: result.newBalance
        });
        
        setBalance(result.newBalance);
        
        setSelectedExchange(null);
        setConversionData(null);
        
        toast({
          title: "Conversão realizada com sucesso!",
          description: `${result.pointsConverted} pontos convertidos em R$ ${result.amountAdded.toFixed(2)}`,
          duration: 5000,
        });
      } catch (error: any) {
        console.error('Conversion failed:', error);
        
        const errorMessage = error?.response?.data?.error || error?.message || "Erro desconhecido";
        
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
          
          try {
            const userData = await api.getCurrentUser();
            if (userData?.user) {
              console.log('[RESGATAR] Updated points from server:', {
                oldPoints: sessionPoints,
                newPoints: userData.user.points,
                difference: userData.user.points - sessionPoints
              });
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

  // Exchange options with new design
  const exchangeOptions = [
    {
      points: 100,
      value: 7.50,
      label: "Iniciante",
      icon: Link2,
      color: "#3B82F6", // Blue
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      iconBgColor: "bg-blue-100",
      percentage: "+400%",
      badge: null,
    },
    {
      points: 250,
      value: 24.00,
      label: "Econômico",
      icon: Calendar,
      color: "#10B981", // Green
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      buttonColor: "bg-green-500 hover:bg-green-600",
      iconBgColor: "bg-green-100",
      percentage: "+433%",
      badge: null,
    },
    {
      points: 400,
      value: 60.00,
      label: "Vantajoso",
      icon: Star,
      color: "#8B5CF6", // Purple
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      iconBgColor: "bg-purple-100",
      percentage: "+567%",
      badge: "Popular",
    },
    {
      points: 600,
      value: 150.00,
      label: "Máximo",
      icon: DollarSign,
      color: "#F97316", // Orange
      bgColor: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      iconBgColor: "bg-orange-100",
      percentage: "+733%",
      badge: null,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-8">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          
          {/* Hero Section - Two Cards Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Balance Card */}
            <Card className="bg-white p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Saldo disponível</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">R$ {balance.toFixed(2)}</p>
            </Card>
            
            {/* Points Card */}
            <Card className="bg-white p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Pontos acumulados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{sessionPoints}</p>
            </Card>
          </div>

          {/* Large Withdrawal Button */}
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold mb-8 shadow-lg hover:shadow-xl transition-all"
            onClick={handleWithdraw}
            data-testid="button-realizar-saque"
          >
            <Download className="w-5 h-5 mr-2" />
            Realizar Saque
          </Button>

          {/* Title with Icon */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              Escolha um valor para resgatar
            </h2>
          </div>

          {/* Exchange Options Cards - Professional Design */}
          <div className="space-y-4 mb-8">
            {exchangeOptions.map((option, index) => {
              const hasEnoughPoints = sessionPoints >= option.points;
              const Icon = option.icon;
              
              return (
                <Card 
                  key={index}
                  className={`relative bg-white border-2 transition-all p-5 ${
                    hasEnoughPoints 
                      ? `hover:border-primary hover:shadow-lg ${option.badge === 'Popular' ? 'border-primary' : 'border-gray-200'}` 
                      : 'border-gray-100 opacity-60'
                  }`}
                  data-testid={`exchange-option-${option.points}`}
                >
                  {/* Popular Badge */}
                  {option.badge === 'Popular' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white border-0 px-4 py-1 text-xs font-bold shadow-sm">
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon in colored circle */}
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${option.iconBgColor}`}
                      >
                        <Icon 
                          className="w-6 h-6" 
                          style={{ color: hasEnoughPoints ? option.color : '#9ca3af' }}
                        />
                      </div>
                      
                      {/* Points and Label Info */}
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {option.points} pontos
                        </p>
                        <p className="text-sm text-gray-600">{option.label}</p>
                      </div>
                    </div>
                    
                    {/* Value and Button */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          R$ {option.value.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{option.percentage}</p>
                      </div>
                      <Button
                        className={`px-5 py-2 font-semibold text-white min-w-[90px] ${
                          hasEnoughPoints 
                            ? `${option.buttonColor}`
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!hasEnoughPoints}
                        onClick={() => hasEnoughPoints && handleExchange(option.points, option.value)}
                        data-testid={hasEnoughPoints ? `button-exchange-${option.points}` : `button-missing-${option.points}`}
                      >
                        Trocar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Como Funciona Section - Moved to Bottom */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Como funciona</h2>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                <p>Ouça suas rádios favoritas e acumule pontos automaticamente</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                <p>Troque seus pontos por dinheiro real com as melhores taxas</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                <p>Receba o pagamento via PIX em até 24 horas úteis</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                <p>Quanto mais pontos você troca, melhor a taxa de conversão</p>
              </div>
            </div>
          </div>

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

      {/* Processing Before Authorization Modal */}
      {showProcessingBeforeAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-[90%] flex flex-col items-center space-y-6">
            {/* Loading spinner */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            
            {/* Loading text */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Processando seu Saque!</h3>
              <p className="text-sm text-gray-600">Aguarde enquanto verificamos suas informações...</p>
            </div>
            
            {/* Progress dots */}
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Account Authorization Modal */}
      <AccountAuthorizationModal
        open={showAuthorizationModal}
        onOpenChange={setShowAuthorizationModal}
        amount={withdrawAmount}
        onAuthorize={handleAuthorizeAccount}
        onLater={handleAuthorizeLater}
      />
    </div>
  );
}