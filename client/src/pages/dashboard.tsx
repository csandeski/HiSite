import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, TrendingUp, Play, Lock, Radio, Gift, User, Volume2, Pause, Plus, Music } from "lucide-react";
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
    }, 1500); // Incrementa a cada 1,5 segundos

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
            className="bg-gradient-to-r from-primary to-blue-500 text-white p-5 mb-5 border-0"
            data-testid="session-points-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/90 text-sm mb-1">
                  Pontos desta sessão
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    +{sessionPoints}
                  </span>
                  <span className="text-base opacity-90">pts</span>
                </div>
              </div>
              <div className="bg-white/20 p-2.5 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Live earning indicator inside the card */}
            {playingRadio && (
              <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white/90">
                  Ganhando pontos ao vivo • {playingRadio.name}
                </span>
              </div>
            )}
          </Card>

          {/* Radio List */}
          <div className="space-y-3">
            
            {radios.map((radio) => (
              <Card
                key={radio.id}
                className={`p-4 border ${
                  radio.isPremium 
                    ? "bg-gray-50/30 border-gray-100" 
                    : playingRadioId === radio.id
                      ? "bg-white border-primary shadow-md"
                      : "bg-white hover:shadow-md border-gray-200"
                } transition-all duration-200 ${radio.isPremium ? "" : "cursor-pointer"}`}
                data-testid={`radio-card-${radio.id}`}
                onClick={() => handleRadioPlay(radio.id, radio.isPremium)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${radio.isPremium ? "text-gray-400" : "text-gray-900"}`}>
                      {radio.name}
                    </h3>
                    <p className={`text-sm mt-0.5 ${radio.isPremium ? "text-gray-400" : "text-gray-500"}`}>
                      {radio.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Plus className={`w-4 h-4 ${radio.isPremium ? "text-gray-400" : "text-green-600"}`} />
                      <span 
                        className={`text-sm font-medium ${radio.isPremium ? "text-gray-400" : "text-green-600"}`}
                        data-testid={`points-per-min-${radio.id}`}
                      >
                        {radio.pointsPerMin} pontos/min
                      </span>
                      {radio.isPremium && (
                        <span className="text-xs text-gray-400">
                          • Premium
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!radio.isPremium && (
                    <Button
                      size="icon"
                      variant="default"
                      className={`${
                        playingRadioId === radio.id
                          ? "bg-primary text-white"
                          : "bg-primary text-white hover:bg-primary/90"
                      } w-10 h-10 rounded-full transition-all duration-200`}
                      data-testid={`play-button-${radio.id}`}
                      aria-label={`Play ${radio.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRadioPlay(radio.id, radio.isPremium);
                      }}
                    >
                      {playingRadioId === radio.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </Button>
                  )}
                  
                  {radio.isPremium && (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>



      {/* Bottom Navigation with Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-20">
        {/* Player integrado */}
        {playingRadio && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-primary/10 p-2.5 rounded-lg">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">{playingRadio.name}</h4>
                    <p className="text-xs text-gray-500">{playingRadio.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    data-testid="volume-slider"
                    style={{
                      background: `linear-gradient(to right, #023E73 0%, #023E73 ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-primary text-white w-9 h-9 rounded-full hover:bg-primary/90"
                    onClick={() => setPlayingRadioId(null)}
                    data-testid="pause-player"
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="border-t shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <div className="relative flex flex-col items-center gap-1">
              {activeTab === "radio" && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full"></div>
              )}
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 py-2 px-4 min-w-0 h-auto rounded-xl ${
                  activeTab === "radio"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("radio")}
                data-testid="tab-radio"
              >
                <Radio className="w-5 h-5" />
                <span className="text-xs font-medium">Rádio</span>
              </Button>
            </div>

            <div className="relative flex flex-col items-center gap-1">
              {activeTab === "resgatar" && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full"></div>
              )}
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 py-2 px-4 min-w-0 h-auto rounded-xl ${
                  activeTab === "resgatar"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("resgatar")}
                data-testid="tab-resgatar"
              >
                <Gift className="w-5 h-5" />
                <span className="text-xs font-medium">Resgatar</span>
              </Button>
            </div>

            <div className="relative flex flex-col items-center gap-1">
              {activeTab === "perfil" && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full"></div>
              )}
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 py-2 px-4 min-w-0 h-auto rounded-xl ${
                  activeTab === "perfil"
                    ? "bg-green-100 text-green-700"
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
        </div>
        </nav>
      </div>
    </div>
  );
}