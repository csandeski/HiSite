import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, TrendingUp, LogIn, UserPlus } from "lucide-react";

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
                RadioEarn
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
    </div>
  );
}