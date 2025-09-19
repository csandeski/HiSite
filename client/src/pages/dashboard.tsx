import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, TrendingUp, Play, Lock, Pause, Plus, Volume2, User, Users } from "lucide-react";
import logoUrl from '@/assets/logo.png';
import jovemPanLogo from '@assets/channels4_profile-removebg-preview_1758313844024.png';
import { radios } from "../App";
import { useState, useEffect } from 'react';

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
  userName?: string;
  setUserName?: (name: string) => void;
}

export default function Dashboard({
  playingRadioId,
  setPlayingRadioId,
  isPlaying,
  setIsPlaying,
  sessionPoints,
  balance,
  userName
}: DashboardProps) {
  // Estado para rastrear ouvintes por rádio
  const [listeners, setListeners] = useState<{ [key: number]: number }>(() => {
    const initial: { [key: number]: number } = {};
    radios.forEach(radio => {
      // Gerar números iniciais baseados na popularidade da rádio
      const base = radio.isPremium ? 2000 : 800;
      const variance = radio.isPremium ? 1500 : 500;
      initial[radio.id] = base + Math.floor(Math.random() * variance);
    });
    return initial;
  });

  // Atualizar ouvintes periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setListeners(prev => {
        const updated = { ...prev };
        radios.forEach(radio => {
          // Variação aleatória de -50 a +50 ouvintes
          const change = Math.floor(Math.random() * 101) - 50;
          const newValue = updated[radio.id] + change;
          // Manter dentro de limites razoáveis
          const min = radio.isPremium ? 1500 : 500;
          const max = radio.isPremium ? 5000 : 2000;
          updated[radio.id] = Math.max(min, Math.min(max, newValue));
        });
        return updated;
      });
    }, 3000); // Atualiza a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

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
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
            <User className="w-4 h-4" />
            <span>Seja bem-vindo, {userName || 'Usuário'}</span>
          </div>
          
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
              <div className={`bg-white/20 p-2.5 rounded-full ${playingRadio && isPlaying ? 'animate-scale' : ''}`}>
                {playingRadio && isPlaying ? (
                  <Volume2 className="w-6 h-6 text-white" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-white" />
                )}
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
                className={`p-4 border border-l-4 relative overflow-hidden ${
                  radio.isPremium 
                    ? "bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200 border-l-gray-400" 
                    : playingRadioId === radio.id && isPlaying
                      ? "bg-gradient-to-br from-white to-blue-50/30 border-primary border-l-primary shadow-lg"
                      : playingRadioId === radio.id && !isPlaying
                      ? "bg-white border-primary/50 border-l-primary/50 shadow-md"
                      : "bg-white hover:shadow-lg hover:border-gray-300 border-gray-200 border-l-blue-500/70"
                } transition-all duration-200 ${radio.isPremium ? "" : "cursor-pointer hover:scale-[1.01]"}`}
                data-testid={`radio-card-${radio.id}`}
                onClick={() => handleRadioPlay(radio.id, radio.isPremium)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {radio.id === 1 && (
                        <img 
                          src={jovemPanLogo} 
                          alt="Jovem Pan Sports" 
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <h3 className={`font-semibold text-base ${radio.isPremium ? "text-gray-400" : "text-gray-900"}`}>
                        {radio.name}
                      </h3>
                    </div>
                    <p className={`text-sm ${radio.isPremium ? "text-gray-400" : "text-gray-600"}`}>
                      {radio.description}
                    </p>
                    
                    {/* Contador de ouvintes */}
                    <div className="flex items-center gap-1.5 mt-2 mb-2">
                      <Users className={`w-3.5 h-3.5 ${radio.isPremium ? "text-gray-400" : "text-blue-500"}`} />
                      <span className={`text-xs ${radio.isPremium ? "text-gray-400" : "text-gray-700"}`}>
                        {listeners[radio.id]?.toLocaleString('pt-BR')} pessoas ouvindo agora
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Plus className={`w-4 h-4 ${radio.isPremium ? "text-gray-400" : "text-green-600"}`} />
                      <span 
                        className={`text-sm font-semibold ${radio.isPremium ? "text-gray-400" : "text-green-600"}`}
                        data-testid={`points-per-min-${radio.id}`}
                      >
                        {radio.pointsPerMin} pontos/min
                      </span>
                      {radio.isPremium && (
                        <span className="text-xs text-gray-400 ml-1">
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
                        playingRadioId === radio.id && isPlaying
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } w-10 h-10 rounded-full transition-all duration-200`}
                      data-testid={`play-button-${radio.id}`}
                      aria-label={`Play ${radio.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRadioPlay(radio.id, radio.isPremium);
                      }}
                    >
                      {playingRadioId === radio.id && isPlaying ? (
                        <Pause className="w-4 h-4 animate-scale" />
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