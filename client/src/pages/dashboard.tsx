import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, TrendingUp, Play, Lock, Pause, Plus, Volume2, User, Users, Radio as RadioIcon, Zap } from "lucide-react";
import logoUrl from '@/assets/logo.png';
import jovemPanLogo from '@assets/channels4_profile-removebg-preview_1758313844024.png';
import serraMarLogo from '@/assets/serra-mar-logo.png';
import { radios } from "../App";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

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
  const [, setLocation] = useLocation();
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
                className="h-7 md:h-9 w-auto object-contain" 
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
                onClick={() => setLocation('/perfil')}
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
                      : "bg-white hover:shadow-lg hover:border-gray-300 border-gray-200 border-l-gray-300"
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
                      {radio.id === 2 && (
                        <img 
                          src={serraMarLogo} 
                          alt="Serramar FM" 
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
                    
                    {/* Badge de ouvintes ao vivo e pontos */}
                    <div className="flex items-center gap-2 mt-3">
                      {/* Badge ao vivo - mais discreto */}
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                        radio.isPremium 
                          ? "bg-gray-100 text-gray-400" 
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}>
                        <Users className="w-3 h-3 text-gray-500" />
                        <span className="text-[11px] font-medium">
                          {listeners[radio.id]?.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      {/* Badge de pontos */}
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                        radio.isPremium 
                          ? "bg-gray-100" 
                          : "bg-green-50 border border-green-200"
                      }`}>
                        <Zap className={`w-3.5 h-3.5 ${radio.isPremium ? "text-gray-400" : "text-green-600"}`} />
                        <span className={`text-xs font-bold ${radio.isPremium ? "text-gray-400" : "text-green-700"}`}
                          data-testid={`points-per-min-${radio.id}`}
                        >
                          {radio.pointsPerMin} pts/min
                        </span>
                      </div>
                      
                      {radio.isPremium && (
                        <span className="text-[10px] font-medium px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 rounded-full">
                          Premium
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
                          ? "bg-primary text-white hover:bg-primary/90 shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } w-12 h-12 rounded-full transition-all duration-200`}
                      data-testid={`play-button-${radio.id}`}
                      aria-label={`Play ${radio.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRadioPlay(radio.id, radio.isPremium);
                      }}
                    >
                      {playingRadioId === radio.id && isPlaying ? (
                        <Pause className="w-5 h-5 animate-scale" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>
                  )}
                  
                  {radio.isPremium && (
                    <Lock className="w-7 h-7 text-gray-400" />
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