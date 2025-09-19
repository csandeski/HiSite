import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import DashboardComp from "@/pages/dashboard";
import Resgatar from "@/pages/resgatar";
import NotFound from "@/pages/not-found";
import { useState, useEffect, createContext, useContext, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Radio, Volume2, Pause, Play, Gift, User } from "lucide-react";
import PremiumPopup from "@/components/PremiumPopup";

// Lista de rádios (compartilhada)
export const radios = [
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
  {
    id: 6,
    name: "Kiss FM",
    description: "Hits atuais",
    pointsPerMin: 95,
    isPremium: true,
  },
  {
    id: 7,
    name: "CBN",
    description: "Notícias 24h",
    pointsPerMin: 100,
    isPremium: true,
  },
  {
    id: 8,
    name: "BandNews FM",
    description: "Jornalismo",
    pointsPerMin: 105,
    isPremium: true,
  },
  {
    id: 9,
    name: "Rádio Globo",
    description: "Variedades",
    pointsPerMin: 110,
    isPremium: true,
  },
  {
    id: 10,
    name: "Mix FM",
    description: "Pop internacional",
    pointsPerMin: 115,
    isPremium: true,
  },
  {
    id: 11,
    name: "Transamérica",
    description: "Hits e clássicos",
    pointsPerMin: 120,
    isPremium: true,
  },
];

// Player Context (for global player and navigation)
interface PlayerContextType {
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
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

function App() {
  const [playingRadioId, setPlayingRadioId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [sessionPoints, setSessionPoints] = useState(0); // Starting with 0 to allow reaching 15 points
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState("radio");
  const [location, setLocation] = useLocation();
  const [hasReached15Points, setHasReached15Points] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [lastPopupTime, setLastPopupTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active tab with current route
  useEffect(() => {
    if (location === "/dashboard") {
      setActiveTab("radio");
    } else if (location === "/resgatar") {
      setActiveTab("resgatar");
    }
  }, [location]);

  // Detect when user reaches 15 points for the first time
  useEffect(() => {
    if (sessionPoints >= 15 && !hasReached15Points) {
      setHasReached15Points(true);
      setShowPremiumPopup(true);
      setLastPopupTime(Date.now());
    }
  }, [sessionPoints, hasReached15Points]);

  // Show popup every 15 seconds after reaching 15 points
  useEffect(() => {
    if (hasReached15Points && !showPremiumPopup) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up new interval
      intervalRef.current = setInterval(() => {
        setShowPremiumPopup(true);
        setLastPopupTime(Date.now());
      }, 50000); // 50 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [hasReached15Points, showPremiumPopup]);

  const handlePremiumPopupClose = (open: boolean) => {
    setShowPremiumPopup(open);
    if (!open) {
      // Reset the timer when popup is closed
      setLastPopupTime(Date.now());
    }
  };

  // Efeito para incrementar pontos enquanto toca
  useEffect(() => {
    if (!isPlaying || playingRadioId === null) return;

    const interval = setInterval(() => {
      setSessionPoints((prev) => prev + 1);
    }, 1500); // Incrementa a cada 1,5 segundos

    return () => clearInterval(interval);
  }, [isPlaying, playingRadioId]);

  const playingRadio = radios.find(r => r.id === playingRadioId);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "radio") {
      setLocation("/dashboard");
    } else if (tab === "resgatar") {
      setLocation("/resgatar");
    } else if (tab === "perfil") {
      // For now, stay on the same page
      // setLocation("/perfil");
    }
  };

  const playerProps = {
    playingRadioId,
    setPlayingRadioId,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    sessionPoints,
    setSessionPoints,
    balance,
    setBalance,
    showPremiumPopup,
    setShowPremiumPopup: handlePremiumPopupClose
  };

  // Memoized wrapper components to prevent re-creation on every render
  // Not including sessionPoints in dependencies to avoid re-creation when points update
  const Dashboard = useMemo(
    () => () => <DashboardComp {...playerProps} />,
    [playingRadioId, isPlaying, volume, balance, showPremiumPopup]
  );
  
  const ResgatarWrapper = useMemo(
    () => () => <Resgatar {...playerProps} />,
    [playingRadioId, isPlaying, volume, balance, showPremiumPopup]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerContext.Provider value={{
          playingRadioId,
          setPlayingRadioId,
          isPlaying,
          setIsPlaying,
          volume,
          setVolume,
          sessionPoints,
          setSessionPoints,
          balance,
          setBalance,
          activeTab,
          setActiveTab
        }}>
          <Toaster />
          <div className="min-h-screen flex flex-col">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/resgatar" component={ResgatarWrapper} />
              <Route component={NotFound} />
            </Switch>
            
            {/* Global Player - Above bottom navigation */}
            {playingRadio && (
              <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-30">
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="bg-primary/10 p-1.5 rounded">
                        <Radio className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-xs text-gray-900 truncate">{playingRadio.name}</h4>
                          {isPlaying && (
                            <span className="text-[10px] font-medium text-red-500 whitespace-nowrap">AO VIVO</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{playingRadio.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-14 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        data-testid="volume-slider"
                        style={{
                          background: `linear-gradient(to right, #023E73 0%, #023E73 ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="bg-primary text-white w-8 h-8 rounded-full hover:bg-primary/90"
                        onClick={() => setIsPlaying(!isPlaying)}
                        data-testid="pause-player"
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Bottom Navigation */}
            {(location === "/dashboard" || location === "/resgatar") && (
              <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
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
                        onClick={() => handleTabChange("radio")}
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
                        onClick={() => handleTabChange("resgatar")}
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
                        onClick={() => handleTabChange("perfil")}
                        data-testid="tab-perfil"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-xs font-medium">Perfil</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </nav>
            )}
            
            {/* Premium Popup */}
            <PremiumPopup 
              open={showPremiumPopup} 
              onOpenChange={handlePremiumPopupClose}
            />
          </div>
        </PlayerContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;