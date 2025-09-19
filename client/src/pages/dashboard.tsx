import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, TrendingUp, Play, Lock, Pause, Plus } from "lucide-react";
import logoUrl from '@/assets/logo.png';
import { radios } from "../App";

interface DashboardProps {
  playingRadioId: number | null;
  setPlayingRadioId: (id: number | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  sessionPoints: number;
  setSessionPoints: (points: number | ((prev: number) => number)) => void;
  balance: number;
  setBalance: (balance: number) => void;
}

export default function Dashboard({
  playingRadioId,
  setPlayingRadioId,
  isPlaying,
  setIsPlaying,
  sessionPoints,
  balance
}: DashboardProps) {

  const handleRadioPlay = (radioId: number, isPremium: boolean) => {
    if (isPremium) {
      // Rádio premium não pode tocar
      return;
    }
    
    if (playingRadioId === radioId) {
      // Se a rádio atual está tocando, pausar
      // Se está pausada, retomar
      setIsPlaying(!isPlaying);
    } else {
      // Tocar nova rádio
      setPlayingRadioId(radioId);
      setIsPlaying(true);
    }
  };

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
      <main className="flex-1 pb-32">
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
            {playingRadio && isPlaying && (
              <div className="bg-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/90">
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
                    : playingRadioId === radio.id && isPlaying
                      ? "bg-white border-primary shadow-md"
                      : playingRadioId === radio.id && !isPlaying
                      ? "bg-white border-primary/50 shadow-sm"
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
                      {playingRadioId === radio.id && isPlaying ? (
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
    </div>
  );
}