import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Radio, 
  DollarSign, 
  Clock, 
  Users, 
  Headphones,
  TrendingUp,
  Star,
  Zap,
  ChevronRight,
  PlayCircle
} from "lucide-react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  
  const handleButtonClick = (action: string) => {
    // Show a toast or alert for now since auth pages don't exist yet
    console.log(`Button clicked: ${action}`);
    // In a real app, this would navigate to login/signup pages
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-cta rounded-full flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground" data-testid="logo-text">
                RadioEarn
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-login"
                onClick={() => handleButtonClick('login')}
              >
                Entrar
              </Button>
              <Button 
                className="bg-gradient-cta text-white hover:opacity-90 transition-opacity"
                data-testid="button-register"
                onClick={() => handleButtonClick('register')}
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero text-white pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Success Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center gap-2 animate-fade-in">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium" data-testid="text-user-count">
                Mais de 50.000 usuários já estão ganhando
              </span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="main-title">
              Ganhe Dinheiro
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-100" data-testid="subtitle">
              Ouvindo Rádio
            </h2>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto" data-testid="text-description">
              Transforme seu tempo livre em renda extra. Ouça suas rádios favoritas e 
              acumule pontos que viram dinheiro real.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-6 text-lg flex items-center gap-2"
              data-testid="button-start-earning"
              onClick={() => handleButtonClick('start-earning')}
            >
              <PlayCircle className="w-5 h-5" />
              Começar a Ganhar Agora
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg"
              data-testid="button-already-account"
              onClick={() => handleButtonClick('already-account')}
            >
              Já tenho conta
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
            <Card className="stat-card" data-testid="card-stats-earnings">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">R$3.500</h3>
              <p className="text-sm text-muted-foreground mt-1">Média mensal</p>
            </Card>
            <Card className="stat-card" data-testid="card-stats-time">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">2.5h</h3>
              <p className="text-sm text-muted-foreground mt-1">Por dia</p>
            </Card>
            <Card className="stat-card" data-testid="card-stats-users">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">50k+</h3>
              <p className="text-sm text-muted-foreground mt-1">Usuários</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 scroll-animate" data-testid="section-title-how">
            Como Funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center scroll-animate" data-testid="step-1">
              <div className="icon-circle mx-auto mb-6">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Escolha sua Rádio</h3>
              <p className="text-muted-foreground">
                Selecione entre centenas de rádios disponíveis: esportes, notícias, música e muito mais.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center scroll-animate" data-testid="step-2">
              <div className="icon-circle mx-auto mb-6">
                <Radio className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Ouça e Acumule</h3>
              <p className="text-muted-foreground">
                A cada minuto ouvindo, você ganha pontos automaticamente. Quanto mais ouve, mais ganha!
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center scroll-animate" data-testid="step-3">
              <div className="icon-circle mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Converta em Dinheiro</h3>
              <p className="text-muted-foreground">
                Troque seus pontos por dinheiro real via PIX. Saques a partir de R$ 10,00.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 scroll-animate" data-testid="section-title-why">
            Por que escolher o RadioEarn?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Benefit 1 */}
            <div className="flex gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors scroll-animate" data-testid="benefit-automatic">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Ganhos Automáticos</h3>
                <p className="text-muted-foreground">
                  Seus pontos são creditados automaticamente enquanto você ouve suas rádios favoritas.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors scroll-animate" data-testid="benefit-community">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Comunidade Ativa</h3>
                <p className="text-muted-foreground">
                  Mais de 50.000 usuários já fazem parte da nossa comunidade de ouvintes.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors scroll-animate" data-testid="benefit-achievements">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Sistema de Conquistas</h3>
                <p className="text-muted-foreground">
                  Desbloqueie conquistas e ganhe bônus extras conforme você progride.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors scroll-animate" data-testid="benefit-withdrawals">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Saques Rápidos</h3>
                <p className="text-muted-foreground">
                  Receba seus ganhos via PIX em até 24 horas após solicitar o saque.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="cta-title">
            Pronto para começar a ganhar?
          </h2>
          <p className="text-xl mb-8 text-white/90" data-testid="cta-description">
            Junte-se a milhares de pessoas que já transformaram seu tempo livre em renda extra.
          </p>
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
            data-testid="button-create-account"
            onClick={() => handleButtonClick('create-account')}
          >
            Criar Conta Grátis
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span data-testid="badge-free">100% Gratuito</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span data-testid="badge-secure">Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span data-testid="badge-support">Suporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-cta rounded-full flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">RadioEarn</span>
            </div>
            <p className="text-sm text-gray-400" data-testid="footer-copyright">
              © 2024 RadioEarn. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}