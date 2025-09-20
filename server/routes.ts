import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";

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
          isAdmin: user.isAdmin
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
          isAdmin: user.isAdmin
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
          createdAt: user.createdAt
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
      const updates = req.body;
      const user = await storage.updateUser(req.session.userId!, updates);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({ user });
    } catch (error) {
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
      const { stationId } = req.body;
      const session = await storage.createListeningSession(req.session.userId!, stationId);
      res.json({ session });
    } catch (error) {
      console.error("Start listening error:", error);
      res.status(500).json({ error: "Erro ao iniciar sessão" });
    }
  });

  app.post("/api/listening/end", requireAuth, async (req, res) => {
    try {
      const { sessionId, duration, pointsEarned } = req.body;
      
      // End session
      await storage.endListeningSession(sessionId, duration, pointsEarned);
      
      // Update daily stats
      await storage.updateDailyStats(req.session.userId!, duration, pointsEarned);
      
      // Update user points and listening time
      const user = await storage.getUser(req.session.userId!);
      if (user) {
        await storage.updateUser(req.session.userId!, {
          points: user.points + pointsEarned,
          totalListeningTime: user.totalListeningTime + duration
        });
      }
      
      res.json({ success: true });
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
      const userAchievements = await storage.getUserAchievements(req.session.userId!);
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

  const httpServer = createServer(app);
  return httpServer;
}