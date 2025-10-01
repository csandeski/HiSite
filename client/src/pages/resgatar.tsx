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
  TrendingUp,
  Download,
  ArrowRight,
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

  // Exchange options - simplified
  const exchangeOptions = [
    {
      points: 100,
      value: 7.50,
      label: "Iniciante",
      percentage: "400"
    },
    {
      points: 250,
      value: 24.00,
      label: "Econômico",
      percentage: "433"
    },
    {
      points: 400,
      value: 60.00,
      label: "Vantajoso",
      percentage: "567"
    },
    {
      points: 600,
      value: 150.00,
      label: "Máximo",
      percentage: "733"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Main Content - Dashboard pattern */}
      <main className="flex-1 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          
          {/* Grid de 2 colunas para Saldo e Pontos */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Card Saldo */}
            <Card className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Saldo disponível</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">R$ {balance.toFixed(2)}</p>
            </Card>
            
            {/* Card Pontos */}
            <Card className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Pontos acumulados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{sessionPoints}</p>
            </Card>
          </div>

          {/* Botão de Saque - simplificado */}
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-base rounded-xl mb-6"
            onClick={handleWithdraw}
            data-testid="button-realizar-saque"
          >
            <Download className="w-5 h-5 mr-2" />
            Realizar Saque
          </Button>

          {/* Título simples */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Escolha um valor para resgatar</h2>

          {/* Cards de opções de troca - design simplificado */}
          <div className="space-y-3 mb-6">
            {exchangeOptions.map((option) => (
              <Card key={option.points} className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{option.points} pontos</p>
                      <p className="text-sm text-gray-500">{option.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">R$ {option.value.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">+{option.percentage}%</p>
                    </div>
                    <Button
                      size="sm"
                      className={sessionPoints >= option.points ? 
                        "bg-blue-600 hover:bg-blue-700 text-white" : 
                        "bg-gray-100 text-gray-400 cursor-not-allowed"}
                      disabled={sessionPoints < option.points}
                      onClick={() => handleExchange(option.points, option.value)}
                      data-testid={sessionPoints >= option.points ? `button-exchange-${option.points}` : `button-missing-${option.points}`}
                    >
                      Trocar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Seção Como Funciona - simplificada e opcional */}
          <Card className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Como funciona</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1"></div>
                <p>Ouça rádios e acumule pontos</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1"></div>
                <p>Troque pontos por dinheiro real</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1"></div>
                <p>Receba via PIX em até 24h</p>
              </div>
            </div>
          </Card>

        </div>
      </main>

      {/* Modais - mantendo todos com a mesma lógica */}
      
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
                Você está prestes a converter seus pontos em saldo
              </p>
            </div>
            
            {/* Conversion Details */}
            {selectedExchange && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 space-y-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Pontos a converter:</span>
                  <span className="text-lg font-bold text-gray-900">{selectedExchange.points} pts</span>
                </div>
                <div className="w-full h-px bg-gray-300"></div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Valor a receber:</span>
                  <span className="text-lg font-bold text-green-600">R$ {selectedExchange.value.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 py-5 border-gray-300 hover:bg-gray-50"
                onClick={() => setShowConfirmationModal(false)}
                data-testid="button-cancel-exchange"
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 py-5 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold"
                onClick={confirmExchange}
                data-testid="button-confirm-exchange"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conversion Success Modal */}
      {showConversionModal && conversionData && (
        <ConversionModal
          open={showConversionModal}
          onOpenChange={setShowConversionModal}
          points={conversionData.points}
          value={conversionData.value}
          onSuccess={handleConversionSuccess}
        />
      )}
      
      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          open={showWithdrawModal}
          onOpenChange={setShowWithdrawModal}
          balance={balance}
          onConfirm={handleWithdrawConfirm}
        />
      )}
      
      {/* Processing Modal (before auth) */}
      {showProcessingBeforeAuth && (
        <WithdrawProcessingModal
          open={showProcessingBeforeAuth}
          onOpenChange={setShowProcessingBeforeAuth}
        />
      )}
      
      {/* Withdraw Processing Modal */}
      {showWithdrawProcessing && (
        <WithdrawProcessingModal
          open={showWithdrawProcessing}
          onOpenChange={setShowWithdrawProcessing}
        />
      )}
      
      {/* Account Authorization Modal */}
      {showAuthorizationModal && (
        <AccountAuthorizationModal
          open={showAuthorizationModal}
          onOpenChange={setShowAuthorizationModal}
          amount={withdrawAmount}
          onAuthorize={handleAuthorizeAccount}
          onLater={handleAuthorizeLater}
        />
      )}
    </div>
  );
}