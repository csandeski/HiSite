import { 
  type User, 
  type InsertUser,
  type RadioStation,
  type Achievement,
  type ListeningSession,
  type UserAchievement,
  type Transaction,
  type Withdrawal,
  type PremiumSubscription,
  type RadioMessage,
  type DailyStats,
  type UserSettings,
  type Notification
} from "@shared/schema";
import { eq, and, desc, sql, gte, lte, lt } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";

// Extended interface with all CRUD methods needed for the application
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  incrementUserPoints(userId: string, points: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Radio station methods
  getRadioStations(): Promise<RadioStation[]>;
  getRadioStation(id: string): Promise<RadioStation | undefined>;
  
  // Listening session methods
  createListeningSession(userId: string, stationId: string): Promise<ListeningSession>;
  getListeningSession(sessionId: string): Promise<ListeningSession | undefined>;
  endListeningSession(sessionId: string, duration: number, pointsEarned: number): Promise<void>;
  getUserListeningSessions(userId: string, limit?: number): Promise<ListeningSession[]>;
  
  // Daily stats methods
  updateDailyStats(userId: string, listeningTime: number, pointsEarned: number): Promise<void>;
  getUserDailyStats(userId: string, days?: number): Promise<DailyStats[]>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  updateUserAchievement(userId: string, achievementId: string, progress: number): Promise<void>;
  
  // Transaction methods
  createTransaction(data: {
    userId: string;
    type: 'earning' | 'withdrawal' | 'bonus' | 'referral';
    amount: number;
    points?: number;
    description?: string;
  }): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  // Withdrawal methods
  createWithdrawal(data: {
    userId: string;
    amount: number;
    points: number;
    pixKey: string;
  }): Promise<Withdrawal>;
  getUserWithdrawals(userId: string): Promise<Withdrawal[]>;
  
  // Premium subscription methods
  createPremiumSubscription(data: {
    userId: string;
    plan: string;
    price: number;
    endDate: Date;
  }): Promise<PremiumSubscription>;
  getUserPremiumSubscription(userId: string): Promise<PremiumSubscription | undefined>;
  
  // Notification methods
  createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  
  // Settings methods
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>;
}

