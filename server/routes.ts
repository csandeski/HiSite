import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { User } from "@shared/schema";
import orinpay from "./services/orinpay";

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

// Generate fake user data for OrinPay testing
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
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
          const premiumMultiplier = user.isPremium ? 3 : 1;
          const baseIntervalSeconds = Math.max(1, Math.round(60 / existingStation.pointsPerMinute));
          const intervalWithPremium = Math.max(1, Math.round(baseIntervalSeconds / premiumMultiplier));
          const pointsEarned = Math.floor(duration / intervalWithPremium);
          
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
      const premiumMultiplier = user.isPremium ? 3 : 1;
      
      // Calculate interval in seconds for earning 1 point
      // Use Math.floor for consistency with frontend
      const baseIntervalSeconds = Math.max(1, Math.floor(60 / station.pointsPerMinute));
      const intervalWithPremium = Math.max(1, Math.floor(baseIntervalSeconds / premiumMultiplier));
      
      // Calculate how many points earned based on duration
      pointsEarned = Math.floor(duration / intervalWithPremium);
      
      // End session
      await storage.endListeningSession(sessionId, duration, pointsEarned);
      
      // Update daily stats
      await storage.updateDailyStats(req.session.userId!, duration, pointsEarned);
      
      // Update user points atomically
      let updatedUser: User | undefined;
      if (pointsEarned > 0) {
        updatedUser = await storage.incrementUserPoints(req.session.userId!, pointsEarned);
      }
      
      // Update listening time
      updatedUser = await storage.updateUser(req.session.userId!, {
        totalListeningTime: user.totalListeningTime + duration
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

  // Points conversion
  app.post("/api/points/convert", requireAuth, async (req, res) => {
    try {
      const conversionSchema = z.object({
        points: z.number().int().positive("Pontos deve ser um número positivo")
      });

      const { points } = conversionSchema.parse(req.body);
      
      // Get user to check points balance
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      if (user.points < points) {
        return res.status(400).json({ error: "Pontos insuficientes" });
      }
      
      // Define conversion rates (server-controlled for security)
      const conversionRates = {
        100: 7.50,   // R$ 0,075/pt
        300: 24.00,  // R$ 0,08/pt  
        600: 60.00,  // R$ 0,10/pt
        1200: 150.00 // R$ 0,125/pt
      };
      
      // Check if points amount is valid
      const amount = conversionRates[points as keyof typeof conversionRates];
      if (!amount) {
        return res.status(400).json({ 
          error: "Quantidade de pontos inválida",
          validAmounts: Object.keys(conversionRates).map(Number)
        });
      }
      
      // Deduct points from user
      await storage.updateUser(req.session.userId!, {
        points: user.points - points
      });
      
      // Create transaction to add to balance
      await storage.createTransaction({
        userId: req.session.userId!,
        type: 'earning',
        amount: amount,
        points: points,
        description: `Conversão de ${points} pontos em R$ ${amount.toFixed(2)}`
      });
      
      // Get updated user data
      const updatedUser = await storage.getUser(req.session.userId!);
      
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
      console.error("Convert points error:", error);
      res.status(500).json({ error: "Erro ao converter pontos" });
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

  // OrinPay Payment Routes
  app.post("/api/payment/create-pix", requireAuth, async (req, res) => {
    try {
      const { type, amount, utms: clientUtms } = req.body;
      
      // Normalize UTM parameters to snake_case as expected by OrinPay
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
      
      // Validate authorization amount is exactly R$ 29.99
      if (type === 'authorization' && amount !== 29.99) {
        return res.status(400).json({ error: "Valor incorreto para autorização de conta. Deve ser R$ 29,99" });
      }
      
      // Get user info
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Use the imported OrinPay service (already imported at top)
      
      // Validate amount
      const amountInCents = orinpay.reaisToCentavos(amount);
      if (!orinpay.validateAmount(amountInCents)) {
        return res.status(400).json({ error: "Valor inválido. Máximo permitido: R$ 999,99" });
      }
      
      // Generate reference
      const reference = orinpay.generateReference(req.session.userId!, type);
      
      // Generate fake user data for OrinPay testing (never use real user data)
      const fakeUser = generateFakeUserData();
      
      // Create PIX transaction
      const pixData = {
        paymentMethod: 'pix' as const,
        reference,
        customer: {
          name: fakeUser.name,
          email: fakeUser.email,
          phone: orinpay.formatPhone(fakeUser.phone),
          document: {
            number: orinpay.formatCPF(fakeUser.cpf),
            type: 'cpf' as const
          }
        },
        shipping: {
          fee: 0,
          address: {
            street: "Rua Virtual",
            streetNumber: "100",
            zipCode: "00000000",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            country: "Brasil",
            complement: ""
          }
        },
        items: [
          {
            title: 'Ebook Receitas Fitness',  // Always use this product name for OrinPay
            description: type === 'premium' 
              ? 'Acesso Premium com multiplicador 3x' 
              : type === 'credits' 
              ? `Adicionar R$ ${amount.toFixed(2)} em créditos`
              : type === 'alo'
              ? `Envio de Alô na rádio - R$ ${amount.toFixed(2)}`
              : `Autorização de conta - R$ ${amount.toFixed(2)}`,
            unitPrice: amountInCents,
            quantity: 1,
            tangible: false
          }
        ],
        isInfoProducts: true,
        utms: utms || {}
      };
      
      // Create transaction with OrinPay
      console.log('Creating PIX transaction with OrinPay...');
      const pixResponse = await orinpay.createPixTransaction(pixData);
      
      // Log response to debug QR Code issue
      console.log('OrinPay Response:', {
        hasQRCode: !!pixResponse.pix?.encodedImage,
        hasPayload: !!pixResponse.pix?.payload,
        reference: pixResponse.reference,
        status: pixResponse.status
      });
      
      // Store payment record in database
      await storage.createPayment({
        userId: req.session.userId!,
        transactionId: pixResponse.id.toString(),
        reference: pixResponse.reference,
        amount,
        type,
        status: 'pending',
        pixData: {
          encodedImage: pixResponse.pix.encodedImage,
          payload: pixResponse.pix.payload
        }
      });
      
      res.json({
        success: true,
        transactionId: pixResponse.id,
        reference: pixResponse.reference,
        pix: pixResponse.pix,
        amount
      });
      
    } catch (error: any) {
      console.error("Create PIX payment error:", error);
      res.status(500).json({ error: error.message || "Erro ao criar pagamento PIX" });
    }
  });
  
  // Dedicated PIX key authentication payment endpoint
  app.post("/api/payment/pix-key-auth", requireAuth, async (req, res) => {
    try {
      const { utms: clientUtms } = req.body;
      
      // Fixed amount for PIX key authentication
      const FIXED_AMOUNT = 19.90;
      const type = 'pix_key_auth';
      
      // Check if user already has PIX key authenticated
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      if (user.pixKeyAuthenticated) {
        return res.status(400).json({ error: "Chave PIX já está autenticada" });
      }
      
      // Normalize UTM parameters to snake_case as expected by OrinPay
      const utms = clientUtms ? {
        utm_source: clientUtms.utmSource,
        utm_medium: clientUtms.utmMedium,
        utm_campaign: clientUtms.utmCampaign,
        utm_term: clientUtms.utmTerm,
        utm_content: clientUtms.utmContent
      } : {};
      
      // Validate amount
      const amountInCents = orinpay.reaisToCentavos(FIXED_AMOUNT);
      if (!orinpay.validateAmount(amountInCents)) {
        return res.status(400).json({ error: "Erro na configuração do valor" });
      }
      
      // Generate reference
      const reference = orinpay.generateReference(req.session.userId!, type);
      
      // Generate fake user data for OrinPay testing (never use real user data)
      const fakeUser = generateFakeUserData();
      
      // Create PIX transaction
      const pixData = {
        paymentMethod: 'pix' as const,
        reference,
        customer: {
          name: fakeUser.name,
          email: fakeUser.email,
          phone: orinpay.formatPhone(fakeUser.phone),
          document: {
            number: orinpay.formatCPF(fakeUser.cpf),
            type: 'cpf' as const
          }
        },
        shipping: {
          fee: 0,
          address: {
            street: "Rua Virtual",
            streetNumber: "100",
            zipCode: "00000000",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            country: "Brasil",
            complement: ""
          }
        },
        items: [
          {
            title: 'Autenticação de Chave PIX',
            description: 'Taxa de autenticação de chave PIX com reembolso integral',
            unitPrice: amountInCents,
            quantity: 1,
            tangible: false
          }
        ],
        isInfoProducts: true,
        utms: utms
      };
      
      console.log('Creating PIX key authentication payment:', {
        userId: req.session.userId,
        amount: FIXED_AMOUNT,
        type: type,
        reference
      });
      
      // Call OrinPay API
      const pixResponse = await orinpay.createPixTransaction(pixData);
      
      console.log('PIX key auth payment created successfully:', {
        transactionId: pixResponse.id,
        hasEncodedImage: !!pixResponse.pix?.encodedImage,
        hasPayload: !!pixResponse.pix?.payload,
        reference: pixResponse.reference,
        status: pixResponse.status
      });
      
      // Store payment record in database
      await storage.createPayment({
        userId: req.session.userId!,
        transactionId: pixResponse.id.toString(),
        reference: pixResponse.reference,
        amount: FIXED_AMOUNT,
        type,
        status: 'pending',
        pixData: {
          encodedImage: pixResponse.pix.encodedImage,
          payload: pixResponse.pix.payload
        }
      });
      
      res.json({
        success: true,
        transactionId: pixResponse.id,
        reference: pixResponse.reference,
        pix: pixResponse.pix,
        amount: FIXED_AMOUNT
      });
      
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
  
  // OrinPay Webhook - NO authentication required as it comes from external service
  app.post("/api/webhook/orinpay", async (req, res) => {
    try {
      const webhookData = req.body;
      const signature = req.headers['x-webhook-signature'] as string;
      
      // Log webhook for debugging
      console.log('OrinPay Webhook received:', webhookData.event, webhookData.status);
      
      // Get payment by reference
      const payment = await storage.getPaymentByReference(webhookData.reference);
      if (!payment) {
        console.error('Payment not found for reference:', webhookData.reference);
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      // Update payment status
      await storage.updatePaymentStatus(payment.id, webhookData.status);
      
      // Handle approved payments
      if (webhookData.event === 'compra_aprovada' && webhookData.status === 'approved') {
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
            message: 'Sua assinatura Premium foi ativada com sucesso. Aproveite o multiplicador 3x!',
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
      if (webhookData.event === 'compra_recusada' && webhookData.status === 'rejected') {
        await storage.createNotification({
          userId: payment.userId,
          type: 'payment_rejected',
          title: 'Pagamento Recusado',
          message: 'Seu pagamento PIX foi recusado. Por favor, tente novamente.',
          data: { paymentId: payment.id }
        });
      }
      
      // Handle refunds
      if (webhookData.event === 'reembolso' && webhookData.status === 'TRANSACTION_REFUNDED') {
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
      console.error("OrinPay webhook error:", error);
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

  const httpServer = createServer(app);
  return httpServer;
}