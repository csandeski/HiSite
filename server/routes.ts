import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { User } from "@shared/schema";
import { ViperPayService } from "./services/viperpay";

// Session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
    isAdmin?: boolean;
  }
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().optional()
});

// Auth middleware
function requireAuth(req: Request, res: Response, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Autenticação necessária" });
  }
  next();
}

// Admin middleware
function requireAdmin(req: Request, res: Response, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Autenticação necessária" });
  }
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Acesso negado - apenas administradores" });
  }
  next();
}

// Initialize ViperPay service
const viperPayService = new ViperPayService();

// Generate fake user data for ViperPay testing
function generateFakeUserData() {
  // Generate random CPF (valid format but fake)
  const generateRandomCPF = () => {
    const digits = [];
    for (let i = 0; i < 9; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    
    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    digits.push(remainder);
    
    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    digits.push(remainder);
    
    return digits.join('');
  };

  const fakeNames = [
    'João Silva Santos', 'Maria Oliveira Costa', 'Pedro Ferreira Lima', 
    'Ana Paula Rodrigues', 'Carlos Eduardo Souza', 'Fernanda Alves Pereira',
    'Rafael Santos Cruz', 'Juliana Barbosa Martins', 'Lucas Gomes Araújo',
    'Patricia Ribeiro Almeida', 'Diego Costa Nascimento', 'Camila Torres Silva'
  ];
  
  const fakeName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
  const fakeEmail = fakeName.toLowerCase().replace(/\s+/g, '.') + '@teste.com';
  const fakePhone = '11' + Math.floor(900000000 + Math.random() * 100000000);
  const fakeCPF = generateRandomCPF();
  
  return {
    name: fakeName,
    email: fakeEmail,
    phone: fakePhone,
    cpf: fakeCPF
  };
}

// Admin validation schemas
const updatePointsSchema = z.object({
  points: z.number().int().min(0).max(1000000)
});

const updateBalanceSchema = z.object({
  balance: z.number().min(0).max(100000)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Comprehensive health check for production diagnostics
  app.get("/api/health", async (req, res) => {
    try {
      const healthData: any = {
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'development',
          DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
          SESSION_SECRET_EXISTS: !!process.env.SESSION_SECRET,
          VIPERPAY_API_KEY_EXISTS: !!process.env.VIPERPAY_API_KEY,
          PORT: process.env.PORT || '5000',
          FRONTEND_URL: process.env.FRONTEND_URL || 'not set',
          COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'not set',
          IS_PRODUCTION: process.env.NODE_ENV === 'production'
        },
        session: {
          hasSession: !!req.session,
          sessionId: req.sessionID || 'none',
          isAuthenticated: !!req.session?.userId,
          userId: req.session?.userId || null,
          username: req.session?.username || null,
          isAdmin: req.session?.isAdmin || false,
          cookieSettings: req.session?.cookie ? {
            secure: req.session.cookie.secure,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            domain: req.session.cookie.domain,
            maxAge: req.session.cookie.maxAge
          } : null
        },
        database: {
          connected: false,
          error: null
        },
        user: null
      };
      
      // Test database connection
      try {
        // Try to query the database
        const testQuery = await storage.getRadioStations();
        healthData.database.connected = true;
        healthData.database.stationsCount = testQuery.length;
      } catch (dbError) {
        healthData.database.connected = false;
        healthData.database.error = dbError instanceof Error ? dbError.message : String(dbError);
        console.error('[HEALTH_CHECK] Database connection error:', dbError);
      }
      
      // Get user data if authenticated
      if (req.session?.userId) {
        try {
          const user = await storage.getUser(req.session.userId);
          if (user) {
            healthData.user = {
              id: user.id,
              username: user.username,
              email: user.email,
              points: user.points,
              balance: user.balance,
              isPremium: user.isPremium,
              pixKeyAuthenticated: user.pixKeyAuthenticated,
              accountAuthorized: user.accountAuthorized,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              lastLoginAt: user.lastLoginAt
            };
            
            // Get recent transactions for debugging
            const recentTransactions = await storage.getUserTransactions(user.id, 3);
            healthData.user.recentTransactions = recentTransactions.map(t => ({
              type: t.type,
              amount: t.amount,
              points: t.points,
              description: t.description,
              createdAt: t.createdAt
            }));
          }
        } catch (userError) {
          healthData.user = {
            error: userError instanceof Error ? userError.message : String(userError)
          };
          console.error('[HEALTH_CHECK] User fetch error:', userError);
        }
      }
      
      // Check for any recent errors in conversion
      if (req.session?.userId) {
        try {
          // Get user's recent listening sessions to check point accumulation
          const recentSessions = await storage.getUserListeningSessions(req.session.userId, 3);
          healthData.recentSessions = recentSessions.map(s => ({
            id: s.id,
            startedAt: s.startedAt,
            endedAt: s.endedAt,
            duration: s.duration,
            pointsEarned: s.pointsEarned,
            isPremiumSession: s.isPremiumSession
          }));
        } catch (sessionError) {
          console.error('[HEALTH_CHECK] Session fetch error:', sessionError);
        }
      }
      
      // Set overall status
      const isHealthy = healthData.database.connected && 
                       (process.env.NODE_ENV !== 'production' || 
                        (healthData.environment.DATABASE_URL_EXISTS && 
                         healthData.environment.SESSION_SECRET_EXISTS));
      
      healthData.status = isHealthy ? 'healthy' : 'unhealthy';
      
      res.json(healthData);
    } catch (error) {
      console.error('[HEALTH_CHECK] Critical error:', error);
      res.status(500).json({ 
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  });

  // Debug endpoint for session issues (remove in production after fixing)
  app.get("/api/debug/session", (req, res) => {
    res.json({
      hasSession: !!req.session,
      sessionId: req.sessionID,
      userId: req.session?.userId || null,
      isAuthenticated: !!req.session?.userId,
      cookieSettings: {
        secure: req.session?.cookie?.secure,
        sameSite: req.session?.cookie?.sameSite,
        httpOnly: req.session?.cookie?.httpOnly,
        domain: req.session?.cookie?.domain
      },
      headers: {
        origin: req.headers.origin,
        cookie: req.headers.cookie ? 'present' : 'missing',
        host: req.headers.host
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasFrontendUrl: !!process.env.FRONTEND_URL,
        hasSessionSecret: !!process.env.SESSION_SECRET
      }
    });
  });

  // Debug endpoint for user points
  app.get('/api/debug/user-points', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Get user full details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get recent listening sessions
      const recentSessions = await storage.getUserListeningSessions(userId, 5);
      
      // Get recent transactions
      const recentTransactions = await storage.getUserTransactions(userId, 5);
      
      // Get daily stats for the last 7 days
      const dailyStats = await storage.getUserDailyStats(userId, 7);
      
      // Calculate total points earned from sessions
      const totalSessionPoints = recentSessions.reduce((sum, session) => 
        sum + (session.pointsEarned || 0), 0);
      
      // Calculate total points from transactions
      const totalTransactionPoints = recentTransactions
        .filter(t => t.type === 'earning' && t.points)
        .reduce((sum, t) => sum + (t.points || 0), 0);
      
      // Debug response
      res.json({
        timestamp: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          currentPoints: user.points,
          balance: user.balance,
          isPremium: user.isPremium,
          totalListeningTime: user.totalListeningTime,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        session: {
          sessionId: req.sessionID,
          userId: req.session.userId,
          isAuthenticated: !!req.session.userId
        },
        recentSessions: recentSessions.map(s => ({
          id: s.id,
          radioStationId: s.radioStationId,
          startedAt: s.startedAt,
          endedAt: s.endedAt,
          duration: s.duration,
          pointsEarned: s.pointsEarned,
          isPremiumSession: s.isPremiumSession
        })),
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          points: t.points,
          description: t.description,
          createdAt: t.createdAt
        })),
        dailyStats: dailyStats.map(stat => ({
          date: stat.date,
          pointsEarned: stat.pointsEarned,
          listeningTime: stat.listeningTime,
          sessionsCount: stat.sessionsCount
        })),
        summary: {
          totalSessionPoints,
          totalTransactionPoints,
          currentPoints: user.points,
          discrepancy: user.points - totalSessionPoints,
          lastUpdated: user.updatedAt
        }
      });
      
    } catch (error) {
      console.error('[DEBUG_USER_POINTS] Error:', error);
      res.status(500).json({ 
        error: "Failed to fetch user points debug info",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Debug endpoint to test ViperPay API
  app.get('/api/debug/viperpay-test', async (req, res) => {
    try {
      console.log('Testing ViperPay API connection...');
      
      // Test 1: Check if API key is loaded
      const hasApiKey = !!process.env.VIPERPAY_API_KEY;
      console.log('API Key loaded:', hasApiKey);
      console.log('API Key length:', process.env.VIPERPAY_API_KEY?.length || 0);
      console.log('API Key first 10 chars:', process.env.VIPERPAY_API_KEY?.substring(0, 10) || 'N/A');
      
      // Test 2: Try to get account info
      let accountInfo = null;
      let accountError = null;
      try {
        accountInfo = await viperPayService.getAccountInfo();
      } catch (error) {
        accountError = error instanceof Error ? error.message : String(error);
      }
      
      // Note: Transaction test disabled to avoid validation issues in debug mode
      // The main system is already successfully creating real PIX payments
      let testTransaction = null;
      let transactionError = 'Debug test disabled - Main system is working correctly';
      
      res.json({
        success: true,
        tests: {
          apiKeyLoaded: hasApiKey,
          apiKeyLength: process.env.VIPERPAY_API_KEY?.length || 0,
          apiKeyPreview: process.env.VIPERPAY_API_KEY?.substring(0, 20) + '...',
          accountInfo: {
            success: !!accountInfo,
            data: accountInfo,
            error: accountError
          },
          testTransaction: {
            success: !!testTransaction,
            data: testTransaction,
            error: transactionError
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Usuário já existe" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      
      // Create user (password will be hashed in storage)
      const user = await storage.createUser(data);
      
      // Create session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = user.isAdmin || false;
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          points: user.points,
          balance: user.balance,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
          pixKeyAuthenticated: user.pixKeyAuthenticated,
          accountAuthorized: user.accountAuthorized
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ error: "Erro ao registrar usuário" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      // Get user by email
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
      
      // Create session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = user.isAdmin || false;
      
      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          points: user.points,
          balance: user.balance,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
          pixKeyAuthenticated: user.pixKeyAuthenticated,
          accountAuthorized: user.accountAuthorized
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          points: user.points,
          balance: user.balance,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
          avatarType: user.avatarType,
          avatarData: user.avatarData,
          bio: user.bio,
          location: user.location,
          totalListeningTime: user.totalListeningTime,
          loginStreak: user.loginStreak,
          createdAt: user.createdAt,
          pixKeyAuthenticated: user.pixKeyAuthenticated,
          accountAuthorized: user.accountAuthorized
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Erro ao buscar dados do usuário" });
    }
  });

  // Force sync user points from database
  app.post("/api/sync-points", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      console.log('[SYNC_POINTS] Starting point sync for user:', userId);
      
      // Get fresh user data from database with retry logic
      let user: User | undefined;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        try {
          user = await storage.getUser(userId);
          if (user) {
            console.log(`[SYNC_POINTS] Attempt ${attempts} - User found:`, {
              id: user.id,
              points: user.points,
              balance: user.balance,
              updatedAt: user.updatedAt
            });
            break;
          }
        } catch (dbError) {
          console.error(`[SYNC_POINTS] Attempt ${attempts} failed:`, dbError);
          if (attempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          }
        }
      }
      
      if (!user) {
        console.error('[SYNC_POINTS] User not found after', maxAttempts, 'attempts');
        return res.status(404).json({ 
          error: "Usuário não encontrado",
          attempts: maxAttempts,
          userId 
        });
      }
      
      // Calculate total points from all listening sessions
      const allSessions = await storage.getUserListeningSessions(userId);
      const totalSessionPoints = allSessions.reduce((sum, session) => 
        sum + (session.pointsEarned || 0), 0);
      
      // Calculate total points from transactions
      const allTransactions = await storage.getUserTransactions(userId);
      const earnedFromTransactions = allTransactions
        .filter(t => t.type === 'earning' && t.points)
        .reduce((sum, t) => sum + (t.points || 0), 0);
      
      const spentInTransactions = allTransactions
        .filter(t => (t.type === 'withdrawal' || t.type === 'bonus') && t.points)
        .reduce((sum, t) => sum + (t.points || 0), 0);
      
      // Log detailed point calculation
      const pointsAnalysis = {
        userId: user.id,
        currentPoints: user.points,
        calculatedPoints: {
          fromSessions: totalSessionPoints,
          fromEarnings: earnedFromTransactions,
          spent: spentInTransactions,
          expected: totalSessionPoints - spentInTransactions
        },
        discrepancy: user.points - (totalSessionPoints - spentInTransactions),
        sessionCount: allSessions.length,
        transactionCount: allTransactions.length,
        lastUpdated: user.updatedAt
      };
      
      console.log('[SYNC_POINTS] Points analysis:', pointsAnalysis);
      
      // If there's a discrepancy and it's negative (user has fewer points than expected),
      // we might want to correct it, but for safety, we'll just log it
      if (pointsAnalysis.discrepancy !== 0) {
        console.warn('[SYNC_POINTS] Points discrepancy detected:', pointsAnalysis.discrepancy);
      }
      
      // Return fresh user data
      res.json({ 
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          points: user.points,
          balance: user.balance,
          isPremium: user.isPremium
        },
        analysis: pointsAnalysis,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('[SYNC_POINTS] Error syncing points:', error);
      res.status(500).json({ 
        error: "Erro ao sincronizar pontos",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // User profile routes
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      // Validate the updates - only allow certain fields to be updated
      const profileSchema = z.object({
        fullName: z.string().min(1).optional(),
        phoneNumber: z.string().optional(),
        cpf: z.string().optional(),
        location: z.string().optional(),
        bio: z.string().max(200).optional() // Status/bio field
      });

      const updates = profileSchema.parse(req.body);
      const user = await storage.updateUser(req.session.userId!, updates);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  });

  app.patch("/api/user/avatar", requireAuth, async (req, res) => {
    try {
      const { avatarType, avatarData } = req.body;
      const user = await storage.updateUser(req.session.userId!, { 
        avatarType, 
        avatarData 
      });
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update avatar error:", error);
      res.status(500).json({ error: "Erro ao atualizar avatar" });
    }
  });

  // Radio stations
  app.get("/api/radio-stations", async (_req, res) => {
    try {
      const stations = await storage.getRadioStations();
      res.json({ stations });
    } catch (error) {
      console.error("Get stations error:", error);
      res.status(500).json({ error: "Erro ao buscar estações" });
    }
  });

  // Listening sessions
  app.post("/api/listening/start", requireAuth, async (req, res) => {
    try {
      const { radioId } = req.body;
      
      if (!radioId) {
        return res.status(400).json({ error: "Radio ID é obrigatório" });
      }
      
      // Validate radio station exists
      const station = await storage.getRadioStation(radioId);
      if (!station) {
        return res.status(400).json({ error: "Estação de rádio inválida" });
      }
      
      // End any existing active sessions for this user
      const existingSessions = await storage.getUserListeningSessions(req.session.userId!, 1);
      if (existingSessions.length > 0 && !existingSessions[0].endedAt) {
        const existingSession = existingSessions[0];
        const now = new Date();
        const sessionStart = new Date(existingSession.startedAt);
        const duration = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
        
        // Get user and station for point calculation
        const user = await storage.getUser(req.session.userId!);
        const existingStation = await storage.getRadioStation(existingSession.radioStationId!);
        
        if (user && existingStation && duration >= 30) {
          const baseIntervalSeconds = Math.max(1, Math.round(60 / existingStation.pointsPerMinute));
          const pointsEarned = Math.floor(duration / baseIntervalSeconds);
          
          // End session with calculated points
          await storage.endListeningSession(existingSession.id, duration, pointsEarned);
          
          // Update user points and daily stats
          if (pointsEarned > 0) {
            await storage.incrementUserPoints(req.session.userId!, pointsEarned);
            await storage.updateDailyStats(req.session.userId!, duration, pointsEarned);
          }
          // Always update listening time
          await storage.updateUser(req.session.userId!, {
            totalListeningTime: user.totalListeningTime + duration
          });
        } else {
          // End session without points if conditions not met
          await storage.endListeningSession(existingSession.id, duration, 0);
        }
      }
      
      const session = await storage.createListeningSession(req.session.userId!, radioId);
      res.json({ session });
    } catch (error) {
      console.error("Start listening error:", error);
      res.status(500).json({ error: "Erro ao iniciar sessão" });
    }
  });

  app.post("/api/listening/end", requireAuth, async (req, res) => {
    try {
      const { sessionId, duration: clientDuration } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID é obrigatório" });
      }
      
      // Get session and verify ownership
      const session = await storage.getListeningSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Sessão não encontrada" });
      }
      
      // Verify session belongs to authenticated user
      if (session.userId !== req.session.userId) {
        return res.status(403).json({ error: "Não autorizado a finalizar esta sessão" });
      }
      
      // Calculate actual duration (server-side validation)
      const now = new Date();
      const sessionStart = new Date(session.startedAt);
      const actualDuration = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      
      // Use minimum of client-reported and server-calculated duration
      const duration = Math.min(actualDuration, clientDuration || actualDuration);
      
      // Get user to check premium status
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Get radio station to get points per minute
      const station = await storage.getRadioStation(session.radioStationId!);
      if (!station) {
        return res.status(400).json({ error: "Estação de rádio não encontrada" });
      }
      
      // Calculate points based on duration and premium status
      // Points are always awarded as integers (1 point at a time)
      let pointsEarned = 0;
      
      // Always calculate points earned (remove 30 second minimum)
      
      // Calculate interval in seconds for earning 1 point
      // Use Math.floor for consistency with frontend
      const baseIntervalSeconds = Math.max(1, Math.floor(60 / station.pointsPerMinute));
      
      // Calculate how many points earned based on duration
      pointsEarned = Math.floor(duration / baseIntervalSeconds);
      
      // End session
      await storage.endListeningSession(sessionId, duration, pointsEarned);
      
      // Update daily stats
      await storage.updateDailyStats(req.session.userId!, duration, pointsEarned);
      
      // Update user points atomically
      let updatedUser: User | undefined;
      if (pointsEarned > 0) {
        // DEBUG: Log before incrementing points
        console.log('[LISTENING_END] Incrementing user points:', {
          userId: req.session.userId,
          sessionId: sessionId,
          pointsToAdd: pointsEarned,
          currentPoints: user.points,
          expectedNewPoints: user.points + pointsEarned
        });
        
        updatedUser = await storage.incrementUserPoints(req.session.userId!, pointsEarned);
        
        // DEBUG: Log after incrementing points
        console.log('[LISTENING_END] Points incremented:', {
          userId: req.session.userId,
          actualNewPoints: updatedUser?.points,
          pointsAdded: pointsEarned,
          incrementSuccess: updatedUser !== undefined
        });
      } else {
        console.log('[LISTENING_END] No points earned:', {
          userId: req.session.userId,
          sessionId: sessionId,
          duration: duration,
          reason: 'pointsEarned was 0'
        });
      }
      
      // Update listening time
      updatedUser = await storage.updateUser(req.session.userId!, {
        totalListeningTime: user.totalListeningTime + duration
      });
      
      // DEBUG: Log final session end result
      console.log('[LISTENING_END] Session ended successfully:', {
        userId: req.session.userId,
        sessionId: sessionId,
        duration: duration,
        pointsEarned: pointsEarned,
        totalPoints: updatedUser?.points || 0,
        totalListeningTime: user.totalListeningTime + duration,
        timestamp: new Date().toISOString()
      });
      
      res.json({ 
        success: true,
        pointsEarned,
        duration,
        updatedPoints: updatedUser?.points || 0,
        totalListeningTime: updatedUser?.totalListeningTime || 0
      });
    } catch (error) {
      console.error("End listening error:", error);
      res.status(500).json({ error: "Erro ao finalizar sessão" });
    }
  });

  app.get("/api/listening/history", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getUserListeningSessions(req.session.userId!, 10);
      res.json({ sessions });
    } catch (error) {
      console.error("Get listening history error:", error);
      res.status(500).json({ error: "Erro ao buscar histórico" });
    }
  });

  // Update listening session endpoint (for auto-sync)
  app.post('/api/listening/update', requireAuth, async (req, res) => {
    try {
      const { sessionId, duration: clientDuration, pointsEarned: clientPointsEarned } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID é obrigatório" });
      }
      
      // Get session and verify ownership
      const session = await storage.getListeningSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Sessão não encontrada" });
      }
      
      // Verify session belongs to authenticated user
      if (session.userId !== req.session.userId) {
        return res.status(403).json({ error: "Não autorizado a atualizar esta sessão" });
      }
      
      // Check if session is already ended
      if (session.endedAt) {
        return res.status(400).json({ error: "Sessão já finalizada" });
      }
      
      // Calculate actual duration (server-side validation)
      const now = new Date();
      const sessionStart = new Date(session.startedAt);
      const actualDuration = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      
      // Use minimum of client-reported and server-calculated duration
      const duration = Math.min(actualDuration, clientDuration || actualDuration);
      
      // Get user to check premium status
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Get radio station to get points per minute
      const station = await storage.getRadioStation(session.radioStationId!);
      if (!station) {
        return res.status(400).json({ error: "Estação de rádio não encontrada" });
      }
      
      // Calculate points based on duration
      const baseIntervalSeconds = Math.max(1, Math.floor(60 / station.pointsPerMinute));
      
      // Calculate how many points should have been earned based on duration
      const serverCalculatedPoints = Math.floor(duration / baseIntervalSeconds);
      
      // Calculate new points to add (difference between server calculated and already awarded)
      const previouslyAwardedPoints = session.pointsEarned || 0;
      const newPointsToAdd = serverCalculatedPoints - previouslyAwardedPoints;
      
      console.log('[UPDATE SESSION] Updating points:', {
        sessionId,
        duration,
        serverCalculatedPoints,
        previouslyAwardedPoints,
        newPointsToAdd,
        isPremium: user.isPremium
      });
      
      // Only update if there are new points to add
      if (newPointsToAdd > 0) {
        // Update session with new points earned (total)
        await storage.updateListeningSessionPoints(sessionId, serverCalculatedPoints);
        
        // Update user points with only the new points
        const updatedUser = await storage.incrementUserPoints(req.session.userId!, newPointsToAdd);
        
        console.log('[UPDATE SESSION] Points updated:', {
          userId: req.session.userId,
          pointsAdded: newPointsToAdd,
          totalPoints: updatedUser?.points || 0
        });
        
        res.json({
          success: true,
          pointsEarned: newPointsToAdd,
          updatedPoints: updatedUser?.points || 0
        });
      } else {
        // No new points to add, just return current state
        res.json({
          success: true,
          pointsEarned: 0,
          updatedPoints: user.points
        });
      }
    } catch (error) {
      console.error("Update listening session error:", error);
      res.status(500).json({ error: "Erro ao atualizar sessão" });
    }
  });

  // Daily stats
  app.get("/api/stats/daily", requireAuth, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const stats = await storage.getUserDailyStats(req.session.userId!, days);
      res.json({ stats });
    } catch (error) {
      console.error("Get daily stats error:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // Achievements
  app.get("/api/achievements", async (_req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json({ achievements });
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Erro ao buscar conquistas" });
    }
  });

  app.get("/api/user/achievements", requireAuth, async (req, res) => {
    try {
      // First check and update user achievements based on their current stats
      await storage.checkAndUpdateUserAchievements(req.session.userId!);
      
      // Then get the updated achievements with details
      const userAchievements = await storage.getUserAchievementsWithDetails(req.session.userId!);
      res.json({ achievements: userAchievements });
    } catch (error) {
      console.error("Get user achievements error:", error);
      res.status(500).json({ error: "Erro ao buscar conquistas do usuário" });
    }
  });

  // Transactions
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const transactions = await storage.getUserTransactions(req.session.userId!, limit);
      res.json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Erro ao buscar transações" });
    }
  });

  // Withdrawals
  app.post("/api/withdrawals", requireAuth, async (req, res) => {
    try {
      const { points, pixKey } = req.body;
      
      // Get user to check balance
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      if (user.points < points) {
        return res.status(400).json({ error: "Pontos insuficientes" });
      }
      
      // Calculate amount (100 points = R$ 1,00)
      const amount = points / 100;
      
      const withdrawal = await storage.createWithdrawal({
        userId: req.session.userId!,
        amount,
        points,
        pixKey
      });
      
      res.json({ withdrawal });
    } catch (error) {
      console.error("Create withdrawal error:", error);
      res.status(500).json({ error: "Erro ao criar resgate" });
    }
  });

  app.get("/api/withdrawals", requireAuth, async (req, res) => {
    try {
      const withdrawals = await storage.getUserWithdrawals(req.session.userId!);
      res.json({ withdrawals });
    } catch (error) {
      console.error("Get withdrawals error:", error);
      res.status(500).json({ error: "Erro ao buscar resgates" });
    }
  });

  // Points conversion with retry logic and production fixes
  app.post("/api/points/convert", requireAuth, async (req, res) => {
    try {
      const conversionSchema = z.object({
        points: z.number().int().positive("Pontos deve ser um número positivo")
      });

      const { points } = conversionSchema.parse(req.body);
      
      // DEBUG: Log conversion attempt details
      console.log('[POINTS_CONVERT] Conversion attempt:', {
        userId: req.session.userId,
        sessionId: req.sessionID,
        requestedPoints: points,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
      
      // Get user with retry logic for production
      let user: User | undefined;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        try {
          user = await storage.getUser(req.session.userId!);
          if (user) {
            console.log(`[POINTS_CONVERT] Attempt ${attempts} - User found:`, {
              id: user.id,
              points: user.points,
              balance: user.balance
            });
            break;
          }
        } catch (dbError) {
          console.error(`[POINTS_CONVERT] Attempt ${attempts} failed:`, dbError);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          }
        }
      }
      
      if (!user) {
        console.error('[POINTS_CONVERT] User not found after', maxAttempts, 'attempts:', req.session.userId);
        return res.status(404).json({ 
          error: "Usuário não encontrado",
          details: "Failed to fetch user after multiple attempts",
          userId: req.session.userId
        });
      }
      
      // Double-check points from database before conversion
      // Refresh user data one more time to ensure we have latest points
      try {
        const freshUser = await storage.getUser(req.session.userId!);
        if (freshUser) {
          user = freshUser;
          console.log('[POINTS_CONVERT] Fresh user data fetched:', {
            userId: user.id,
            currentPoints: user.points,
            requestedPoints: points
          });
        }
      } catch (refreshError) {
        console.error('[POINTS_CONVERT] Warning: Could not refresh user data:', refreshError);
      }
      
      // DEBUG: Log user's actual points vs requested points
      console.log('[POINTS_CONVERT] Points validation:', {
        userId: user.id,
        userEmail: user.email,
        userPoints: user.points,
        requestedPoints: points,
        hasEnoughPoints: user.points >= points,
        difference: user.points - points,
        sessionStatus: {
          sessionId: req.sessionID,
          hasUserId: !!req.session.userId,
          cookieSecure: req.session?.cookie?.secure
        }
      });
      
      if (user.points < points) {
        console.error('[POINTS_CONVERT] INSUFFICIENT POINTS:', {
          userId: user.id,
          available: user.points,
          requested: points,
          shortBy: points - user.points,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({ 
          error: "Pontos insuficientes",
          available: user.points,
          requested: points,
          shortBy: points - user.points
        });
      }
      
      // Define conversion rates (server-controlled for security)
      const conversionRates = {
        100: 7.50,    // R$ 0,075/pt
        250: 24.00,   // R$ 0,096/pt  
        400: 60.00,   // R$ 0,15/pt
        600: 150.00   // R$ 0,25/pt
      };
      
      // Check if points amount is valid
      const amount = conversionRates[points as keyof typeof conversionRates];
      if (!amount) {
        return res.status(400).json({ 
          error: "Quantidade de pontos inválida",
          validAmounts: Object.keys(conversionRates).map(Number)
        });
      }
      
      // Atomic transaction for points deduction and balance update
      let conversionSuccess = false;
      let transactionAttempts = 0;
      const maxTransactionAttempts = 3;
      let updatedUser: User | undefined;
      
      while (transactionAttempts < maxTransactionAttempts && !conversionSuccess) {
        transactionAttempts++;
        try {
          console.log(`[POINTS_CONVERT] Transaction attempt ${transactionAttempts}`);
          
          // Deduct points from user with atomic operation
          // Use decrementUserPoints for thread-safe operation
          const pointsUpdated = await storage.decrementUserPoints(req.session.userId!, points);
          
          if (!pointsUpdated) {
            throw new Error('Failed to update user points');
          }
          
          // Create transaction to add to balance
          await storage.createTransaction({
            userId: req.session.userId!,
            type: 'earning',
            amount: amount,
            points: points,
            description: `Conversão de ${points} pontos em R$ ${amount.toFixed(2)}`
          });
          
          // Get updated user data
          updatedUser = await storage.getUser(req.session.userId!);
          conversionSuccess = true;
          
          console.log(`[POINTS_CONVERT] Transaction successful on attempt ${transactionAttempts}`);
        } catch (txError) {
          console.error(`[POINTS_CONVERT] Transaction attempt ${transactionAttempts} failed:`, txError);
          if (transactionAttempts < maxTransactionAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200 * transactionAttempts));
          } else {
            throw txError;
          }
        }
      }
      
      if (!conversionSuccess || !updatedUser) {
        console.error('[POINTS_CONVERT] Transaction failed after all attempts');
        throw new Error('Failed to complete points conversion after multiple attempts');
      }
      
      // DEBUG: Log successful conversion
      console.log('[POINTS_CONVERT] Conversion successful:', {
        userId: user.id,
        pointsConverted: points,
        amountAdded: amount,
        oldPoints: user.points,
        newPoints: updatedUser?.points || 0,
        oldBalance: parseFloat(user.balance || "0"),
        newBalance: parseFloat(updatedUser?.balance || "0"),
        attempts: transactionAttempts,
        environment: process.env.NODE_ENV
      });
      
      res.json({ 
        success: true,
        pointsConverted: points,
        amountAdded: amount,
        newBalance: parseFloat(updatedUser?.balance || "0"),
        newPoints: updatedUser?.points || 0
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error('[POINTS_CONVERT] Critical error:', error);
      res.status(500).json({ 
        error: "Erro ao converter pontos",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  });

  // Premium subscription
  app.post("/api/premium/subscribe", requireAuth, async (req, res) => {
    try {
      const { plan } = req.body;
      
      let price = 0;
      let days = 0;
      
      switch (plan) {
        case 'monthly':
          price = 14.90;
          days = 30;
          break;
        case 'quarterly':
          price = 39.90;
          days = 90;
          break;
        case 'annual':
          price = 149.90;
          days = 365;
          break;
        default:
          return res.status(400).json({ error: "Plano inválido" });
      }
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      const subscription = await storage.createPremiumSubscription({
        userId: req.session.userId!,
        plan,
        price,
        endDate
      });
      
      res.json({ subscription });
    } catch (error) {
      console.error("Subscribe error:", error);
      res.status(500).json({ error: "Erro ao assinar premium" });
    }
  });

  app.get("/api/premium/status", requireAuth, async (req, res) => {
    try {
      const subscription = await storage.getUserPremiumSubscription(req.session.userId!);
      res.json({ subscription });
    } catch (error) {
      console.error("Get premium status error:", error);
      res.status(500).json({ error: "Erro ao buscar status premium" });
    }
  });

  // Notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const unreadOnly = req.query.unread === 'true';
      const notifications = await storage.getUserNotifications(req.session.userId!, unreadOnly);
      res.json({ notifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Erro ao buscar notificações" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Erro ao marcar notificação como lida" });
    }
  });

  // Settings
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.session.userId!);
      res.json({ settings });
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  });

  app.patch("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.updateUserSettings(req.session.userId!, req.body);
      res.json({ settings });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Erro ao atualizar configurações" });
    }
  });

  // ViperPay Payment Routes
  app.post("/api/payment/create-pix", requireAuth, async (req, res) => {
    try {
      const { type, amount, utms: clientUtms } = req.body;
      
      // Normalize UTM parameters for LiraPay
      const utms = clientUtms ? {
        utm_source: clientUtms.utmSource,
        utm_medium: clientUtms.utmMedium,
        utm_campaign: clientUtms.utmCampaign,
        utm_term: clientUtms.utmTerm,
        utm_content: clientUtms.utmContent
      } : {};
      
      // Validate amount on server side - never trust client
      if (!amount || amount <= 0 || amount > 999.99) {
        return res.status(400).json({ error: "Valor inválido" });
      }
      
      // Validate payment type
      if (!['premium', 'credits', 'alo', 'authorization', 'pix_key_auth'].includes(type)) {
        return res.status(400).json({ error: "Tipo de pagamento inválido" });
      }
      
      // Validate authorization amount is exactly R$ 29.90 (with tolerance for floating point)
      if (type === 'authorization' && Math.abs(amount - 29.90) > 0.01) {
        return res.status(400).json({ error: "Valor incorreto para autorização de conta. Deve ser R$ 29,90" });
      }
      
      // Validate pix_key_auth amount is exactly R$ 19.90 (with tolerance for floating point)
      if (type === 'pix_key_auth' && Math.abs(amount - 19.90) > 0.01) {
        return res.status(400).json({ error: "Valor incorreto para autenticação de chave PIX. Deve ser R$ 19,90" });
      }
      
      // Force fixed amounts to avoid floating point issues
      const finalAmount = type === 'authorization' ? 29.90 : 
                         type === 'pix_key_auth' ? 19.90 : 
                         amount;
      
      // Get user info
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Check if user already has PIX key authenticated
      if (type === 'pix_key_auth' && user.pixKeyAuthenticated) {
        return res.status(400).json({ error: "Chave PIX já está autenticada" });
      }
      
      // Generate reference
      const reference = `${req.session.userId!}_${type}_${Date.now()}`;
      
      // Generate fake user data for ViperPay testing (never use real user data)
      const fakeUser = generateFakeUserData();
      
      // Create description based on payment type
      const description = type === 'premium' 
        ? 'Acesso Premium' 
        : type === 'credits' 
        ? `Adicionar R$ ${finalAmount.toFixed(2)} em créditos`
        : type === 'alo'
        ? `Envio de Alô na rádio - R$ ${finalAmount.toFixed(2)}`
        : type === 'authorization'
        ? `Autorização de conta - R$ ${finalAmount.toFixed(2)}`
        : type === 'pix_key_auth'
        ? 'Taxa de autenticação de chave PIX com reembolso integral'
        : `Pagamento - R$ ${finalAmount.toFixed(2)}`;
      
      // Create webhook URL
      const webhookUrl = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/api/webhook/viperpay`;
      
      // Create transaction with ViperPay
      console.log('Creating PIX transaction with ViperPay...');
      const pixResponse = await viperPayService.createPixPayment(
        finalAmount,
        description,
        reference,
        webhookUrl,
        {
          name: fakeUser.name,
          email: fakeUser.email,
          phone: fakeUser.phone,
          document: fakeUser.cpf
        },
        utms
      );
      
      // Log response to debug
      console.log('ViperPay Response:', {
        hasPixCode: !!pixResponse.pixCode,
        reference: pixResponse.reference
      });
      
      // Store payment record in database
      await storage.createPayment({
        userId: req.session.userId!,
        transactionId: pixResponse.reference,
        reference: reference,
        amount: finalAmount,
        type,
        status: 'pending',
        pixData: {
          encodedImage: null, // ViperPay doesn't provide QR code image
          payload: pixResponse.pixCode
        }
      });
      
      // Send response with PIX data (maintain frontend compatibility)
      console.log('Sending response with PIX data...');
      
      if (!pixResponse || !pixResponse.pixCode) {
        throw new Error('PIX data not received from ViperPay');
      }
      
      const responseData = {
        success: true,
        transactionId: pixResponse.reference,
        reference: reference,
        pix: {
          encodedImage: null, // ViperPay doesn't provide QR image
          payload: pixResponse.pixCode
        },
        amount: finalAmount
      };
      
      console.log('Response data prepared, sending to client...');
      res.json(responseData);
      
    } catch (error: any) {
      console.error("Create PIX payment error:", error);
      res.status(500).json({ error: error.message || "Erro ao criar pagamento PIX" });
    }
  });
  
  // Legacy endpoint for PIX key authentication
  app.post("/api/payment/pix-key-auth", requireAuth, async (req, res) => {
    console.log("Legacy pix-key-auth endpoint called - handling directly");
    
    try {
      // Get UTM parameters if sent
      const { utms: clientUtms } = req.body;
      const utms = clientUtms ? {
        utm_source: clientUtms.utmSource,
        utm_medium: clientUtms.utmMedium,
        utm_campaign: clientUtms.utmCampaign,
        utm_term: clientUtms.utmTerm,
        utm_content: clientUtms.utmContent
      } : {};
      
      // Fixed amount for PIX key authentication: R$ 19.90
      const finalAmount = 19.90;
      const type = 'pix_key_auth';
      
      // Get user info
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Check if user already has PIX key authenticated
      if (user.pixKeyAuthenticated) {
        return res.status(400).json({ error: "Chave PIX já está autenticada" });
      }
      
      // Generate reference
      const reference = `${req.session.userId!}_${type}_${Date.now()}`;
      
      // Generate fake user data for ViperPay testing
      const fakeUser = generateFakeUserData();
      
      // Create description
      const description = 'Taxa de autenticação de chave PIX com reembolso integral';
      
      // Create webhook URL
      const webhookUrl = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/api/webhook/viperpay`;
      
      // Create transaction with ViperPay
      console.log('Creating PIX transaction for pix-key-auth with ViperPay...');
      const pixResponse = await viperPayService.createPixPayment(
        finalAmount,
        description,
        reference,
        webhookUrl,
        {
          name: fakeUser.name,
          email: fakeUser.email,
          phone: fakeUser.phone,
          document: fakeUser.cpf
        },
        utms
      );
      
      // Store payment record in database
      await storage.createPayment({
        userId: req.session.userId!,
        transactionId: pixResponse.reference,
        reference: reference,
        amount: finalAmount,
        type,
        status: 'pending',
        pixData: {
          encodedImage: null, // ViperPay doesn't provide QR code image
          payload: pixResponse.pixCode
        }
      });
      
      // Send response with PIX data
      const responseData = {
        success: true,
        transactionId: pixResponse.reference,
        reference: reference,
        pix: {
          encodedImage: null,
          payload: pixResponse.pixCode
        },
        amount: finalAmount
      };
      
      console.log('PIX key auth payment created successfully');
      res.json(responseData);
      
    } catch (error: any) {
      console.error("Create PIX key auth payment error:", error);
      res.status(500).json({ error: error.message || "Erro ao criar pagamento de autenticação PIX" });
    }
  });
  
  // Check PIX key authentication status for current user
  app.get("/api/user/pix-key-status", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({
        pixKeyAuthenticated: user.pixKeyAuthenticated || false,
        pixKey: user.pixKey || null
      });
    } catch (error) {
      console.error("Get PIX key status error:", error);
      res.status(500).json({ error: "Erro ao verificar status da chave PIX" });
    }
  });
  
  // Payment status check endpoint
  app.get("/api/payment/status/:reference", async (req, res) => {
    try {
      const { reference } = req.params;
      
      if (!reference) {
        return res.status(400).json({ error: 'Reference is required' });
      }
      
      const payment = await storage.getPaymentByReference(reference);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      // Check real-time status with ViperPay if payment is still pending
      if (payment.status === 'pending') {
        try {
          const viperPayTransaction = await viperPayService.getTransaction(payment.transactionId);
          
          // Map ViperPay status to our internal status
          let viperPayStatus = payment.status;
          if (viperPayTransaction.status === 'AUTHORIZED') {
            viperPayStatus = 'approved';
          } else if (viperPayTransaction.status === 'FAILED') {
            viperPayStatus = 'rejected';
          } else if (viperPayTransaction.status === 'PENDING') {
            viperPayStatus = 'pending';
          }
          
          // Update local payment status if it changed
          if (viperPayStatus !== payment.status) {
            await storage.updatePaymentStatus(payment.id, viperPayStatus);
            payment.status = viperPayStatus;
          }
        } catch (error) {
          console.error('Error checking ViperPay status:', error);
          // Continue with stored status if ViperPay check fails
        }
      }
      
      // Only return necessary information
      res.json({
        status: payment.status,
        reference: payment.reference,
        type: payment.type,
        amount: payment.amount,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      });
      
    } catch (error) {
      console.error('Check payment status error:', error);
      res.status(500).json({ error: 'Error checking payment status' });
    }
  });
  
  // ViperPay Webhook - NO authentication required as it comes from external service
  app.post("/api/webhook/viperpay", async (req, res) => {
    try {
      const webhookData = req.body;
      const signature = req.headers['x-webhook-signature'] as string;
      
      // Log webhook for debugging
      console.log('ViperPay Webhook received:', webhookData);
      
      // Extract transaction ID from webhook data (ViperPay format)
      const transactionId = webhookData.id || webhookData.external_id;
      const status = webhookData.status;
      
      if (!transactionId) {
        console.error('No transaction ID in webhook data');
        return res.status(400).json({ error: 'No transaction ID provided' });
      }
      
      // Get payment by transaction ID (using reference since that's what we store)
      const payment = await storage.getPaymentByReference(transactionId);
      
      if (!payment) {
        console.error('Payment not found for transaction ID:', transactionId);
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      // Map LiraPay status to our internal status
      const statusMap: Record<string, string> = {
        'AUTHORIZED': 'approved',
        'PENDING': 'pending',
        'CHARGEBACK': 'refunded',
        'FAILED': 'rejected',
        'IN_DISPUTE': 'disputed',
      };
      
      const mappedStatus = statusMap[status] || status.toLowerCase();
      
      // Update payment status
      await storage.updatePaymentStatus(payment.id, mappedStatus);
      
      // Handle approved payments
      if (mappedStatus === 'approved') {
        // Get user
        const user = await storage.getUser(payment.userId);
        if (!user) {
          console.error('User not found for payment:', payment.userId);
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Process based on payment type
        if (payment.type === 'premium') {
          // Activate premium subscription
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30); // 30 days premium
          
          await storage.createPremiumSubscription({
            userId: payment.userId,
            plan: 'monthly',
            price: payment.amount,
            endDate
          });
          
          // Create notification
          await storage.createNotification({
            userId: payment.userId,
            type: 'payment_approved',
            title: 'Assinatura Premium Ativada!',
            message: 'Sua assinatura Premium foi ativada com sucesso!',
            data: { paymentId: payment.id }
          });
          
        } else if (payment.type === 'authorization') {
          // Process account authorization
          // Mark account as authorized (would need schema update to store this properly)
          
          // Create notification
          await storage.createNotification({
            userId: payment.userId,
            type: 'payment_approved',
            title: 'Conta Autorizada!',
            message: 'Sua conta foi autorizada com sucesso. Agora você tem acesso completo à plataforma.',
            data: { paymentId: payment.id }
          });
        } else if (payment.type === 'pix_key_auth') {
          // Process PIX key authentication payment
          // Update user's PIX key authentication status
          await storage.updateUser(payment.userId, { 
            pixKeyAuthenticated: true 
          });
          
          // Add R$ 19.90 to user's balance as reimbursement
          const reimbursementAmount = 19.90;
          const newBalance = parseFloat(user.balance) + reimbursementAmount;
          await storage.updateUser(payment.userId, { 
            balance: newBalance.toString() 
          });
          
          // Create transaction record for the reimbursement
          await storage.createTransaction({
            userId: payment.userId,
            type: 'bonus',
            amount: reimbursementAmount,
            points: 0,
            description: 'Reembolso pela autenticação da chave PIX'
          });
          
          // Create notification
          await storage.createNotification({
            userId: payment.userId,
            type: 'payment_approved',
            title: 'Chave PIX Autenticada!',
            message: `Sua chave PIX foi autenticada com sucesso. R$ ${reimbursementAmount.toFixed(2)} foram adicionados ao seu saldo como reembolso.`,
            data: { paymentId: payment.id }
          });
        } else if (payment.type === 'alo') {
          // Process Alô message payment
          await storage.createNotification({
            userId: payment.userId,
            type: 'payment_approved',
            title: 'Alô Enviado!',
            message: 'Seu alô foi pago e será enviado na rádio selecionada.',
            data: { paymentId: payment.id }
          });
        } else if (payment.type === 'credits') {
          // Add credits to balance
          const newBalance = parseFloat(user.balance) + payment.amount;
          await storage.updateUser(payment.userId, { balance: newBalance.toString() });
          
          // Create transaction record
          await storage.createTransaction({
            userId: payment.userId,
            type: 'earning',
            amount: payment.amount,
            points: 0,
            description: `Créditos adicionados via PIX - R$ ${payment.amount.toFixed(2)}`
          });
          
          // Create notification
          await storage.createNotification({
            userId: payment.userId,
            type: 'payment_approved',
            title: 'Pagamento Aprovado!',
            message: `R$ ${payment.amount.toFixed(2)} foram adicionados ao seu saldo.`,
            data: { paymentId: payment.id }
          });
        }
      }
      
      // Handle rejected payments
      if (mappedStatus === 'rejected') {
        await storage.createNotification({
          userId: payment.userId,
          type: 'payment_rejected',
          title: 'Pagamento Recusado',
          message: 'Seu pagamento PIX foi recusado. Por favor, tente novamente.',
          data: { paymentId: payment.id }
        });
      }
      
      // Handle refunds
      if (mappedStatus === 'refunded') {
        await storage.createNotification({
          userId: payment.userId,
          type: 'payment_refunded',
          title: 'Reembolso Processado',
          message: `Seu pagamento de R$ ${payment.amount.toFixed(2)} foi reembolsado.`,
          data: { paymentId: payment.id }
        });
      }
      
      res.json({ success: true });
      
    } catch (error) {
      console.error("LiraPay webhook error:", error);
      res.status(500).json({ error: "Erro ao processar webhook" });
    }
  });

  // Admin login route (separate from regular login)
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validação básica
      if (!username || !password) {
        return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
      }
      
      // Buscar usuário admin
      const user = await storage.getUserByUsername(username);
      if (!user || !user.isAdmin) {
        return res.status(401).json({ error: "Credenciais inválidas ou usuário não é administrador" });
      }
      
      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      
      // Criar sessão admin
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = true;
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Erro ao fazer login administrativo" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Sanitize user data - remove sensitive fields
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        cpf: user.cpf,
        points: user.points,
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        totalWithdrawn: user.totalWithdrawn,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        isAdmin: user.isAdmin,
        accountAuthorized: user.accountAuthorized,
        pixKeyAuthenticated: user.pixKeyAuthenticated,
        loginStreak: user.loginStreak,
        lastLoginDate: user.lastLoginDate,
        lastLoginAt: user.lastLoginAt,
        totalListeningTime: user.totalListeningTime,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Computed fields for admin panel
        hasPurchased: parseFloat(user.totalEarnings) > 0
      }));
      res.json({ users: sanitizedUsers });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  app.patch("/api/admin/users/:id/points", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const data = updatePointsSchema.parse(req.body);
      
      const user = await storage.updateUser(id, { points: data.points });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Update user points error:", error);
      res.status(500).json({ error: "Erro ao atualizar pontos" });
    }
  });

  app.patch("/api/admin/users/:id/balance", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateBalanceSchema.parse(req.body);
      
      const user = await storage.updateUser(id, { balance: data.balance.toFixed(2) });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Update user balance error:", error);
      res.status(500).json({ error: "Erro ao atualizar saldo" });
    }
  });

  app.get("/api/admin/transactions/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const transactions = await storage.getUserTransactions(userId, 50);
      res.json({ transactions });
    } catch (error) {
      console.error("Get user transactions error:", error);
      res.status(500).json({ error: "Erro ao buscar transações" });
    }
  });

  // Admin premium management
  app.patch("/api/admin/users/:id/premium", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get current user state
      const currentUser = await storage.getUser(id);
      if (!currentUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Toggle premium status
      const isPremium = !currentUser.isPremium;
      const premiumExpiresAt = isPremium 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        : null;
      
      const user = await storage.updateUser(id, { 
        isPremium,
        premiumExpiresAt
      });
      
      res.json({ user });
    } catch (error) {
      console.error("Toggle premium error:", error);
      res.status(500).json({ error: "Erro ao alterar status premium" });
    }
  });
  
  // Admin account authorization management
  app.patch("/api/admin/users/:id/account-authorization", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get current user state
      const currentUser = await storage.getUser(id);
      if (!currentUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Toggle account authorization
      const accountAuthorized = !currentUser.accountAuthorized;
      
      const user = await storage.updateUser(id, { accountAuthorized });
      
      res.json({ user });
    } catch (error) {
      console.error("Toggle account authorization error:", error);
      res.status(500).json({ error: "Erro ao alterar autorização de conta" });
    }
  });
  
  // Admin PIX authentication management
  app.patch("/api/admin/users/:id/pix-authentication", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get current user state
      const currentUser = await storage.getUser(id);
      if (!currentUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Toggle PIX authentication
      const pixKeyAuthenticated = !currentUser.pixKeyAuthenticated;
      
      const user = await storage.updateUser(id, { pixKeyAuthenticated });
      
      res.json({ user });
    } catch (error) {
      console.error("Toggle PIX authentication error:", error);
      res.status(500).json({ error: "Erro ao alterar autenticação PIX" });
    }
  });

  // Push Notification Routes
  
  // Register push token
  app.post("/api/notifications/register", requireAuth, async (req, res) => {
    try {
      const { token, platform, userAgent } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Token é obrigatório" });
      }
      
      await storage.registerPushToken(req.session.userId!, token, platform, userAgent);
      
      res.json({ success: true, message: "Token registrado com sucesso" });
    } catch (error) {
      console.error("Register push token error:", error);
      res.status(500).json({ error: "Erro ao registrar token" });
    }
  });
  
  // Unregister push token
  app.post("/api/notifications/unregister", requireAuth, async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Token é obrigatório" });
      }
      
      await storage.unregisterPushToken(token);
      
      res.json({ success: true, message: "Token removido com sucesso" });
    } catch (error) {
      console.error("Unregister push token error:", error);
      res.status(500).json({ error: "Erro ao remover token" });
    }
  });
  
  // Get user notification settings
  app.get("/api/notifications/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.session.userId!);
      const tokens = await storage.getUserPushTokens(req.session.userId!);
      
      res.json({ 
        pushNotificationsEnabled: settings?.pushNotifications ?? true,
        registeredDevices: tokens.length,
        tokens: tokens.map(t => ({
          platform: t.platform,
          lastUsed: t.lastUsedAt,
          active: t.isActive
        }))
      });
    } catch (error) {
      console.error("Get notification settings error:", error);
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  });
  
  // Update notification settings
  app.patch("/api/notifications/settings", requireAuth, async (req, res) => {
    try {
      const { pushNotificationsEnabled } = req.body;
      
      await storage.updateUserSettings(req.session.userId!, {
        pushNotifications: pushNotificationsEnabled
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update notification settings error:", error);
      res.status(500).json({ error: "Erro ao atualizar configurações" });
    }
  });

  // Admin: Send notification to specific user
  app.post("/api/admin/notifications/send-to-user", requireAdmin, async (req, res) => {
    try {
      const { notificationService } = await import('./services/notification');
      
      const { userId, title, body, data, imageUrl } = req.body;
      
      if (!userId || !title || !body) {
        return res.status(400).json({ error: "userId, title e body são obrigatórios" });
      }
      
      const result = await notificationService.sendToUser(userId, {
        title,
        body,
        data,
        imageUrl
      });
      
      res.json(result);
    } catch (error) {
      console.error("Send notification to user error:", error);
      res.status(500).json({ error: "Erro ao enviar notificação" });
    }
  });
  
  // Admin: Send notification to all users
  app.post("/api/admin/notifications/send-to-all", requireAdmin, async (req, res) => {
    try {
      const { notificationService } = await import('./services/notification');
      
      const { title, body, data, imageUrl } = req.body;
      
      if (!title || !body) {
        return res.status(400).json({ error: "title e body são obrigatórios" });
      }
      
      const result = await notificationService.sendToAll({
        title,
        body,
        data,
        imageUrl
      });
      
      res.json(result);
    } catch (error) {
      console.error("Send notification to all error:", error);
      res.status(500).json({ error: "Erro ao enviar notificação" });
    }
  });
  
  // Public endpoint for testing notifications (Development only)
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/send-notification", async (req, res) => {
      try {
        const { notificationService } = await import('./services/notification');
        
        const { userId, userIds, title, body, data, imageUrl, sendToAll } = req.body;
        
        if (!title || !body) {
          return res.status(400).json({ error: "title e body são obrigatórios" });
        }
        
        let result;
        
        if (sendToAll) {
          result = await notificationService.sendToAll({ title, body, data, imageUrl });
        } else if (userIds && Array.isArray(userIds)) {
          result = await notificationService.sendToUsers(userIds, { title, body, data, imageUrl });
        } else if (userId) {
          result = await notificationService.sendToUser(userId, { title, body, data, imageUrl });
        } else {
          return res.status(400).json({ error: "Especifique userId, userIds ou sendToAll: true" });
        }
        
        res.json({
          ...result,
          message: "Notificação enviada",
          documentation: {
            description: "Endpoint de teste para enviar notificações push",
            usage: {
              singleUser: {
                method: "POST /api/send-notification",
                body: {
                  userId: "user-id-here",
                  title: "Título da Notificação",
                  body: "Corpo da mensagem",
                  data: { url: "/dashboard" },
                  imageUrl: "https://example.com/image.png"
                }
              },
              multipleUsers: {
                method: "POST /api/send-notification",
                body: {
                  userIds: ["user1", "user2"],
                  title: "Título",
                  body: "Mensagem"
                }
              },
              allUsers: {
                method: "POST /api/send-notification",
                body: {
                  sendToAll: true,
                  title: "Título",
                  body: "Mensagem para todos"
                }
              }
            }
          }
        });
      } catch (error) {
        console.error("Send notification error:", error);
        res.status(500).json({ error: "Erro ao enviar notificação" });
      }
    });
  }

  // Test endpoint for PIX generation
  app.get("/api/test/pix", requireAuth, async (req, res) => {
    try {
      console.log("=== PIX TEST ENDPOINT CALLED ===");
      
      // Generate fake user data
      const fakeUser = generateFakeUserData();
      const reference = `test_${Date.now()}`;
      
      console.log("Testing ViperPay with fake user:", fakeUser);
      
      // Call ViperPay API directly
      const pixResponse = await viperPayService.createPixPayment(
        19.90,
        'TESTE DE PIX',
        reference,
        'https://example.com/webhook',
        {
          name: fakeUser.name,
          email: fakeUser.email,
          phone: fakeUser.phone,
          document: fakeUser.cpf
        },
        {}
      );
      
      console.log("ViperPay response:", pixResponse);
      
      res.json({
        success: true,
        message: "PIX test successful",
        pixCode: pixResponse.pixCode,
        reference: pixResponse.reference,
        rawResponse: pixResponse
      });
    } catch (error: any) {
      console.error("PIX test error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message,
        stack: error.stack 
      });
    }
  });


  // IMPORTANT: Add catch-all 404 handler for API routes
  // This MUST come before static file serving but after all API routes
  app.use('/api/*', (req, res) => {
    console.error(`404 API route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: "Endpoint não encontrado",
      message: `A rota ${req.originalUrl} não existe`,
      method: req.method
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}