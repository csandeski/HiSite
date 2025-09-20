import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardComp from "@/pages/dashboard";
import Resgatar from "@/pages/resgatar";
import Perfil from "@/pages/perfil";
import { AdminPage } from "@/pages/admin";
import { AdminLoginPage } from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import { useState, useEffect, createContext, useContext, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Radio, Volume2, VolumeX, Pause, Play, Gift, User } from "lucide-react";
import PremiumPopup from "@/components/PremiumPopup";
import { api } from "@/lib/api";
import PushNotification from "@/components/PushNotification";
import jovemPanLogo from '@assets/channels4_profile-removebg-preview_1758313844024.png';
import serraMarLogo from '@/assets/serra-mar-logo.png';
import hitsFmLogo from '@/assets/hits-fm-logo.png';
import antena1Logo from '@/assets/antena-1-logo.png';
import fm89Logo from '@/assets/89fm-logo.png';
import kissFmLogo from '@/assets/kiss-fm-logo.png';
import cbnLogo from '@assets/cbn_1758327521219.png';
import bandNewsLogo from '@assets/BandNews_FM_logo_2019_1758327521220.png';
import radioGloboLogo from '@assets/radio-globo-default-removebg-preview_1758327521221.png';
import transamericaLogo from '@assets/Rede_Transamérica_logo_1758327521220.png';
import mixFmLogo from '@assets/Logotipo_da_Mix_FM_1758327521220.png';

