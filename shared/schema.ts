import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  timestamp, 
  boolean, 
  decimal,
  jsonb,
  uuid,
  date,
  time,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'banned']);
export const transactionTypeEnum = pgEnum('transaction_type', ['earning', 'withdrawal', 'bonus', 'referral']);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'processing', 'completed', 'rejected']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'expired', 'cancelled']);

// Users table - expanded
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  cpf: text("cpf"),
  pixKey: text("pix_key"),
  avatarType: text("avatar_type").default('initials'), // 'initials', 'icon', 'image'
  avatarData: text("avatar_data"), // icon ID or base64 image
  bio: text("bio"),
  location: text("location"),
  points: integer("points").notNull().default(0),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).notNull().default('0.00'),
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: varchar("referred_by"),
  isPremium: boolean("is_premium").notNull().default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  isAdmin: boolean("is_admin").notNull().default(false),
  loginStreak: integer("login_streak").notNull().default(0),
  lastLoginDate: date("last_login_date"),
  lastLoginAt: timestamp("last_login_at"),
  totalListeningTime: integer("total_listening_time").notNull().default(0), // in seconds
  status: userStatusEnum("status").notNull().default('active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Radio stations table
export const radioStations = pgTable("radio_stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  frequency: text("frequency"),
  streamUrl: text("stream_url"),
  logoUrl: text("logo_url"),
  pointsPerMinute: integer("points_per_minute").notNull().default(10),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Listening sessions table
export const listeningSessions = pgTable("listening_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  radioStationId: varchar("radio_station_id").references(() => radioStations.id),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // in seconds
  pointsEarned: integer("points_earned").notNull().default(0),
  isPremiumSession: boolean("is_premium_session").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Daily listening stats
export const dailyStats = pgTable("daily_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  listeningTime: integer("listening_time").notNull().default(0), // in seconds
  pointsEarned: integer("points_earned").notNull().default(0),
  sessionsCount: integer("sessions_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Achievements/Conquests table
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // 'listening', 'referral', 'premium', 'engagement'
  requirement: jsonb("requirement").notNull(), // { type: 'listening_hours', value: 10 }
  rewardPoints: integer("reward_points").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  progress: integer("progress").notNull().default(0),
  progressMax: integer("progress_max").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  points: integer("points"),
  description: text("description"),
  referenceId: varchar("reference_id"), // reference to withdrawal, achievement, etc.
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Withdrawals table
export const withdrawals = pgTable("withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  points: integer("points").notNull(),
  pixKey: text("pix_key").notNull(),
  status: withdrawalStatusEnum("status").notNull().default('pending'),
  processedAt: timestamp("processed_at"),
  rejectionReason: text("rejection_reason"),
  transactionId: text("transaction_id"), // PIX transaction ID
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Premium subscriptions table
export const premiumSubscriptions = pgTable("premium_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: text("plan").notNull(), // 'monthly', 'quarterly', 'annual'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: subscriptionStatusEnum("status").notNull().default('active'),
  paymentMethod: text("payment_method"), // 'pix', 'credit_card'
  paymentId: text("payment_id"),
  autoRenew: boolean("auto_renew").notNull().default(false),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Radio messages table
export const radioMessages = pgTable("radio_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  radioStationId: varchar("radio_station_id").references(() => radioStations.id),
  message: text("message").notNull(),
  senderName: text("sender_name").notNull(),
  recipientName: text("recipient_name"),
  scheduledTime: time("scheduled_time"),
  scheduledDate: date("scheduled_date"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  paymentId: text("payment_id"),
  status: text("status").notNull().default('pending'), // 'pending', 'paid', 'scheduled', 'aired', 'cancelled'
  airedAt: timestamp("aired_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  bonusPoints: integer("bonus_points").notNull().default(500),
  bonusClaimed: boolean("bonus_claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'achievement', 'withdrawal', 'referral', 'system'
  isRead: boolean("is_read").notNull().default(false),
  data: jsonb("data"), // Additional data
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Settings table
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  autoPlay: boolean("auto_play").notNull().default(false),
  defaultVolume: integer("default_volume").notNull().default(50),
  theme: text("theme").notNull().default('light'),
  language: text("language").notNull().default('pt-BR'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Push notification tokens table
export const pushTokens = pgTable("push_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(),
  platform: text("platform").notNull(), // 'android', 'ios', 'desktop'
  userAgent: text("user_agent"),
  isActive: boolean("is_active").notNull().default(true),
  lastUsedAt: timestamp("last_used_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Create insert schemas for all tables
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRadioStationSchema = createInsertSchema(radioStations).omit({
  id: true,
  createdAt: true
});

export const insertListeningSessionSchema = createInsertSchema(listeningSessions).omit({
  id: true,
  createdAt: true
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
  createdAt: true
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPremiumSubscriptionSchema = createInsertSchema(premiumSubscriptions).omit({
  id: true,
  createdAt: true
});

export const insertRadioMessageSchema = createInsertSchema(radioMessages).omit({
  id: true,
  createdAt: true
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPushTokenSchema = createInsertSchema(pushTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRadioStation = z.infer<typeof insertRadioStationSchema>;
export type RadioStation = typeof radioStations.$inferSelect;

export type InsertListeningSession = z.infer<typeof insertListeningSessionSchema>;
export type ListeningSession = typeof listeningSessions.$inferSelect;

export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type DailyStats = typeof dailyStats.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;

export type InsertPremiumSubscription = z.infer<typeof insertPremiumSubscriptionSchema>;
export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;

export type InsertRadioMessage = z.infer<typeof insertRadioMessageSchema>;
export type RadioMessage = typeof radioMessages.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type InsertPushToken = z.infer<typeof insertPushTokenSchema>;
export type PushToken = typeof pushTokens.$inferSelect;