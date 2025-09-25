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
import PixTestPage from "@/pages/pix-test";
import { useState, useEffect, createContext, useContext, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Radio, Volume2, VolumeX, Pause, Play, Gift, User } from "lucide-react";
import PremiumPopup from "@/components/PremiumPopup";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import PushNotification from "@/components/PushNotification";
import { useUTMTracking } from "@/hooks/useUTMTracking";
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
    streamUrl: "https://wz7.servidoresbrasil.com:9984/stream",
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
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;
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

function App({ user }: { user: any }) {
  const { refreshUser } = useAuth(); // Get refreshUser from auth context
  
  // Capture UTM parameters early in app initialization
  useUTMTracking();
  const [playingRadioId, setPlayingRadioId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [volume, setVolume] = useState(50);
  const [lastVolume, setLastVolume] = useState(50);
  const [sessionPoints, setSessionPoints] = useState(0); // Will be synced with user data via useEffect
  const [balance, setBalance] = useState(0); // Will be synced with user data via useEffect
  const [activeTab, setActiveTab] = useState("radio");
  const [location, setLocation] = useLocation();
  const [hasReachedPointsThreshold, setHasReachedPointsThreshold] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [lastPopupTime, setLastPopupTime] = useState<number | null>(null);
  const [initialPointsLoaded, setInitialPointsLoaded] = useState(false);
  const [hasShown100PointsPopup, setHasShown100PointsPopup] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshingPoints, setIsRefreshingPoints] = useState(false);
  
  // Celebration toast states
  const [hasReached20Points, setHasReached20Points] = useState(false);
  const [lastCelebrationTime, setLastCelebrationTime] = useState<number | null>(null);
  const celebrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });
  
  // Time tracking states
  const [listeningStartTime, setListeningStartTime] = useState<number | null>(null);
  const sessionInfoRef = useRef<{sessionId: string | null; sessionStartTime: number; sessionPoints: number; baselinePoints: number}>({
    sessionId: null,
    sessionStartTime: 0,
    sessionPoints: 0,
    baselinePoints: 0
  });
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

  // Initialize balance and points only once when user logs in/out
  useEffect(() => {
    if (user && user.id) {
      // ALWAYS load balance and points from database when user logs in
      setBalance(user.balance ? parseFloat(user.balance) : 0);
      
      // ALWAYS load points from database - don't keep old session points
      setSessionPoints(user.points || 0);
      setInitialPointsLoaded(true);
    } else if (!user) {
      // Only reset when user is actually logged out (not during loading)
      setSessionPoints(0);
      setBalance(0);
      setInitialPointsLoaded(false);
      setHasReachedPointsThreshold(false);
      setHasReached20Points(false);
      setHasShown100PointsPopup(false);
      setLastCelebrationTime(null);
      if (celebrationIntervalRef.current) {
        clearInterval(celebrationIntervalRef.current);
      }
    }
  }, [user?.id]); // Only run when user ID changes (login/logout)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    // Add event listeners to detect when audio is ready
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      console.log('Audio can play - syncing complete');
      setIsSyncing(false);
    };
    
    const handleWaiting = () => {
      console.log('Audio is waiting for data');
      setIsSyncing(true);
    };
    
    const handleError = () => {
      console.error('Audio error occurred');
      setIsSyncing(false);
      setIsPlaying(false);
    };
    
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('error', handleError);
    
    return () => {
      if (audioRef.current) {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('error', handleError);
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
        // Start syncing
        setIsSyncing(true);
        audioRef.current.src = radio.streamUrl;
        audioRef.current.play().catch(error => {
          console.error("Erro ao tocar rádio:", error);
          setIsPlaying(false);
          setIsSyncing(false);
        });
      }
    } else {
      audioRef.current.pause();
      setIsSyncing(false);
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

  // Detect when user reaches 25 points for the first time (only if logged in)
  useEffect(() => {
    // Only show popup if:
    // 1. User is logged in
    // 2. We've already loaded initial points (not first load)
    // 3. User has earned points during this session (not just loaded with 330+ points)
    // 4. User hasn't seen the popup yet in this session
    // 5. User is on dashboard/resgatar/perfil (not on home page)
    const protectedRoutes = ['/dashboard', '/resgatar', '/perfil'];
    if (user && initialPointsLoaded && sessionPoints >= 330 && !hasReachedPointsThreshold && isPlaying && protectedRoutes.includes(location)) {
      setHasReachedPointsThreshold(true);
      setShowPremiumPopup(true);
      setLastPopupTime(Date.now());
    }
  }, [user, initialPointsLoaded, sessionPoints, hasReachedPointsThreshold, isPlaying, location]);

  // Show popup every 75 seconds (1:15 min) after reaching 330 points (only if logged in and playing)
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/resgatar', '/perfil'];
    if (user && hasReachedPointsThreshold && !showPremiumPopup && isPlaying && protectedRoutes.includes(location)) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up new interval
      intervalRef.current = setInterval(() => {
        // Only show if still playing and not on home page
        if (isPlaying && protectedRoutes.includes(location)) {
          setShowPremiumPopup(true);
          setLastPopupTime(Date.now());
        }
      }, 75000); // 75 seconds (1:15 min)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval if not playing or not logged in or on home page
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [user, hasReachedPointsThreshold, showPremiumPopup, isPlaying, location]);

  const handlePremiumPopupClose = (open: boolean) => {
    setShowPremiumPopup(open);
    if (!open) {
      // Reset the timer when popup is closed
      setLastPopupTime(Date.now());
    }
  };

  // Celebration Toast - Show when user reaches 20 points for the first time
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/resgatar', '/perfil'];
    if (user && initialPointsLoaded && sessionPoints >= 20 && !hasReached20Points && isPlaying && protectedRoutes.includes(location)) {
      setHasReached20Points(true);
      toast({
        title: "🎉 RádioPlay COMEMORA!",
        description: "A RádioPlay atingiu o marco de mais de 53.000 usuários ativos! E mais de 8.300 usuários simultâneos neste exato momento!",
        duration: 8000,
      });
      setLastCelebrationTime(Date.now());
    }
  }, [user, initialPointsLoaded, sessionPoints, hasReached20Points, isPlaying, location, toast]);

  // Show premium popup when user reaches 100 points for the first time
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/resgatar', '/perfil'];
    if (user && initialPointsLoaded && sessionPoints >= 100 && !hasShown100PointsPopup && isPlaying && protectedRoutes.includes(location)) {
      setHasShown100PointsPopup(true);
      setShowPremiumPopup(true);
      setLastPopupTime(Date.now());
    }
  }, [user, initialPointsLoaded, sessionPoints, hasShown100PointsPopup, isPlaying, location]);

  // Show celebration toast every 3 minutes after reaching 20 points
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/resgatar', '/perfil'];
    if (user && hasReached20Points && isPlaying && protectedRoutes.includes(location)) {
      // Clear any existing interval
      if (celebrationIntervalRef.current) {
        clearInterval(celebrationIntervalRef.current);
      }

      // Set up new interval for 3 minutes
      celebrationIntervalRef.current = setInterval(() => {
        // Only show if still playing and not on home page
        if (isPlaying && protectedRoutes.includes(location)) {
          toast({
            title: "🎉 RádioPlay COMEMORA!",
            description: "A RádioPlay atingiu o marco de mais de 53.000 usuários ativos! E mais de 8.300 usuários simultâneos neste exato momento!",
            duration: 8000,
          });
          setLastCelebrationTime(Date.now());
        }
      }, 180000); // 3 minutes (180 seconds)

      return () => {
        if (celebrationIntervalRef.current) {
          clearInterval(celebrationIntervalRef.current);
        }
      };
    } else {
      // Clear interval if not playing or not logged in or on home page
      if (celebrationIntervalRef.current) {
        clearInterval(celebrationIntervalRef.current);
      }
    }
  }, [user, hasReached20Points, isPlaying, location, toast]);

  // Helper function to refresh points from backend
  const refreshPoints = useCallback(async () => {
    if (!user || isRefreshingPoints) return;
    
    console.log('[SYNC] Refreshing points from backend...');
    setIsRefreshingPoints(true);
    
    try {
      const { user: freshUserData } = await api.getCurrentUser();
      if (freshUserData) {
        console.log('[SYNC] Points refreshed:', {
          oldPoints: sessionPoints,
          newPoints: freshUserData.points,
          oldBalance: balance,
          newBalance: freshUserData.balance || 0,
          timestamp: new Date().toISOString()
        });
        
        // Update points and balance with fresh data
        setSessionPoints(freshUserData.points || 0);
        setBalance(parseFloat(freshUserData.balance) || 0);
        
        // Update sessionInfoRef to match new server value
        sessionInfoRef.current.sessionPoints = freshUserData.points || 0;
        
        // Refresh user in auth context
        refreshUser();
        
        // Invalidate queries to update other components
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      }
    } catch (error) {
      console.error('[SYNC] Failed to refresh points:', error);
    } finally {
      setIsRefreshingPoints(false);
    }
  }, [user, isRefreshingPoints, sessionPoints, balance, refreshUser]);

  // Helper function to end listening session
  const endListeningSession = useCallback(async () => {
    if (sessionInfoRef.current.sessionId && sessionInfoRef.current.sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionInfoRef.current.sessionStartTime) / 1000);
      const sessionId = sessionInfoRef.current.sessionId;
      const currentPoints = sessionInfoRef.current.sessionPoints;
      const baselinePoints = sessionInfoRef.current.baselinePoints;
      
      // Calculate points earned in this session only
      const pointsEarnedThisSession = Math.max(0, currentPoints - baselinePoints);
      
      console.log('[SYNC] Ending listening session:', {
        sessionId,
        duration,
        pointsEarned: pointsEarnedThisSession,
        currentPoints,
        timestamp: new Date().toISOString()
      });
      
      // Clear only session ID and start time, but KEEP the points
      sessionInfoRef.current = { sessionId: null, sessionStartTime: 0, sessionPoints: currentPoints, baselinePoints: 0 };
      
      try {
        // End session in backend and refresh user data
        const result = await api.endListening({
          sessionId,
          duration,
          pointsEarned: pointsEarnedThisSession
        });
        
        console.log('[SYNC] Session ended successfully:', {
          updatedPoints: result.updatedPoints,
          totalListeningTime: result.totalListeningTime,
          timestamp: new Date().toISOString()
        });
        
        // Use the updated points from the server response
        if (result && result.updatedPoints !== undefined) {
          setSessionPoints(result.updatedPoints);
          // Update sessionInfoRef to match new server value
          sessionInfoRef.current.sessionPoints = result.updatedPoints;
        }
        
        // Refresh all user data to ensure consistency
        await refreshPoints();
        
      } catch (error) {
        console.error('[SYNC] Failed to end listening session:', error);
        // Even if the end session fails, try to refresh points to sync with backend
        await refreshPoints();
      }
    }
  }, [refreshPoints]);

  // Handle page unload only (not visibility changes)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isPlaying) {
        endListeningSession();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPlaying, endListeningSession]);

  // Handle logout event to save points
  useEffect(() => {
    const handleAuthLogout = () => {
      // Save listening session if active
      if (isPlaying) {
        endListeningSession();
      }
    };
    
    window.addEventListener('auth-logout', handleAuthLogout);
    
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, [isPlaying, endListeningSession]);

  // Track previous radio ID to detect radio changes
  const [prevRadioId, setPrevRadioId] = useState<number | null>(null);
  
  // Effect to track listening time and points while playing
  useEffect(() => {
    let pointsInterval: NodeJS.Timeout | null = null;
    let timeInterval: NodeJS.Timeout | null = null;
    let syncInterval: NodeJS.Timeout | null = null; // Auto-sync interval
    
    // Only start counting points when playing and NOT syncing
    if (isPlaying && playingRadioId !== null && !isSyncing) {
      console.log('[SYNC] Starting listening session...', {
        radioId: playingRadioId,
        currentPoints: sessionPoints,
        timestamp: new Date().toISOString()
      });
      
      // DON'T reset session points when resuming same radio
      // Only reset if we never had points or changed radio
      if (prevRadioId !== playingRadioId && prevRadioId !== null) {
        // Radio changed - end previous session and start new one
        console.log('[SYNC] Radio changed, ending previous session...');
        endListeningSession();
        setPrevRadioId(playingRadioId);
      } else if (prevRadioId === null) {
        // First time playing - keep existing session points (don't reset)
        setPrevRadioId(playingRadioId);
      }
      
      // Start tracking listening time
      const startTime = Date.now();
      setListeningStartTime(startTime);
      sessionInfoRef.current.sessionStartTime = startTime;
      
      // Set baseline points for this session (current user total)
      sessionInfoRef.current.baselinePoints = sessionPoints;
      sessionInfoRef.current.sessionPoints = sessionPoints;
      
      // Get the radio's points per minute
      const playingRadio = radios.find(r => r.id === playingRadioId);
      const pointsPerMin = playingRadio?.pointsPerMin || 50;
      const isPremiumRadio = playingRadio?.isPremium || false;
      
      // Start listening session in backend (if logged in)
      api.startListening(playingRadioId.toString()).then((response) => {
        sessionInfoRef.current.sessionId = response.session.id;
        console.log('[SYNC] Session started:', response.session.id);
      }).catch((error) => {
        console.error('[SYNC] Failed to start listening session:', error);
        // Continue tracking locally even if backend fails
      });
      
      // Calculate points interval based on pointsPerMin
      // Always increment by 1 point at a time
      // Calculate interval in milliseconds for earning 1 point
      const baseIntervalSeconds = Math.max(1, Math.floor(60 / pointsPerMin));
      // Note: Premium multiplier is handled server-side, so we use base interval here
      const intervalMs = baseIntervalSeconds * 1000; // Convert to milliseconds
      
      // Function to save points immediately
      const savePointsImmediately = async () => {
        if (sessionInfoRef.current.sessionId && sessionInfoRef.current.sessionStartTime) {
          const duration = Math.floor((Date.now() - sessionInfoRef.current.sessionStartTime) / 1000);
          const currentPoints = sessionInfoRef.current.sessionPoints;
          const baselinePoints = sessionInfoRef.current.baselinePoints;
          const pointsEarnedThisSession = Math.max(0, currentPoints - baselinePoints);
          
          try {
            const result = await api.updateListeningSession({
              sessionId: sessionInfoRef.current.sessionId,
              duration,
              pointsEarned: pointsEarnedThisSession
            });
            
            if (result && result.updatedPoints !== undefined) {
              sessionInfoRef.current.baselinePoints = result.updatedPoints;
            }
          } catch (error) {
            console.error('[POINT-SYNC] Failed to save point:', error);
          }
        }
      };
      
      // Increment points by 1 at calculated intervals
      pointsInterval = setInterval(() => {
        setSessionPoints((prev) => {
          const newPoints = prev + 1; // Always increment by 1
          sessionInfoRef.current.sessionPoints = newPoints;
          // Save immediately after each point gained
          savePointsImmediately();
          return newPoints;
        });
      }, intervalMs);
      
      // Update total listening time every second
      timeInterval = setInterval(() => {
        setTotalListeningTime((prev) => {
          const newTotal = prev + 1000; // Add 1 second
          localStorage.setItem('totalListeningTime', newTotal.toString());
          return newTotal;
        });
      }, 1000);
      
      // AUTO-SYNC POINTS TO DATABASE EVERY 3 SECONDS
      // This ensures points are never lost when navigating between pages
      // Additionally, points are saved immediately after each point is earned
      syncInterval = setInterval(async () => {
        if (sessionInfoRef.current.sessionId && sessionInfoRef.current.sessionStartTime) {
          const duration = Math.floor((Date.now() - sessionInfoRef.current.sessionStartTime) / 1000);
          const currentPoints = sessionInfoRef.current.sessionPoints;
          const baselinePoints = sessionInfoRef.current.baselinePoints;
          const pointsEarnedThisSession = Math.max(0, currentPoints - baselinePoints);
          
          console.log('[AUTO-SYNC] Saving points to database...', {
            sessionId: sessionInfoRef.current.sessionId,
            duration,
            pointsEarned: pointsEarnedThisSession,
            currentPoints,
            timestamp: new Date().toISOString()
          });
          
          try {
            // Update session in backend without ending it
            const result = await api.updateListeningSession({
              sessionId: sessionInfoRef.current.sessionId,
              duration,
              pointsEarned: pointsEarnedThisSession
            });
            
            console.log('[AUTO-SYNC] Points saved successfully:', {
              updatedPoints: result.updatedPoints,
              timestamp: new Date().toISOString()
            });
            
            // Update points with server response to ensure consistency
            if (result && result.updatedPoints !== undefined) {
              setSessionPoints(result.updatedPoints);
              sessionInfoRef.current.sessionPoints = result.updatedPoints;
              // Update baseline for next sync
              sessionInfoRef.current.baselinePoints = result.updatedPoints;
            }
          } catch (error) {
            console.error('[AUTO-SYNC] Failed to save points:', error);
            // Continue tracking locally even if sync fails
          }
        }
      }, 3000); // Every 3 seconds
      
    } else if (!isPlaying && sessionInfoRef.current.sessionId) {
      // Radio stopped playing but we have an active session - end it immediately
      console.log('[SYNC] Radio stopped, ending session...');
      endListeningSession();
      setListeningStartTime(null);
    } else {
      setListeningStartTime(null);
    }
    
    return () => {
      if (pointsInterval) clearInterval(pointsInterval);
      if (timeInterval) clearInterval(timeInterval);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [isPlaying, playingRadioId, isSyncing, endListeningSession]); // Add endListeningSession to deps

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
    isSyncing,
    volume,
    setVolume,
    sessionPoints,
    setSessionPoints,
    balance,
    setBalance,
    showPremiumPopup,
    setShowPremiumPopup: handlePremiumPopupClose,
    userName,
    setUserName,
    refreshPoints,
    isRefreshingPoints
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerContext.Provider value={{
          playingRadioId,
          setPlayingRadioId,
          isPlaying,
          setIsPlaying,
          isSyncing,
          setIsSyncing,
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
                {user && <PushNotification sessionPoints={sessionPoints} />}
              </Route>
              <Route path="/resgatar">
                <Resgatar {...playerProps} />
                {user && <PushNotification sessionPoints={sessionPoints} />}
              </Route>
              <Route path="/perfil">
                <Perfil 
                  userName={userName} 
                  sessionPoints={sessionPoints} 
                  balance={balance}
                  totalListeningTime={totalListeningTime}
                  memberSince={memberSince}
                />
                {user && <PushNotification sessionPoints={sessionPoints} />}
              </Route>
              <Route path="/adm/login">
                <AdminLoginPage />
              </Route>
              <Route path="/adm">
                <AdminPage />
              </Route>
              <Route path="/admin">
                <AdminPage />
              </Route>
              <Route path="/pix-test">
                <PixTestPage />
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
            
            {/* Premium Popup - Only show when logged in AND not on home page */}
            {user && location !== "/" && location !== "/login" && location !== "/register" && (
              <PremiumPopup 
                open={showPremiumPopup} 
                onOpenChange={handlePremiumPopupClose}
              />
            )}
            
            
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
  
  return <App user={user} />;
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