// Lista de rádios (compartilhada)
export const radios = [
  {
    id: 1,
    name: "Jovem Pan Sports",
    description: "Futebol e debates",
    pointsPerMin: 50,
    isPremium: false,
    streamUrl: "https://stream.zeno.fm/c45wbq2us3buv",
  },
  {
    id: 2,
    name: "Serramar FM",
    description: "Esportes e música",
    pointsPerMin: 45,
    isPremium: false,
    streamUrl: "https://www.appradio.app:8105/live",
  },
  {
    id: 3,
    name: "Rádio Hits FM",
    description: "Hits e esportes",
    pointsPerMin: 60,
    isPremium: false,
    streamUrl: "https://wz7.servidoresbrasil.com:8162/stream",
  },
  {
    id: 4,
    name: "Antena 1",
    description: "Pop nacional",
    pointsPerMin: 85,
    isPremium: true,
    streamUrl: "https://antenaone.crossradio.com.br/stream/2",
  },
  {
    id: 5,
    name: "89 FM",
    description: "Rock clássico",
    pointsPerMin: 90,
    isPremium: true,
    streamUrl: "https://stream.zeno.fm/wtdli9kausatv",
  },
  {
    id: 6,
    name: "Kiss FM",
    description: "Hits atuais",
    pointsPerMin: 95,
    isPremium: true,
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_KISSFM_ADP.m3u8?dist=onlineradiobox",
  },
  {
    id: 7,
    name: "CBN",
    description: "Notícias 24h",
    pointsPerMin: 100,
    isPremium: true,
    streamUrl: "https://stream.zeno.fm/cbn-fm",
  },
  {
    id: 8,
    name: "BandNews FM",
    description: "Jornalismo",
    pointsPerMin: 105,
    isPremium: true,
    streamUrl: "https://stream.zeno.fm/bandnews-fm",
  },
  {
    id: 9,
    name: "Rádio Globo",
    description: "Variedades",
    pointsPerMin: 110,
    isPremium: true,
    streamUrl: "https://stream.zeno.fm/radio-globo",
  },
  {
    id: 10,
    name: "Mix FM",
    description: "Pop internacional",
    pointsPerMin: 115,
    isPremium: true,
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SAOPAULOAAC.aac?dist=onlineradiobox",
  },
  {
    id: 11,
    name: "Transamérica",
    description: "Hits e clássicos",
    pointsPerMin: 120,
    isPremium: true,
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/RT_SPAAC.aac?dist=onlineradiobox",
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
  const [lastVolume, setLastVolume] = useState(50);
  const [sessionPoints, setSessionPoints] = useState(0); // Starting with 0 to allow reaching 15 points
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState("radio");
  const [location, setLocation] = useLocation();
  const [hasReached15Points, setHasReached15Points] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [lastPopupTime, setLastPopupTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });
  
  // Time tracking states
  const [listeningStartTime, setListeningStartTime] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [totalListeningTime, setTotalListeningTime] = useState<number>(() => {
    // Load previous listening time from localStorage
    const savedTime = localStorage.getItem('totalListeningTime');
    const savedDate = localStorage.getItem('lastListeningDate');
    const today = new Date().toDateString();
    
    // Reset if it's a new day
    if (savedDate !== today) {
      localStorage.setItem('lastListeningDate', today);
      localStorage.setItem('totalListeningTime', '0');
      return 0;
    }
    
    return savedTime ? parseInt(savedTime) : 0;
  });
  
  // User creation date
  const [memberSince] = useState(() => {
    const saved = localStorage.getItem('memberSince');
    if (saved) return saved;
    
    const now = new Date();
    const formatted = now.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\.$/, '');
    localStorage.setItem('memberSince', formatted);
    return formatted;
  });

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Handle radio playback
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && playingRadioId !== null) {
      const radio = radios.find(r => r.id === playingRadioId);
      if (radio && radio.streamUrl) {
        audioRef.current.src = radio.streamUrl;
        audioRef.current.play().catch(error => {
          console.error("Erro ao tocar rádio:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, playingRadioId]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Sync active tab with current route
  useEffect(() => {
    if (location === "/dashboard") {
      setActiveTab("radio");
    } else if (location === "/resgatar") {
      setActiveTab("resgatar");
    } else if (location === "/perfil") {
      setActiveTab("perfil");
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

  // Effect to track listening time and points while playing
  useEffect(() => {
    if (isPlaying && playingRadioId !== null) {
      // Start tracking listening time
      const startTime = Date.now();
      setListeningStartTime(startTime);
      setSessionStartTime(startTime);
      
      // Start listening session in backend (if logged in)
      api.startListening(playingRadioId.toString()).then((response) => {
        setCurrentSessionId(response.session.id);
      }).catch((error) => {
        console.error('Failed to start listening session:', error);
        // Continue tracking locally even if backend fails
      });
      
      // Increment points
      const pointsInterval = setInterval(() => {
        setSessionPoints((prev) => prev + 1);
      }, 1500); // Increment every 1.5 seconds
      
      // Update total listening time every second
      const timeInterval = setInterval(() => {
        setTotalListeningTime((prev) => {
          const newTotal = prev + 1000; // Add 1 second
          localStorage.setItem('totalListeningTime', newTotal.toString());
          return newTotal;
        });
      }, 1000);
      
      return () => {
        clearInterval(pointsInterval);
        clearInterval(timeInterval);
        
        // End listening session in backend (if session was started)
        if (currentSessionId && sessionStartTime) {
          const duration = Math.floor((Date.now() - sessionStartTime) / 1000); // Duration in seconds
          api.endListening({
            sessionId: currentSessionId,
            duration: duration,
            pointsEarned: sessionPoints
          }).then(() => {
            // Invalidate queries to refresh user data
            queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
          }).catch((error) => {
            console.error('Failed to end listening session:', error);
          });
        }
        
        setListeningStartTime(null);
        setCurrentSessionId(null);
        setSessionStartTime(0);
      };
    } else {
      setListeningStartTime(null);
    }
  }, [isPlaying, playingRadioId, currentSessionId, sessionStartTime, sessionPoints]);

  const playingRadio = radios.find(r => r.id === playingRadioId);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "radio") {
      setLocation("/dashboard");
    } else if (tab === "resgatar") {
      setLocation("/resgatar");
    } else if (tab === "perfil") {
      setLocation("/perfil");
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
    setShowPremiumPopup: handlePremiumPopupClose,
    userName,
    setUserName
  };

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
              <Route path="/">
                <Home setUserName={setUserName} />
              </Route>
              <Route path="/login">
                <LoginPage />
              </Route>
              <Route path="/register">
                <RegisterPage />
              </Route>
              <Route path="/dashboard">
                <DashboardComp {...playerProps} totalListeningTime={totalListeningTime} />
                <PushNotification />
              </Route>
              <Route path="/resgatar">
                <Resgatar {...playerProps} />
                <PushNotification />
              </Route>
              <Route path="/perfil">
                <Perfil 
                  userName={userName} 
                  sessionPoints={sessionPoints} 
                  balance={balance}
                  totalListeningTime={totalListeningTime}
                  memberSince={memberSince}
                />
                <PushNotification />
              </Route>
              <Route path="/adm/login">
                <AdminLoginPage />
              </Route>
              <Route path="/adm">
                <AdminPage />
              </Route>
              <Route component={NotFound} />
            </Switch>
            
            {/* Global Player - Above bottom navigation */}
            {playingRadio && (
              <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-30">
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="bg-primary/10 p-1.5 rounded">
                        {playingRadio.id === 1 ? (
                          <img 
                            src={jovemPanLogo} 
                            alt="Jovem Pan Sports" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 2 ? (
                          <img 
                            src={serraMarLogo} 
                            alt="Serramar FM" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 3 ? (
                          <img 
                            src={hitsFmLogo} 
                            alt="Rádio Hits FM" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 4 ? (
                          <img 
                            src={antena1Logo} 
                            alt="Antena 1" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 5 ? (
                          <img 
                            src={fm89Logo} 
                            alt="89 FM" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 6 ? (
                          <img 
                            src={kissFmLogo} 
                            alt="Kiss FM" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 7 ? (
                          <img 
                            src={cbnLogo} 
                            alt="CBN" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 8 ? (
                          <img 
                            src={bandNewsLogo} 
                            alt="BandNews FM" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 9 ? (
                          <img 
                            src={radioGloboLogo} 
                            alt="Rádio Globo" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 10 ? (
                          <img 
                            src={mixFmLogo} 
                            alt="Mix FM" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : playingRadio.id === 11 ? (
                          <img 
                            src={transamericaLogo} 
                            alt="Transamérica" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <Radio className="w-4 h-4 text-primary" />
                        )}
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
                    <div className="flex items-center gap-3">
                      {/* Volume controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (volume > 0) {
                              setLastVolume(volume);
                              setVolume(0);
                            } else {
                              setVolume(lastVolume);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          aria-label={volume > 0 ? "Silenciar" : "Ativar som"}
                          data-testid="volume-toggle"
                        >
                          {volume === 0 ? (
                            <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => {
                            const newVolume = Number(e.target.value);
                            setVolume(newVolume);
                            if (newVolume > 0) {
                              setLastVolume(newVolume);
                            }
                          }}
                          className="w-16 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                          data-testid="volume-slider"
                          style={{
                            background: `linear-gradient(to right, #023E73 0%, #023E73 ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`
                          }}
                        />
                        <span className="text-[10px] text-gray-500 min-w-[25px] text-right">{volume}%</span>
                      </div>
                      
                      {/* Divider line */}
                      <div className="w-px h-6 bg-gray-200"></div>
                      
                      {/* Play/Pause button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="bg-primary text-white w-8 h-8 rounded-full hover:bg-primary/90"
                        onClick={() => setIsPlaying(!isPlaying)}
                        data-testid={isPlaying ? "pause-player" : "play-player"}
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
            {(location === "/dashboard" || location === "/resgatar" || location === "/perfil") && (
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

// Protected App with Auth
function ProtectedApp() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Redirect to login if not authenticated and trying to access protected routes
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/resgatar', '/perfil'];
    // Adicionar um pequeno delay para evitar redirecionamento durante o registro
    const timer = setTimeout(() => {
      if (!loading && !user && protectedRoutes.includes(location)) {
        setLocation('/login');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user, loading, location, setLocation]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return <App />;
}

// Main export with AuthProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}

export default AppWithAuth;