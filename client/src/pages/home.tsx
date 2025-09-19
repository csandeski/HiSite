import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, TrendingUp, LogIn, UserPlus, Headphones, Radio, DollarSign } from "lucide-react";

export default function Home() {
  const handleButtonClick = (action: string) => {
    console.log(`Button clicked: ${action}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground" data-testid="logo-text">
                RádioPlay
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2 h-auto"
                data-testid="button-login"
                onClick={() => handleButtonClick('login')}
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </Button>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 px-4 py-2 h-auto"
                data-testid="button-register"
                onClick={() => handleButtonClick('register')}
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          {/* Success Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 text-green-700 rounded-full px-4 py-2 inline-flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span data-testid="text-user-count" className="whitespace-nowrap">
                Mais de 50.000 usuários já estão ganhando
              </span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2" data-testid="main-title">
              Ganhe Dinheiro
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-primary" data-testid="subtitle">
              Ouvindo Rádio
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-md mx-auto" data-testid="text-description">
              Transforme seu tempo livre em renda extra. Ouça suas rádios favoritas e 
              acumule pontos que viram dinheiro real.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            <Button 
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base"
              data-testid="button-start-earning"
              onClick={() => handleButtonClick('start-earning')}
            >
              Começar a Ganhar Agora
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="w-full border-gray-300 text-foreground hover:bg-gray-50 font-normal py-6 text-base"
              data-testid="button-already-account"
              onClick={() => handleButtonClick('already-account')}
            >
              Já tenho conta
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-gray-200 rounded-lg p-3 text-center bg-white" data-testid="card-stats-earnings">
              <h3 className="text-lg md:text-xl font-bold text-foreground">R$3.500</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Média mensal</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center bg-white" data-testid="card-stats-time">
              <h3 className="text-lg md:text-xl font-bold text-foreground">2.5h</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Por dia</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center bg-white" data-testid="card-stats-users">
              <h3 className="text-lg md:text-xl font-bold text-foreground">50k+</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Usuários</p>
            </div>
          </div>
        </div>
      </main>

      {/* Como Funciona Section */}
      <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="section-title-how">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comece a ganhar dinheiro hoje mesmo em apenas 3 passos simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group" data-testid="step-1">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  1
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="w-10 h-10 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-900">Escolha sua Rádio</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Navegue por nossa vasta biblioteca com mais de 500 rádios. Esportes, notícias, música, podcasts e muito mais ao seu alcance.
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-blue-100 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-green-100 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-yellow-100 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">
                      +
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group" data-testid="step-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  2
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Radio className="w-10 h-10 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-900">Ouça e Acumule</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Deixe tocando enquanto trabalha, estuda ou relaxa. A cada minuto, você acumula pontos automaticamente sem esforço.
                </p>
                <div className="mt-4 flex justify-center items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Acumulando agora</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group" data-testid="step-3">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  3
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-10 h-10 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-900">Converta em Dinheiro</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Transforme seus pontos em dinheiro real via PIX. Saques rápidos a partir de R$ 10,00 direto na sua conta.
                </p>
                <div className="mt-4 flex justify-center">
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                    PIX instantâneo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection lines for desktop */}
          <div className="hidden md:block relative -mt-32 mb-8">
            <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      </section>
    </div>
  );
}