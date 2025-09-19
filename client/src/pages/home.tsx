import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, TrendingUp, LogIn, UserPlus, Headphones, Radio, DollarSign, Clock, Users, Star, Banknote } from "lucide-react";

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
            <div className="relative animate-float">
              <div className="bg-green-100 text-green-700 rounded-full px-4 py-2 inline-flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap transition-all hover:scale-105 cursor-pointer">
                <TrendingUp className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span data-testid="text-user-count" className="whitespace-nowrap font-medium">
                  Mais de 50.000 usuários já estão ganhando
                </span>
              </div>
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
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  1
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="w-10 h-10 text-primary" />
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
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  2
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Radio className="w-10 h-10 text-primary" />
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
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  3
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-10 h-10 text-primary" />
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

      {/* Por que escolher Section */}
      <section className="w-full py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="section-title-why">
              Por que escolher o RádioPlay?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Descubra os benefícios que fazem do RádioPlay a melhor escolha para ganhar dinheiro ouvindo rádio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Ganhos Automáticos */}
            <div className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200" data-testid="benefit-automatic">
              <div className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-gray-900">Ganhos Automáticos</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Seus pontos são creditados automaticamente enquanto você ouve suas rádios favoritas. Sem complicações!
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Funcionando 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comunidade Ativa */}
            <div className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200" data-testid="benefit-community">
              <div className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-gray-900">Comunidade Ativa</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Mais de 50.000 usuários já fazem parte da nossa comunidade de ouvintes ativos e engajados.
                  </p>
                  <div className="mt-4 flex -space-x-2">
                    <div className="w-7 h-7 bg-blue-200 rounded-full border-2 border-white"></div>
                    <div className="w-7 h-7 bg-indigo-200 rounded-full border-2 border-white"></div>
                    <div className="w-7 h-7 bg-purple-200 rounded-full border-2 border-white"></div>
                    <div className="w-7 h-7 bg-pink-200 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-700">+50k</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sistema de Conquistas */}
            <div className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200" data-testid="benefit-achievements">
              <div className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-7 h-7 md:w-8 md:h-8 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-gray-900">Sistema de Conquistas</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Desbloqueie conquistas e ganhe bônus extras conforme você progride em sua jornada.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-gray-300" />
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Saques Rápidos */}
            <div className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200" data-testid="benefit-withdrawals">
              <div className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Banknote className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-gray-900">Saques Rápidos</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Receba seus ganhos via PIX em até 24 horas após solicitar o saque. Simples e rápido!
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">PIX</span>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">24h</span>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">R$ 10+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Junte-se a milhares de pessoas que já estão ganhando!</p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 text-white hover:opacity-90 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              onClick={() => console.log('start-now')}
            >
              Começar Agora Mesmo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}