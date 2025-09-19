import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, TrendingUp, Play, Lock, Radio, Gift, User } from "lucide-react";
import logoUrl from '@/assets/logo.png';
import { useState } from "react";

// Lista de rádios
const radios = [
  {
    id: 1,
    name: "Jovem Pan Sports",
    description: "Futebol e debates",
    pointsPerMin: 50,
    isPremium: false,
  },
  {
    id: 2,
    name: "Serramar FM",
    description: "Esportes e música",
    pointsPerMin: 45,
    isPremium: false,
  },
  {
    id: 3,
    name: "Rádio Hits FM",
    description: "Hits e esportes",
    pointsPerMin: 60,
    isPremium: false,
  },
  {
    id: 4,
    name: "Antena 1",
    description: "Pop nacional",
    pointsPerMin: 85,
    isPremium: true,
  },
  {
    id: 5,
    name: "89 FM",
    description: "Rock clássico",
    pointsPerMin: 90,
    isPremium: true,
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("radio");
  const [sessionPoints, setSessionPoints] = useState(0);
  const [balance, setBalance] = useState(0);

  const handleRadioPlay = (radioId: number, isPremium: boolean) => {
    if (isPremium) {
      console.log(`Premium radio clicked: ${radioId}`);
      // Aqui você pode mostrar um modal ou alerta sobre ser premium
    } else {
      console.log(`Radio started: ${radioId}`);
      // Lógica para iniciar a rádio
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={logoUrl} 
                alt="RádioPlay" 
                className="h-8 md:h-10 w-auto object-contain" 
                data-testid="dashboard-logo"
              />
            </div>

            {/* Balance and Settings */}
            <div className="flex items-center gap-3">
              <div 
                className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-sm md:text-base"
                data-testid="balance-display"
              >
                R$ {balance.toFixed(2)}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="w-9 h-9"
                data-testid="settings-button"
                aria-label="Configurações"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Session Points Card */}
          <Card 
            className="bg-gradient-to-r from-primary to-blue-500 text-white p-6 mb-6 border-0 shadow-lg"
            data-testid="session-points-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm md:text-base mb-1">
                  Pontos desta sessão
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold">
                    +{sessionPoints}
                  </span>
                  <span className="text-lg md:text-xl opacity-90">pts</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
            </div>
          </Card>

          {/* Radio List */}
          <div className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Escolha sua rádio
            </h2>
            
            {radios.map((radio) => (
              <Card
                key={radio.id}
                className={`p-4 ${
                  radio.isPremium ? "opacity-75 bg-gray-50" : "bg-white hover:shadow-md"
                } transition-all duration-200 cursor-pointer`}
                data-testid={`radio-card-${radio.id}`}
                onClick={() => handleRadioPlay(radio.id, radio.isPremium)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base md:text-lg text-gray-900">
                        {radio.name}
                      </h3>
                      {radio.isPremium && (
                        <Lock 
                          className="w-4 h-4 text-yellow-600" 
                          data-testid={`premium-lock-${radio.id}`}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {radio.description}
                    </p>
                    <span 
                      className="text-green-600 font-semibold text-sm"
                      data-testid={`points-per-min-${radio.id}`}
                    >
                      +{radio.pointsPerMin} pontos/min
                    </span>
                  </div>
                  
                  <Button
                    size="icon"
                    variant={radio.isPremium ? "ghost" : "default"}
                    className={`${
                      radio.isPremium 
                        ? "bg-gray-200 text-gray-400" 
                        : "bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90"
                    } w-10 h-10 md:w-12 md:h-12 rounded-full`}
                    data-testid={`play-button-${radio.id}`}
                    aria-label={`Play ${radio.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRadioPlay(radio.id, radio.isPremium);
                    }}
                  >
                    {radio.isPremium ? (
                      <Lock className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Play className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 py-2 px-4 min-w-0 h-auto ${
                activeTab === "radio"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("radio")}
              data-testid="tab-radio"
            >
              <Radio className="w-5 h-5" />
              <span className="text-xs font-medium">Rádio</span>
            </Button>

            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 py-2 px-4 min-w-0 h-auto ${
                activeTab === "resgatar"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("resgatar")}
              data-testid="tab-resgatar"
            >
              <Gift className="w-5 h-5" />
              <span className="text-xs font-medium">Resgatar</span>
            </Button>

            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 py-2 px-4 min-w-0 h-auto ${
                activeTab === "perfil"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("perfil")}
              data-testid="tab-perfil"
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">Perfil</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}