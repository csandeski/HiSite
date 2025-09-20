import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ShieldCheck,
  Clock,
  TrendingUp,
  X,
  Lock,
  FileText
} from "lucide-react";
import { useLocation } from "wouter";
import logoUrl from '@/assets/logo.png';
import PixPaymentModal from '@/components/PixPaymentModal';

interface PerfilProps {
  userName?: string;
  sessionPoints: number;
  balance: number;
}

export default function Perfil({ userName, sessionPoints, balance }: PerfilProps) {
  const [, setLocation] = useLocation();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [highlightPremium, setHighlightPremium] = useState(false);
  
  // Check for highlight parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('highlight') === 'premium') {
      setHighlightPremium(true);
      // Scroll to the premium card after a short delay
      setTimeout(() => {
        const premiumCard = document.getElementById('premium-upgrade-card');
        if (premiumCard) {
          premiumCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      // Remove highlight after animation
      setTimeout(() => {
        setHighlightPremium(false);
        // Clean URL without reloading
        window.history.replaceState({}, document.title, '/perfil');
      }, 3000);
    }
  }, []);
  
  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Get member since date
  const memberSince = "Set 2025";

  const handleLogout = () => {
    localStorage.removeItem('userName');
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img src={logoUrl} alt="RádioPlay" className="h-7 object-contain" />
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
      <main className="flex-1 container mx-auto px-4 py-4 max-w-lg pb-24">
        {/* Compact Profile Header */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              {userName ? (
                <span className="text-white text-xl font-bold">{getInitials(userName)}</span>
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {userName || 'Usuário'}
              </h1>
              <p className="text-sm text-gray-600">
                Membro desde {memberSince}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="px-2.5 py-1 bg-green-100 rounded-full">
                  <span className="text-xs font-medium text-green-700">Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {/* Points */}
            <div className="px-3 text-center">
              <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1.5" />
              <h3 className="text-lg font-bold text-gray-900">{sessionPoints}</h3>
              <p className="text-xs text-gray-500">Pontos</p>
            </div>
            
            {/* Balance */}
            <div className="px-3 text-center">
              <Wallet className="w-5 h-5 text-green-500 mx-auto mb-1.5" />
              <h3 className="text-lg font-bold text-gray-900">R$ {balance.toFixed(2)}</h3>
              <p className="text-xs text-gray-500">Saldo</p>
            </div>
            
            {/* Listening Time */}
            <div className="px-3 text-center">
              <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
              <h3 className="text-lg font-bold text-gray-900">3.2h</h3>
              <p className="text-xs text-gray-500">Hoje</p>
            </div>
          </div>
        </div>

        {/* Premium Banner - Destacado */}
        <Card 
          id="premium-upgrade-card"
          className={`p-4 mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 border-0 shadow-xl transition-all duration-500 ${
            highlightPremium ? 'ring-4 ring-purple-400 ring-offset-4 scale-105 animate-pulse' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Crown className="w-7 h-7" />
              <div>
                <h3 className="font-bold text-base">Upgrade Premium</h3>
                <p className="text-xs opacity-90">3x mais pontos</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-sm px-4 py-2 h-auto shadow-md"
              data-testid="button-activate-premium"
              onClick={() => setShowPremiumModal(true)}
            >
              Ativar
            </Button>
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card 
            className="p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setShowEditModal(true)}
          >
            <div className="flex flex-col items-center gap-2">
              <Edit className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Editar Perfil</span>
            </div>
          </Card>
          
          <Card 
            className="p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setShowHistoryModal(true)}
          >
            <div className="flex flex-col items-center gap-2">
              <History className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Histórico</span>
            </div>
          </Card>
          
          <Card 
            className="p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setShowFAQModal(true)}
          >
            <div className="flex flex-col items-center gap-2">
              <HelpCircle className="w-6 h-6 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Ajuda</span>
            </div>
          </Card>
          
          <Card 
            className="p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer bg-red-50"
            onClick={handleLogout}
          >
            <div className="flex flex-col items-center gap-2">
              <LogOut className="w-6 h-6 text-red-500" />
              <span className="text-sm font-medium text-red-600">Sair</span>
            </div>
          </Card>
        </div>

        {/* Compact Achievements & Stats */}
        <Card className="p-3 border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-base text-gray-900">Conquistas</h3>
            </div>
            <span className="text-xs text-gray-500">{sessionPoints >= 1000 ? 3 : sessionPoints >= 100 ? 2 : 1} de 10</span>
          </div>
          
          {/* All Achievement badges */}
          <div className="space-y-2 mb-3">
            {/* First row - 3 badges */}
            <div className="flex gap-2">
              <div className="flex-1 bg-yellow-50 rounded-lg py-2 px-2.5 border border-yellow-200">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">🎧</span>
                  <span className="text-xs font-medium text-gray-700">Iniciante</span>
                </div>
              </div>
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 100 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">💰</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 100 ? 'text-gray-700' : 'text-gray-400'}`}>100 Pts</span>
                </div>
              </div>
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 500 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">⭐</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 500 ? 'text-gray-700' : 'text-gray-400'}`}>500 Pts</span>
                </div>
              </div>
            </div>
            
            {/* Second row - 3 badges */}
            <div className="flex gap-2">
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 1000 ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">🏆</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 1000 ? 'text-gray-700' : 'text-gray-400'}`}>1K Pts</span>
                </div>
              </div>
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 2500 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">🔥</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 2500 ? 'text-gray-700' : 'text-gray-400'}`}>2.5K</span>
                </div>
              </div>
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 5000 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">🚀</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 5000 ? 'text-gray-700' : 'text-gray-400'}`}>5K</span>
                </div>
              </div>
            </div>
            
            {/* Third row - 4 badges */}
            <div className="flex gap-2">
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 10000 ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">💎</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 10000 ? 'text-gray-700' : 'text-gray-400'}`}>10K</span>
                </div>
              </div>
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 25000 ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">🌟</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 25000 ? 'text-gray-700' : 'text-gray-400'}`}>25K</span>
                </div>
              </div>
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 50000 ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">👑</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 50000 ? 'text-gray-700' : 'text-gray-400'}`}>50K</span>
                </div>
              </div>
              <div className={`flex-1 rounded-lg py-2 px-2.5 border ${sessionPoints >= 100000 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">🏅</span>
                  <span className={`text-xs font-medium ${sessionPoints >= 100000 ? 'text-gray-700' : 'text-gray-400'}`}>100K</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">Próxima conquista</span>
              <span className="text-xs font-bold text-purple-600">
                {sessionPoints < 100 ? '100' : 
                 sessionPoints < 500 ? '500' : 
                 sessionPoints < 1000 ? '1000' :
                 sessionPoints < 2500 ? '2500' :
                 sessionPoints < 5000 ? '5000' :
                 sessionPoints < 10000 ? '10K' :
                 sessionPoints < 25000 ? '25K' :
                 sessionPoints < 50000 ? '50K' :
                 sessionPoints < 100000 ? '100K' : 'Máximo'} pts
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all" 
                style={{
                  width: `${
                    sessionPoints < 100 ? (sessionPoints / 100) * 100 :
                    sessionPoints < 500 ? ((sessionPoints - 100) / 400) * 100 :
                    sessionPoints < 1000 ? ((sessionPoints - 500) / 500) * 100 :
                    sessionPoints < 2500 ? ((sessionPoints - 1000) / 1500) * 100 :
                    sessionPoints < 5000 ? ((sessionPoints - 2500) / 2500) * 100 :
                    sessionPoints < 10000 ? ((sessionPoints - 5000) / 5000) * 100 :
                    sessionPoints < 25000 ? ((sessionPoints - 10000) / 15000) * 100 :
                    sessionPoints < 50000 ? ((sessionPoints - 25000) / 25000) * 100 :
                    sessionPoints < 100000 ? ((sessionPoints - 50000) / 50000) * 100 :
                    100
                  }%`
                }}
              ></div>
            </div>
          </div>
        </Card>
        
        {/* Extra bottom padding for fixed menu */}
        <div className="h-20"></div>
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[90%] max-w-md bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Editar Perfil
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                {userName ? (
                  <span className="text-white text-2xl font-bold">{getInitials(userName)}</span>
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs font-medium text-gray-700">Nome Completo</Label>
                <Input 
                  id="name"
                  defaultValue={userName || ''}
                  className="mt-1"
                  placeholder="Digite seu nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  defaultValue="seu@email.com"
                  className="mt-1"
                  placeholder="Digite seu email"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-xs font-medium text-gray-700">Telefone</Label>
                <Input 
                  id="phone"
                  type="tel"
                  defaultValue="(11) 99999-9999"
                  className="mt-1"
                  placeholder="Digite seu telefone"
                />
              </div>
              
              {/* Password Section */}
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
                
                {showPasswordFields && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label htmlFor="current-password" className="text-xs font-medium text-gray-700">Senha Atual</Label>
                      <Input 
                        id="current-password"
                        type="password"
                        className="mt-1"
                        placeholder="Digite sua senha atual"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-password" className="text-xs font-medium text-gray-700">Nova Senha</Label>
                      <Input 
                        id="new-password"
                        type="password"
                        className="mt-1"
                        placeholder="Digite a nova senha"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password" className="text-xs font-medium text-gray-700">Confirmar Nova Senha</Label>
                      <Input 
                        id="confirm-password"
                        type="password"
                        className="mt-1"
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                onClick={() => {
                  // Handle save
                  setShowEditModal(false);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="w-[90%] max-w-md bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de Saques
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Total Withdrawn */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Total Sacado</p>
              <h3 className="text-2xl font-bold text-gray-900">R$ 0.00</h3>
            </div>
            
            {/* Empty State */}
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Nenhum saque realizado ainda</p>
              <p className="text-xs text-gray-500 text-center">
                Seus saques aparecerão aqui após as conversões
              </p>
            </div>
            
            {/* Close Button */}
            <Button
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              onClick={() => setShowHistoryModal(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Modal */}
      <Dialog open={showFAQModal} onOpenChange={setShowFAQModal}>
        <DialogContent className="w-[90%] max-w-md bg-white rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Perguntas Frequentes
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* FAQ Items */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  É realmente possível ganhar dinheiro ouvindo rádio?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Sim! Nossos usuários já sacaram mais de R$ 50.000 desde o lançamento em julho de 2025. 
                  Você ganha pontos por cada minuto ouvindo e pode converter em dinheiro real.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  Quanto posso ganhar por dia?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Usuários gratuitos podem ganhar até R$ 200/dia. Com o Premium, você pode ganhar até R$ 
                  1.200/dia ouvindo suas rádios favoritas.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  Como funciona o saque?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Você acumula pontos ouvindo rádio, converte em reais na aba Resgatar e recebe via PIX em poucos 
                  minutos. Saque mínimo de R$ 150.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  É seguro fornecer meus dados?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Totalmente seguro! Somos certificados e já pagamos milhares de usuários. Seus dados são 
                  protegidos com criptografia bancária.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  Preciso ficar com o app aberto?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Não! O app funciona em segundo plano. Você pode usar outros apps enquanto ganha pontos 
                  ouvindo rádio.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  Vale a pena o Premium?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Definitivamente! Com 3x mais pontos e rádios exclusivas, você recupera o investimento 
                  rapidamente.
                </p>
              </div>
            </div>
            
            {/* Close Button */}
            <Button
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              onClick={() => setShowFAQModal(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Upgrade Modal */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent className="w-[90%] max-w-sm bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">Upgrade Premium</DialogTitle>
              <p className="text-gray-600 text-xs">Multiplique seus ganhos por 3x</p>
            </div>
          </DialogHeader>
          
          <div className="space-y-3 pt-1">
            {/* Price Box */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  R$ 27,00
                </div>
                <p className="text-[10px] text-purple-600">
                  Pagamento único • Acesso vitalício
                </p>
              </div>
            </div>
            
            {/* Benefits List */}
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs text-gray-700">Ganhe 3x mais pontos por minuto</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs text-gray-700">Acesso a rádios exclusivas premium</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs text-gray-700">Suporte prioritário 24/7</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 font-semibold py-5 text-sm"
                onClick={() => {
                  // Open Pix payment modal
                  setShowPremiumModal(false);
                  setShowPixModal(true);
                }}
                data-testid="button-confirm-premium"
              >
                <Crown className="w-4 h-4 mr-2" />
                Ativar Premium - R$ 27,00
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800 text-sm py-4"
                onClick={() => setShowPremiumModal(false)}
                data-testid="button-continue-free"
              >
                Continuar Usando Gratuito
              </Button>
            </div>
            
            {/* Security Note */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] text-gray-500">Pagamento seguro • Garantia de 7 dias</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pix Payment Modal */}
      <PixPaymentModal 
        open={showPixModal} 
        onOpenChange={setShowPixModal}
      />
    </div>
  );
}