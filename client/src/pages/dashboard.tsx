import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, TrendingUp, Play, Lock, Radio, Gift, User, Headphones, Star, Volume2, Pause } from "lucide-react";
import logoUrl from '@/assets/logo.png';
import { useState, useEffect } from "react";

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
  const [playingRadioId, setPlayingRadioId] = useState<number | null>(null);
  const [volume, setVolume] = useState(50);

  const handleRadioPlay = (radioId: number, isPremium: boolean) => {
    if (isPremium) {
      // Rádio premium não pode tocar
      return;
    }
    
    if (playingRadioId === radioId) {
      // Pausar se já está tocando
      setPlayingRadioId(null);
    } else {
      // Tocar nova rádio
      setPlayingRadioId(radioId);
    }
  };

  // Efeito para incrementar pontos enquanto toca
  useEffect(() => {
    if (playingRadioId === null) return;

    const interval = setInterval(() => {
      setSessionPoints((prev) => prev + 1);
    }, 1000); // Incrementa a cada segundo

    return () => clearInterval(interval);
  }, [playingRadioId]);

  const playingRadio = radios.find(r => r.id === playingRadioId);

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
          {/* Welcome Message */}
          <p className="text-sm text-gray-600 mb-3">
            Seja bem-vindo, Usuário
          </p>
          
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
            
            {radios.map((radio) => (
              <Card
                key={radio.id}
                className={`p-4 border-2 ${
                  radio.isPremium 
                    ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300" 
                    : playingRadioId === radio.id
                      ? "bg-gradient-to-br from-blue-50 to-primary/10 border-primary shadow-lg"
                      : "bg-white hover:shadow-lg hover:border-primary/30 border-gray-100"
                } transition-all duration-300 cursor-pointer group`}
                data-testid={`radio-card-${radio.id}`}
                onClick={() => handleRadioPlay(radio.id, radio.isPremium)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2.5 rounded-lg ${
                      radio.isPremium 
                        ? "bg-gradient-to-br from-yellow-200 to-amber-200" 
                        : "bg-gradient-to-br from-blue-100 to-primary/20"
                    }`}>
                      <Headphones className={`w-5 h-5 ${
                        radio.isPremium ? "text-yellow-700" : "text-primary"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base md:text-lg text-gray-900">
                          {radio.name}
                        </h3>
                        {radio.isPremium && (
                          <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                            <Star className="w-3 h-3" />
                            Premium
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {radio.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span 
                          className={`font-bold text-sm px-2 py-1 rounded-md ${
                            radio.isPremium 
                              ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700" 
                              : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700"
                          }`}
                          data-testid={`points-per-min-${radio.id}`}
                        >
                          +{radio.pointsPerMin} pts/min
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="icon"
                    variant={radio.isPremium ? "ghost" : "default"}
                    className={`${
                      radio.isPremium 
                        ? "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 hover:from-gray-300 hover:to-gray-400" 
                        : "bg-gradient-to-r from-primary to-blue-500 text-white hover:shadow-lg hover:scale-105"
                    } w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 shadow-md`}
                    data-testid={`play-button-${radio.id}`}
                    aria-label={`Play ${radio.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRadioPlay(radio.id, radio.isPremium);
                    }}
                  >
                    {radio.isPremium ? (
                      <Lock className="w-5 h-5 md:w-6 md:h-6" />
                    ) : playingRadioId === radio.id ? (
                      <Pause className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Player Flutuante */}
      {playingRadio && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2">
          <Card className="bg-gradient-to-r from-primary to-blue-500 text-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{playingRadio.name}</h4>
                  <p className="text-xs text-white/80">{playingRadio.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  data-testid="volume-slider"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full"
                  onClick={() => setPlayingRadioId(null)}
                  data-testid="pause-player"
                >
                  <Pause className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Card de Pontos flutuante quando tocando */}
      {playingRadio && (
        <div className="fixed top-20 left-4 right-4 z-30 max-w-sm mx-auto">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/90">Pontos desta sessão</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">+{sessionPoints}</span>
                  <span className="text-sm opacity-90">pts</span>
                </div>
              </div>
              <div className="text-right">
                <TrendingUp className="w-5 h-5 mb-1" />
                <p className="text-xs text-white/80">
                  Ganhando pontos ao vivo • {playingRadio.name}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 py-3 px-4 min-w-0 h-auto ${
                activeTab === "radio"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("radio")}
              data-testid="tab-radio"
            >
              <Radio className="w-6 h-6" />
              <span className="text-sm font-medium">Rádio</span>
            </Button>

            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 py-3 px-4 min-w-0 h-auto ${
                activeTab === "resgatar"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("resgatar")}
              data-testid="tab-resgatar"
            >
              <Gift className="w-6 h-6" />
              <span className="text-sm font-medium">Resgatar</span>
            </Button>

            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 py-3 px-4 min-w-0 h-auto ${
                activeTab === "perfil"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("perfil")}
              data-testid="tab-perfil"
            >
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">Perfil</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}