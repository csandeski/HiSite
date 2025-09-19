import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, 
  Trophy, 
  Wallet, 
  Crown,
  Settings,
  LogOut,
  ChevronRight,
  Edit,
  History,
  HelpCircle,
  Award,
  Check,
  ShieldCheck
} from "lucide-react";
import { useLocation } from "wouter";
import logoUrl from '@/assets/logo.png';

interface PerfilProps {
  userName?: string;
  sessionPoints: number;
  balance: number;
}

export default function Perfil({ userName, sessionPoints, balance }: PerfilProps) {
  const [, setLocation] = useLocation();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Get member since date (using current month/year for demo)
  const memberSince = "Setembro 2025";

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('userName');
    // Redirect to home
    setLocation('/');
  };

  const configOptions = [
    {
      icon: Edit,
      label: "Editar Perfil",
      onClick: () => console.log("Edit profile")
    },
    {
      icon: History,
      label: "Histórico de Saques",
      onClick: () => console.log("Withdrawal history")
    },
    {
      icon: HelpCircle,
      label: "Perguntas Frequentes",
      onClick: () => console.log("FAQ")
    },
    {
      icon: LogOut,
      label: "Sair da Conta",
      onClick: handleLogout,
      danger: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img src={logoUrl} alt="RádioPlay" className="h-8 object-contain" />
            </div>
            
            {/* Settings Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-lg">
        {/* Profile Info */}
        <div className="flex flex-col items-center mb-8">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4">
            {userName ? (
              <span className="text-white text-3xl font-bold">{getInitials(userName)}</span>
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          
          {/* Name and Member Since */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {userName || 'Usuário'}
          </h1>
          <p className="text-sm text-gray-500">
            Membro desde {memberSince}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Points Card */}
          <Card className="p-4 border border-gray-200">
            <div className="flex flex-col items-center">
              <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{sessionPoints}</h3>
              <p className="text-xs text-gray-500">Pontos Totais</p>
            </div>
          </Card>

          {/* Balance Card */}
          <Card className="p-4 border border-gray-200">
            <div className="flex flex-col items-center">
              <Wallet className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                R$ {balance.toFixed(2)}
              </h3>
              <p className="text-xs text-gray-500">Saldo Atual</p>
            </div>
          </Card>
        </div>

        {/* Premium Upgrade Banner */}
        <Card className="p-5 mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Crown className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-base">Upgrade Premium</h3>
                <p className="text-sm opacity-90">Ganhe 10x mais pontos</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-4 py-2 h-auto"
              data-testid="button-activate-premium"
              onClick={() => setShowPremiumModal(true)}
            >
              Ativar
            </Button>
          </div>
        </Card>

        {/* Configuration Options */}
        <Card className="p-4 border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-4">Configurações</h2>
          <div className="space-y-1">
            {configOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-between px-3 py-3 h-auto hover:bg-gray-50 ${
                  option.danger ? 'text-red-600 hover:text-red-700' : 'text-gray-700'
                }`}
                onClick={option.onClick}
                data-testid={`button-${option.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center gap-3">
                  <option.icon className="w-5 h-5" />
                  <span className="font-medium">{option.label}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </Card>

        {/* Achievement Section */}
        <Card className="p-4 mt-6 border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6 text-purple-600" />
            <h3 className="font-bold text-gray-900">Conquistas</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xl">🎧</span>
              </div>
              <span className="text-[10px] text-gray-600 text-center">Primeira Rádio</span>
            </div>
            <div className="flex flex-col items-center p-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xl">💰</span>
              </div>
              <span className="text-[10px] text-gray-600 text-center">100 Pontos</span>
            </div>
            <div className="flex flex-col items-center p-2 opacity-40">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xl">🏆</span>
              </div>
              <span className="text-[10px] text-gray-600 text-center">1000 Pontos</span>
            </div>
          </div>
        </Card>
      </main>

      {/* Premium Upgrade Modal */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Crown className="w-9 h-9 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Upgrade Premium</DialogTitle>
              <p className="text-gray-600 text-sm">Multiplique seus ganhos por 10x</p>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            {/* Price Box */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  R$ 27,00
                </div>
                <p className="text-xs text-purple-600">
                  Pagamento único • Acesso vitalício
                </p>
              </div>
            </div>
            
            {/* Benefits List */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">Ganhe 10x mais pontos por minuto</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">Acesso a rádios exclusivas premium</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">Suporte prioritário 24/7</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 font-semibold py-6 text-base"
                onClick={() => {
                  // Handle premium activation
                  console.log('Activating premium...');
                  setShowPremiumModal(false);
                }}
                data-testid="button-confirm-premium"
              >
                <Crown className="w-5 h-5 mr-2" />
                Ativar Premium - R$ 27,00
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
                onClick={() => setShowPremiumModal(false)}
                data-testid="button-continue-free"
              >
                Continuar Usando Gratuito
              </Button>
            </div>
            
            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Pagamento seguro • Garantia de 7 dias</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}