// Supabase database implementation
export class SupabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const userWithHashedPassword = { ...insertUser, password: hashedPassword };
    
    const result = await db.insert(schema.users).values(userWithHashedPassword).returning();
    
    // Create default user settings
    await db.insert(schema.userSettings).values({
      userId: result[0].id
    });
    
    // Initialize default achievements for the user
    const achievements = await this.getAchievements();
    if (achievements.length > 0) {
      const userAchievements = achievements.map(achievement => ({
        userId: result[0].id,
        achievementId: achievement.id,
        progress: 0,
        progressMax: 100, // Default max progress
        isCompleted: false
      }));
      await db.insert(schema.userAchievements).values(userAchievements);
    }
    
    return result[0];
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async incrementUserPoints(userId: string, points: number): Promise<User | undefined> {
    // Atomic increment of user points
    const result = await db.update(schema.users)
      .set({ 
        points: sql`${schema.users.points} + ${points}`,
        updatedAt: new Date() 
      })
      .where(eq(schema.users.id, userId))
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  // Radio station methods
  async getRadioStations(): Promise<RadioStation[]> {
    return await db.select().from(schema.radioStations).where(eq(schema.radioStations.isActive, true));
  }

  async getRadioStation(id: string): Promise<RadioStation | undefined> {
    const result = await db.select().from(schema.radioStations).where(eq(schema.radioStations.id, id)).limit(1);
    return result[0];
  }

  // Listening session methods
  async createListeningSession(userId: string, stationId: string): Promise<ListeningSession> {
    const user = await this.getUser(userId);
    const isPremium = user?.isPremium || false;
    
    const result = await db.insert(schema.listeningSessions).values({
      userId,
      radioStationId: stationId,
      isPremiumSession: isPremium
    }).returning();
    
    return result[0];
  }

  async getListeningSession(sessionId: string): Promise<ListeningSession | undefined> {
    const result = await db.select().from(schema.listeningSessions)
      .where(eq(schema.listeningSessions.id, sessionId))
      .limit(1);
    return result[0];
  }

  async endListeningSession(sessionId: string, duration: number, pointsEarned: number): Promise<void> {
    await db.update(schema.listeningSessions)
      .set({
        endedAt: new Date(),
        duration,
        pointsEarned
      })
      .where(eq(schema.listeningSessions.id, sessionId));
  }

  async getUserListeningSessions(userId: string, limit?: number): Promise<ListeningSession[]> {
    const query = db.select().from(schema.listeningSessions)
      .where(eq(schema.listeningSessions.userId, userId))
      .orderBy(desc(schema.listeningSessions.createdAt))
      .limit(limit || 100);
    
    return await query;
  }

  // Daily stats methods
  async updateDailyStats(userId: string, listeningTime: number, pointsEarned: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Try to update existing stats for today
    const existing = await db.select().from(schema.dailyStats)
      .where(and(
        eq(schema.dailyStats.userId, userId),
        eq(schema.dailyStats.date, today)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      await db.update(schema.dailyStats)
        .set({
          listeningTime: sql`${schema.dailyStats.listeningTime} + ${listeningTime}`,
          pointsEarned: sql`${schema.dailyStats.pointsEarned} + ${pointsEarned}`,
          sessionsCount: sql`${schema.dailyStats.sessionsCount} + 1`
        })
        .where(eq(schema.dailyStats.id, existing[0].id));
    } else {
      await db.insert(schema.dailyStats).values({
        userId,
        date: today,
        listeningTime,
        pointsEarned,
        sessionsCount: 1
      });
    }
  }

  async getUserDailyStats(userId: string, days?: number): Promise<DailyStats[]> {
    const daysAgo = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;
    
    if (daysAgo) {
      return await db.select().from(schema.dailyStats)
        .where(and(
          eq(schema.dailyStats.userId, userId),
          gte(schema.dailyStats.date, daysAgo)
        ))
        .orderBy(desc(schema.dailyStats.date));
    } else {
      return await db.select().from(schema.dailyStats)
        .where(eq(schema.dailyStats.userId, userId))
        .orderBy(desc(schema.dailyStats.date));
    }
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(schema.achievements).orderBy(schema.achievements.sortOrder);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db.select().from(schema.userAchievements)
      .where(eq(schema.userAchievements.userId, userId));
  }

  async getUserAchievementsWithDetails(userId: string): Promise<any[]> {
    const userAchievements = await db
      .select({
        achievementId: schema.userAchievements.achievementId,
        progress: schema.userAchievements.progress,
        progressMax: schema.userAchievements.progressMax,
        isCompleted: schema.userAchievements.isCompleted,
        completedAt: schema.userAchievements.completedAt,
        name: schema.achievements.name,
        description: schema.achievements.description,
        icon: schema.achievements.icon,
        category: schema.achievements.category,
        rewardPoints: schema.achievements.rewardPoints
      })
      .from(schema.userAchievements)
      .innerJoin(schema.achievements, eq(schema.userAchievements.achievementId, schema.achievements.id))
      .where(eq(schema.userAchievements.userId, userId))
      .orderBy(desc(schema.userAchievements.isCompleted), schema.achievements.sortOrder);
    
    return userAchievements;
  }

  async checkAndUpdateUserAchievements(userId: string): Promise<void> {
    // Get user data
    const user = await this.getUser(userId);
    if (!user) return;

    // Get all achievements
    const achievements = await this.getAchievements();
    
    for (const achievement of achievements) {
      let progress = 0;
      let progressMax = 0;
      // requirement might be a JSON string or already an object
      const requirement = typeof achievement.requirement === 'string' 
        ? JSON.parse(achievement.requirement) 
        : achievement.requirement;
      
      switch (requirement.type) {
        case 'listening_hours':
          progress = Math.floor(user.totalListeningTime / 3600);
          progressMax = requirement.value;
          break;
        case 'points':
          progress = user.points;
          progressMax = requirement.value;
          break;
        case 'listening_sessions':
          const sessions = await db.select()
            .from(schema.listeningSessions)
            .where(eq(schema.listeningSessions.userId, userId));
          progress = sessions.length;
          progressMax = requirement.value;
          break;
        case 'login_streak':
          progress = user.loginStreak;
          progressMax = requirement.value;
          break;
        case 'premium':
          progress = user.isPremium ? 1 : 0;
          progressMax = 1;
          break;
      }
      
      // Update or create user achievement
      const existing = await db.select()
        .from(schema.userAchievements)
        .where(and(
          eq(schema.userAchievements.userId, userId),
          eq(schema.userAchievements.achievementId, achievement.id)
        ))
        .limit(1);
      
      const isCompleted = progress >= progressMax;
      
      if (existing.length > 0) {
        // Update existing
        if (progress !== existing[0].progress || isCompleted !== existing[0].isCompleted) {
          await db.update(schema.userAchievements)
            .set({
              progress: Math.min(progress, progressMax),
              isCompleted,
              completedAt: isCompleted && !existing[0].isCompleted ? new Date() : existing[0].completedAt
            })
            .where(eq(schema.userAchievements.id, existing[0].id));
        }
      } else {
        // Create new
        await db.insert(schema.userAchievements).values([{
          userId,
          achievementId: achievement.id,
          progress: Math.min(progress, progressMax),
          progressMax,
          isCompleted,
          completedAt: isCompleted ? new Date() : null
        }]);
      }
    }
  }

  async updateUserAchievement(userId: string, achievementId: string, progress: number): Promise<void> {
    const existing = await db.select().from(schema.userAchievements)
      .where(and(
        eq(schema.userAchievements.userId, userId),
        eq(schema.userAchievements.achievementId, achievementId)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      const isCompleted = progress >= existing[0].progressMax;
      await db.update(schema.userAchievements)
        .set({
          progress,
          isCompleted,
          completedAt: isCompleted ? new Date() : null
        })
        .where(eq(schema.userAchievements.id, existing[0].id));
    }
  }

  // Transaction methods
  async createTransaction(data: {
    userId: string;
    type: 'earning' | 'withdrawal' | 'bonus' | 'referral';
    amount: number;
    points?: number;
    description?: string;
  }): Promise<Transaction> {
    const result = await db.insert(schema.transactions).values([{
      ...data,
      amount: data.amount.toString()
    }]).returning();
    
    // Update user balance
    if (data.type === 'earning' || data.type === 'bonus' || data.type === 'referral') {
      await db.update(schema.users)
        .set({
          balance: sql`${schema.users.balance} + ${data.amount}`,
          totalEarnings: sql`${schema.users.totalEarnings} + ${data.amount}`
        })
        .where(eq(schema.users.id, data.userId));
    } else if (data.type === 'withdrawal') {
      await db.update(schema.users)
        .set({
          balance: sql`${schema.users.balance} - ${data.amount}`,
          totalWithdrawn: sql`${schema.users.totalWithdrawn} + ${data.amount}`
        })
        .where(eq(schema.users.id, data.userId));
    }
    
    return result[0];
  }

  async getUserTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    const query = db.select().from(schema.transactions)
      .where(eq(schema.transactions.userId, userId))
      .orderBy(desc(schema.transactions.createdAt))
      .limit(limit || 100);
    
    return await query;
  }

  // Withdrawal methods
  async createWithdrawal(data: {
    userId: string;
    amount: number;
    points: number;
    pixKey: string;
  }): Promise<Withdrawal> {
    const result = await db.insert(schema.withdrawals).values([{
      userId: data.userId,
      amount: data.amount.toString(),
      points: data.points,
      pixKey: data.pixKey,
      status: 'pending'
    }]).returning();
    
    // Create a transaction for this withdrawal
    await this.createTransaction({
      userId: data.userId,
      type: 'withdrawal',
      amount: data.amount,
      points: data.points,
      description: `Resgate via PIX para ${data.pixKey}`
    });
    
    // Update user points
    await db.update(schema.users)
      .set({
        points: sql`${schema.users.points} - ${data.points}`
      })
      .where(eq(schema.users.id, data.userId));
    
    return result[0];
  }

  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> {
    return await db.select().from(schema.withdrawals)
      .where(eq(schema.withdrawals.userId, userId))
      .orderBy(desc(schema.withdrawals.createdAt));
  }

  // Premium subscription methods
  async createPremiumSubscription(data: {
    userId: string;
    plan: string;
    price: number;
    endDate: Date;
  }): Promise<PremiumSubscription> {
    const result = await db.insert(schema.premiumSubscriptions).values([{
      userId: data.userId,
      plan: data.plan,
      price: data.price.toString(),
      startDate: new Date(),
      endDate: data.endDate,
      status: 'active'
    }]).returning();
    
    // Update user premium status
    await db.update(schema.users)
      .set({
        isPremium: true,
        premiumExpiresAt: data.endDate
      })
      .where(eq(schema.users.id, data.userId));
    
    return result[0];
  }

  async getUserPremiumSubscription(userId: string): Promise<PremiumSubscription | undefined> {
    const result = await db.select().from(schema.premiumSubscriptions)
      .where(and(
        eq(schema.premiumSubscriptions.userId, userId),
        eq(schema.premiumSubscriptions.status, 'active')
      ))
      .orderBy(desc(schema.premiumSubscriptions.createdAt))
      .limit(1);
    
    return result[0];
  }

  // Notification methods
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }): Promise<Notification> {
    const result = await db.insert(schema.notifications).values(data).returning();
    return result[0];
  }

  async getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    if (unreadOnly) {
      return await db.select().from(schema.notifications)
        .where(and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.isRead, false)
        ))
        .orderBy(desc(schema.notifications.createdAt));
    } else {
      return await db.select().from(schema.notifications)
        .where(eq(schema.notifications.userId, userId))
        .orderBy(desc(schema.notifications.createdAt));
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db.update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.id, notificationId));
  }

  // Settings methods
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const result = await db.select().from(schema.userSettings)
      .where(eq(schema.userSettings.userId, userId))
      .limit(1);
    
    return result[0];
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    
    if (existing) {
      const result = await db.update(schema.userSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(schema.userSettings.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(schema.userSettings)
        .values({ ...settings, userId })
        .returning();
      return result[0];
    }
  }
}

// Use Supabase storage instead of memory storage
export const storage = new SupabaseStorage();