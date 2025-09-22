import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in environment variables");
}

// Create postgres connection
const client = postgres(process.env.DATABASE_URL, {
  prepare: false // Required for Supabase pooled connections
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export all tables for easy access
export const {
  users,
  radioStations,
  listeningSessions,
  dailyStats,
  achievements,
  userAchievements,
  transactions,
  withdrawals,
  premiumSubscriptions,
  radioMessages,
  referrals,
  notifications,
  userSettings
} = schema;