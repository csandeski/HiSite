import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Clock, Check, AlertCircle, ChevronLeft, Users, TrendingUp, Target, Calendar, UserCheck } from "lucide-react";
import { AUTHORIZATION_AMOUNT_CENTS, formatBRL } from "@shared/constants";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import logoUrl from '@/assets/logo.png';

export default function AccountAuthorization() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Get user data to check account status
  const { data: userData } = useQuery({ 
    queryKey: ["/api/auth/me"]
  });

  // Check if user is authenticated
  useEffect(() => {
    if (userData === null) {
      setLocation("/login");
    }
  }, [userData, setLocation]);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAuthorize = () => {
    // Get UTM parameters from localStorage
    let utmParams = '';
    try {
      const stored = localStorage.getItem('utm_params');
      if (stored) {
        const params = JSON.parse(stored);
        const urlParams = new URLSearchParams();
        
        // Add each UTM parameter if it exists
        if (params.utmSource) urlParams.append('utm_source', params.utmSource);
        if (params.utmMedium) urlParams.append('utm_medium', params.utmMedium);
        if (params.utmCampaign) urlParams.append('utm_campaign', params.utmCampaign);
        if (params.utmTerm) urlParams.append('utm_term', params.utmTerm);
        if (params.utmContent) urlParams.append('utm_content', params.utmContent);
        
        // Convert to string if we have parameters
        const paramString = urlParams.toString();
        if (paramString) {
          utmParams = '?' + paramString;
        }
      }
    } catch (error) {
      console.error('Error reading UTM params:', error);
    }
    
    // Redirect to payment link with UTM parameters
    window.location.href = 'https://pay.lirapaybr.com/GEzPWRoy' + utmParams;
  };

  const handleBack = () => {
    setLocation("/resgatar");
  };

  const today = new Date().toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Calculate deadline date (2 days from now)
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 2);
  const deadline = deadlineDate.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long'
  });

  // Calculate user balance
  const balance = user ? (user.points * 0.125) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - exactly like dashboard */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side: Back button and Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Voltar"
                data-testid="button-back-navigation"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <img 
                src={logoUrl} 
                alt="RádioPlay" 
                className="h-7 md:h-9 w-auto object-contain" 
                data-testid="authorization-logo"
              />
            </div>

            {/* Right side: Balance display */}
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-sm md:text-base"
                data-testid="balance-display"
              >
                R$ {balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="container mx-auto px-4 py-4 md:py-6 max-w-2xl">
          
          {/* Page Title Card */}
          <Card className="p-4 md:p-5 mb-4 bg-white border-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Autorização de Conta</h1>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5">Ative sua conta com segurança</p>
              </div>
            </div>
          </Card>

          {/* Account Status Card */}
          <Card className="p-4 md:p-5 mb-4 bg-white border-0 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Status da Conta</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-sm text-gray-600">Status atual:</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">Aguardando Autorização</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-sm text-gray-600">Taxa de autorização:</span>
                <span className="text-sm font-bold text-gray-900">{formatBRL(AUTHORIZATION_AMOUNT_CENTS)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-600">Validade:</span>
                <span className="text-sm font-medium text-green-600">Vitalício</span>
              </div>
            </div>
          </Card>

          {/* Important Notice Card */}
          <Card className="p-4 md:p-5 mb-4 bg-amber-50 border border-amber-200 shadow-sm">
            <div className="flex gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">Prazo Importante</p>
                <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
                  Autorize até <strong className="text-amber-900">{today}</strong> para manter seu acesso completo.
                </p>
              </div>
            </div>
          </Card>

          {/* Limited Slots Alert */}
          <Card className="p-4 mb-4 bg-red-50 border border-red-200 shadow-sm">
            <div className="flex gap-2.5">
              <Calendar className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-base font-bold text-red-900 mb-1">⚠️ VAGAS LIMITADAS</p>
                <p className="text-sm text-red-800">
                  As vagas encerram dia <strong className="text-red-900 uppercase">{deadline}</strong>
                </p>
                <p className="text-sm text-red-700 mt-1">Após esta data, novas vagas só abrirão em 2026.</p>
              </div>
            </div>
          </Card>

          {/* Who This App IS For */}
          <Card className="p-4 md:p-5 mb-4 bg-gradient-to-br from-green-50 to-white border border-green-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Nosso App É Para:
            </h3>
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <UserCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Renda Mensal Confiável</p>
                  <p className="text-xs text-gray-600">App ativo há anos com vagas limitadas</p>
                </div>
              </div>
              <div className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Crescimento e Hierarquia</p>
                  <p className="text-xs text-gray-600">Ganhe cargos e aumente seus ganhos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Apoiar Rádios Parceiras</p>
                  <p className="text-xs text-gray-600">Ajude na visibilidade e seja pago</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Users Badge */}
          <Card className="p-3 mb-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div className="text-center">
                <p className="text-base font-bold text-primary">+8.000 Usuários Ativos</p>
                <p className="text-xs text-gray-600">Fruto de anos de trabalho árduo</p>
              </div>
            </div>
          </Card>

          {/* Benefits Card */}
          <Card className="p-4 md:p-5 mb-4 bg-white border-0 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Benefícios da Autorização</h3>
            <div className="space-y-3">
              <div className="flex gap-2.5">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">30 Dias de Garantia</p>
                  <p className="text-xs text-gray-600 mt-0.5">Reembolso completo garantido</p>
                </div>
              </div>
              
              <div className="flex gap-2.5">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Ativação Instantânea</p>
                  <p className="text-xs text-gray-600 mt-0.5">Conta ativada na hora</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Saques Liberados</p>
                  <p className="text-xs text-gray-600 mt-0.5">Sem restrições em 5 minutos</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Suporte Prioritário</p>
                  <p className="text-xs text-gray-600 mt-0.5">Atendimento 24/7</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Platform Info Card */}
          <Card className="p-4 md:p-5 mb-4 bg-gradient-to-br from-gray-50 to-white border-0 shadow-sm">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full mb-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Plataforma Oficial</p>
              </div>
              <p className="text-base md:text-lg font-bold text-gray-900">RadioPlay Brasil</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">App verificado • Dados protegidos</p>
            </div>
          </Card>

          {/* Action Button */}
          <div className="mt-6 mb-6">
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-6 md:py-7 text-lg md:text-xl rounded-xl shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
              onClick={handleAuthorize}
              data-testid="button-authorize-account"
            >
              Ativar Minha Conta!
            </Button>
            <p className="text-xs md:text-sm text-center text-gray-500 mt-3">
              Pagamento seguro • Garantia de 30 dias
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}