import { useState } from 'react';
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

interface PerfilProps {
  userName?: string;
  sessionPoints: number;
  balance: number;
}

export default function Perfil({ userName, sessionPoints, balance }: PerfilProps) {
  const [, setLocation] = useLocation();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
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
      <main className="flex-1 container mx-auto px-4 py-4 max-w-lg pb-24">
        {/* Compact Profile Header */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
              {userName ? (
                <span className="text-white text-xl font-bold">{getInitials(userName)}</span>
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                {userName || 'Usuário'}
              </h1>
              <p className="text-xs text-gray-600">
                Membro desde {memberSince}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="px-2 py-0.5 bg-green-100 rounded-full">
                  <span className="text-[10px] font-medium text-green-700">Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {/* Points */}
            <div className="px-2 text-center">
              <Trophy className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
              <h3 className="text-base font-bold text-gray-900">{sessionPoints}</h3>
              <p className="text-[9px] text-gray-500">Pontos</p>
            </div>
            
            {/* Balance */}
            <div className="px-2 text-center">
              <Wallet className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <h3 className="text-base font-bold text-gray-900">R$ {balance.toFixed(2)}</h3>
              <p className="text-[9px] text-gray-500">Saldo</p>
            </div>
            
            {/* Listening Time */}
            <div className="px-2 text-center">
              <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <h3 className="text-base font-bold text-gray-900">3.2h</h3>
              <p className="text-[9px] text-gray-500">Hoje</p>
            </div>
          </div>
        </div>

        {/* Compact Premium Banner */}
        <Card className="p-3.5 mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white">
              <Crown className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-sm">Premium</h3>
                <p className="text-[11px] opacity-90">10x mais pontos</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-xs px-3 py-1.5 h-auto"
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
            className="p-3 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setShowEditModal(true)}
          >
            <div className="flex flex-col items-center gap-2">
              <Edit className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-medium text-gray-700">Editar Perfil</span>
            </div>
          </Card>
          
          <Card 
            className="p-3 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setShowHistoryModal(true)}
          >
            <div className="flex flex-col items-center gap-2">
              <History className="w-5 h-5 text-green-500" />
              <span className="text-xs font-medium text-gray-700">Histórico</span>
            </div>
          </Card>
          
          <Card 
            className="p-3 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setShowFAQModal(true)}
          >
            <div className="flex flex-col items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-medium text-gray-700">Ajuda</span>
            </div>
          </Card>
          
          <Card 
            className="p-3 border border-gray-100 hover:shadow-md transition-all cursor-pointer bg-red-50"
            onClick={handleLogout}
          >
            <div className="flex flex-col items-center gap-2">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-xs font-medium text-red-600">Sair</span>
            </div>
          </Card>
        </div>

        {/* Compact Achievements & Stats */}
        <Card className="p-3 border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-sm text-gray-900">Conquistas</h3>
            </div>
            <span className="text-[10px] text-gray-500">2 de 10</span>
          </div>
          
          {/* Achievement badges */}
          <div className="flex gap-1.5 mb-2.5">
            <div className="flex-1 bg-yellow-50 rounded-md py-1.5 px-2 border border-yellow-200">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs">🎧</span>
                <span className="text-[9px] font-medium text-gray-700">Iniciante</span>
              </div>
            </div>
            <div className="flex-1 bg-green-50 rounded-md py-1.5 px-2 border border-green-200">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs">💰</span>
                <span className="text-[9px] font-medium text-gray-700">100 Pts</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-md py-1.5 px-2 border border-gray-200 opacity-40">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs">🏆</span>
                <span className="text-[9px] font-medium text-gray-400">1K Pts</span>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="bg-gray-50 rounded-md p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-medium text-gray-600">Próxima conquista</span>
              <span className="text-[9px] font-bold text-purple-600">900 pts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all" style={{width: '10%'}}></div>
            </div>
          </div>
        </Card>
        
        {/* Extra bottom padding for fixed menu */}
        <div className="h-20"></div>
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Editar Perfil
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-gray-100"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
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
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Saques
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-gray-100"
                onClick={() => setShowHistoryModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
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
        <DialogContent className="sm:max-w-md bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Perguntas Frequentes
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-gray-100"
                onClick={() => setShowFAQModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
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
                  Definitivamente! Com 10x mais pontos e rádios exclusivas, você recupera o investimento 
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
        <DialogContent className="sm:max-w-sm w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-full bg-white rounded-2xl mx-auto">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">Upgrade Premium</DialogTitle>
              <p className="text-gray-600 text-xs">Multiplique seus ganhos por 10x</p>
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
                <span className="text-xs text-gray-700">Ganhe 10x mais pontos por minuto</span>
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
                  // Handle premium activation
                  console.log('Activating premium...');
                  setShowPremiumModal(false);
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
    </div>
  );
}