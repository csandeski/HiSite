import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardComp from "@/pages/dashboard";
import Resgatar from "@/pages/resgatar";
import Perfil from "@/pages/perfil";
import Chat from "@/pages/chat";
import AccountAuthorization from "@/pages/account-authorization";
import { AdminPage } from "@/pages/admin";
import { AdminLoginPage } from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import PixTestPage from "@/pages/pix-test";
import { useState, useEffect, createContext, useContext, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Radio, Volume2, VolumeX, Pause, Play, Gift, User, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
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
  const [initialPointsLoaded, setInitialPointsLoaded] = useState(false);
  const [isRefreshingPoints, setIsRefreshingPoints] = useState(false);
  const [navigationTrigger, setNavigationTrigger] = useState(0); // Trigger for modal on navigation
  const [previousLocation, setPreviousLocation] = useState(location);
  
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pointsIntervalRef = useRef<NodeJS.Timeout | null>(null); // Control points timer uniquely
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

  // Sync active tab with current route and detect navigation changes
  useEffect(() => {
    if (location === "/dashboard") {
      setActiveTab("radio");
    } else if (location === "/resgatar") {
      setActiveTab("resgatar");
    } else if (location === "/perfil") {
      setActiveTab("perfil");
    }
    
    // Detect navigation change for daily limit modal
    if (location !== previousLocation) {
      console.log('[DailyLimitModal] Navigation detected from', previousLocation, 'to', location);
      setPreviousLocation(location);
      
      // Check if user has hit limit and should see modal on navigation
      const modalFirstShown = localStorage.getItem('dailyLimitModalFirstShown');
      if (modalFirstShown && sessionPoints >= 600 && user && !user.accountAuthorized) {
        console.log('[DailyLimitModal] Triggering modal on navigation - user has hit limit');
        setNavigationTrigger(prev => prev + 1);
      }
    }
  }, [location, previousLocation, sessionPoints, user]);


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
        // FIX: Don't overwrite 600 points for unauthorized users
        const newPoints = freshUserData.points || 0;
        if (user && !user.accountAuthorized && sessionPoints >= 600 && newPoints < 600) {
          // Keep displaying 600 points - don't let backend's recalculated value drop it
          console.log('[SYNC] Keeping 600 points display (daily limit) instead of backend value:', newPoints);
          setSessionPoints(600);
          sessionInfoRef.current.sessionPoints = 600;
        } else {
          setSessionPoints(newPoints);
          sessionInfoRef.current.sessionPoints = newPoints;
        }
        setBalance(parseFloat(freshUserData.balance) || 0);
        
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
    // CRITICAL: Clear points timer immediately to avoid duplicate points
    if (pointsIntervalRef.current) {
      console.log('[TIMER] Clearing points interval in endListeningSession');
      clearInterval(pointsIntervalRef.current);
      pointsIntervalRef.current = null;
    }
    
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
          // FIX: Don't overwrite 600 points for unauthorized users
          if (user && !user.accountAuthorized && sessionPoints >= 600 && result.updatedPoints < 600) {
            // Keep displaying 600 points - don't let backend's recalculated value drop it
            console.log('[SYNC] Keeping 600 points display (daily limit) instead of backend value:', result.updatedPoints);
            setSessionPoints(600);
            sessionInfoRef.current.sessionPoints = 600;
          } else {
            setSessionPoints(result.updatedPoints);
            sessionInfoRef.current.sessionPoints = result.updatedPoints;
          }
        }
        
        // Don't refresh points here - we already have the updated value
        
      } catch (error) {
        console.error('[SYNC] Failed to end listening session:', error);
        // Keep using current points even if end session fails
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
    // CRITICAL: Clear any existing points interval FIRST
    if (pointsIntervalRef.current) {
      console.log('[TIMER] Clearing existing points interval before creating new one');
      clearInterval(pointsIntervalRef.current);
      pointsIntervalRef.current = null;
    }
    
    let timeInterval: NodeJS.Timeout | null = null;
    let syncInterval: NodeJS.Timeout | null = null; // Auto-sync interval
    
    // Only start counting points when playing and NOT syncing
    if (isPlaying && playingRadioId !== null && !isSyncing) {
      console.log('[TIMER] Creating new points interval');
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
      
      // Start listening session in backend only if we don't have one
      if (!sessionInfoRef.current.sessionId) {
        api.startListening(playingRadioId.toString()).then((response) => {
          sessionInfoRef.current.sessionId = response.session.id;
          console.log('[SYNC] Session started:', response.session.id);
        }).catch((error) => {
          console.error('[SYNC] Failed to start listening session:', error);
          // Continue tracking locally even if backend fails
        });
      } else {
        console.log('[SYNC] Using existing session:', sessionInfoRef.current.sessionId);
      }
      
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
              // DO NOT update baseline - keep it as the initial session value
              // Just update the current points display
              // FIX: Don't overwrite 600 points for unauthorized users
              if (user && !user.accountAuthorized && sessionPoints >= 600 && result.updatedPoints < 600) {
                // Keep displaying 600 points - don't let backend's recalculated value drop it
                console.log('[POINT-SYNC] Keeping 600 points display (daily limit) instead of backend value:', result.updatedPoints);
                sessionInfoRef.current.sessionPoints = 600;
              } else {
                sessionInfoRef.current.sessionPoints = result.updatedPoints;
              }
            }
          } catch (error) {
            console.error('[POINT-SYNC] Failed to save point:', error);
          }
        }
      };
      
      // Public function to sync current points before critical operations  
      const syncCurrentPoints = async (): Promise<void> => {
        if (!sessionInfoRef.current.sessionId || !sessionInfoRef.current.sessionStartTime) {
          console.log('[SYNC-POINTS] No active session, skipping sync');
          return;
        }
        
        const duration = Math.floor((Date.now() - sessionInfoRef.current.sessionStartTime) / 1000);
        const currentPoints = sessionInfoRef.current.sessionPoints;
        const baselinePoints = sessionInfoRef.current.baselinePoints;
        const pointsEarnedThisSession = Math.max(0, currentPoints - baselinePoints);
        
        console.log('[SYNC-POINTS] Syncing points before critical operation:', {
          sessionId: sessionInfoRef.current.sessionId,
          duration,
          pointsEarned: pointsEarnedThisSession,
          currentPoints,
          timestamp: new Date().toISOString()
        });
        
        try {
          const result = await api.updateListeningSession({
            sessionId: sessionInfoRef.current.sessionId,
            duration,
            pointsEarned: pointsEarnedThisSession
          });
          
          console.log('[SYNC-POINTS] Points synced successfully:', {
            updatedPoints: result.updatedPoints,
            timestamp: new Date().toISOString()
          });
          
          if (result && result.updatedPoints !== undefined) {
            // FIX: Don't overwrite 600 points for unauthorized users
            if (user && !user.accountAuthorized && sessionPoints >= 600 && result.updatedPoints < 600) {
              // Keep displaying 600 points - don't let backend's recalculated value drop it
              console.log('[SYNC-POINTS] Keeping 600 points display (daily limit) instead of backend value:', result.updatedPoints);
              setSessionPoints(600);
              sessionInfoRef.current.sessionPoints = 600;
            } else {
              setSessionPoints(result.updatedPoints);
              sessionInfoRef.current.sessionPoints = result.updatedPoints;
            }
          }
          
          return;
        } catch (error) {
          console.error('[SYNC-POINTS] Failed to sync points:', error);
          throw error; // Re-throw to let caller handle the error
        }
      };
      
      // Make syncCurrentPoints available globally for critical operations
      (window as any).syncCurrentPoints = syncCurrentPoints;
      
      // Increment points by 1 at calculated intervals
      pointsIntervalRef.current = setInterval(() => {
        // Check if user has reached daily limit (600 points) without authorization
        if (user && !user.accountAuthorized && sessionPoints >= 600) {
          console.log('[POINTS] Daily limit reached (600 points) - blocking point accumulation');
          // Don't increment points - user has reached the daily limit
          return;
        }
        
        setSessionPoints((prev) => {
          // Double-check inside the setter to prevent race conditions
          if (user && !user.accountAuthorized && prev >= 600) {
            console.log('[POINTS] Daily limit reached (600 points) - blocking point accumulation');
            return prev; // Don't increment
          }
          
          const newPoints = prev + 1; // Always increment by 1
          sessionInfoRef.current.sessionPoints = newPoints;
          // Save immediately after each point gained
          savePointsImmediately();
          return newPoints;
        });
      }, intervalMs);
      console.log('[TIMER] Points interval created with interval:', intervalMs, 'ms');
      
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
              // FIX: Don't overwrite 600 points for unauthorized users
              if (user && !user.accountAuthorized && sessionPoints >= 600 && result.updatedPoints < 600) {
                // Keep displaying 600 points - don't let backend's recalculated value drop it
                console.log('[AUTO-SYNC] Keeping 600 points display (daily limit) instead of backend value:', result.updatedPoints);
                setSessionPoints(600);
                sessionInfoRef.current.sessionPoints = 600;
              } else {
                setSessionPoints(result.updatedPoints);
                sessionInfoRef.current.sessionPoints = result.updatedPoints;
              }
              // DO NOT update baseline - it should remain the initial value from session start
              // This ensures the server always receives the total points earned in this session
            }
          } catch (error) {
            console.error('[AUTO-SYNC] Failed to save points:', error);
            // Continue tracking locally even if sync fails
          }
        }
      }, 3000); // Every 3 seconds
      
    } else {
      // Radio not playing - reset sessionInfoRef but keep current points
      console.log('[TIMER] Radio not playing, resetting sessionInfoRef');
      setListeningStartTime(null);
      
      // Reset sessionInfoRef when not playing, but maintain current points
      sessionInfoRef.current = {
        sessionId: null,
        sessionStartTime: 0,
        sessionPoints: sessionPoints, // Keep current points
        baselinePoints: 0
      };
    }
    
    return () => {
      // CRITICAL: Clean up ALL timers properly
      console.log('[TIMER] Cleanup: Clearing all intervals');
      
      if (pointsIntervalRef.current) {
        console.log('[TIMER] Cleanup: Clearing points interval');
        clearInterval(pointsIntervalRef.current);
        pointsIntervalRef.current = null;
      }
      
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [isPlaying, playingRadioId, isSyncing, endListeningSession, sessionPoints, user]); // Add sessionPoints for sessionInfoRef reset and user for authorization check

  const playingRadio = radios.find(r => r.id === playingRadioId);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "radio") {
      setLocation("/dashboard");
    } else if (tab === "resgatar") {
      setLocation("/resgatar");
    } else if (tab === "perfil") {
      setLocation("/perfil");
    } else if (tab === "chat") {
      setLocation("/chat");
    }
  };
  
  // Handle user manually stopping the radio
  const handleStopRadio = () => {
    if (isPlaying) {
      setIsPlaying(false);
      // End the session when user manually stops the radio
      if (sessionInfoRef.current.sessionId) {
        endListeningSession();
      }
    } else {
      setIsPlaying(true);
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
    userName,
    setUserName,
    refreshPoints,
    isRefreshingPoints
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatProvider>
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
                <DashboardComp {...playerProps} totalListeningTime={totalListeningTime} navigationTrigger={navigationTrigger} />
              </Route>
              <Route path="/resgatar">
                <Resgatar {...playerProps} />
              </Route>
              <Route path="/perfil">
                <Perfil 
                  userName={userName} 
                  sessionPoints={sessionPoints} 
                  balance={balance}
                  totalListeningTime={totalListeningTime}
                  memberSince={memberSince}
                />
              </Route>
              <Route path="/chat">
                <Chat />
              </Route>
              <Route path="/account-authorization">
                <AccountAuthorization />
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
            {playingRadio && location !== "/account-authorization" && (
              <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-30" data-radio-player="true">
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
                        onClick={handleStopRadio}
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
            {(location === "/dashboard" || location === "/resgatar" || location === "/perfil" || location === "/chat") && (
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
                        <span className="text-xs font-medium">Saldo</span>
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

                    <div className="relative flex flex-col items-center gap-1">
                      {activeTab === "chat" && (
                        <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full"></div>
                      )}
                      <Button
                        variant="ghost"
                        className={`flex flex-col items-center gap-1 py-2 px-4 min-w-0 h-auto rounded-xl ${
                          activeTab === "chat"
                            ? "bg-green-100 text-green-700"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => handleTabChange("chat")}
                        data-testid="tab-chat"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-medium">Chat</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </nav>
            )}
            
            
            
          </div>
        </PlayerContext.Provider>
        </ChatProvider>
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
    const protectedRoutes = ['/dashboard', '/resgatar', '/perfil', '/chat', '/account-authorization'];
    const publicRoutes = ['/', '/login', '/register'];
    
    // Adicionar um pequeno delay para evitar redirecionamento durante o registro
    const timer = setTimeout(() => {
      // Only redirect if not loading and trying to access protected route without authentication
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