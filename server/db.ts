import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in environment variables");
}

const isProduction = process.env.NODE_ENV === 'production';

// Log database connection info (without password)
const dbUrl = process.env.DATABASE_URL;
const dbUrlParts = dbUrl.match(/postgresql:\/\/(.*?):(.*?)@(.*?)\/(.*)/i);
if (dbUrlParts) {
  console.log('📊 Database Connection:', {
    host: dbUrlParts[3],
    database: dbUrlParts[4],
    environment: process.env.NODE_ENV || 'development'
  });
}

// Create postgres connection with proper configuration for Railway/Production
const client = postgres(process.env.DATABASE_URL, {
  // Disable prepared statements for pooled connections
  prepare: false,
  
  // Connection pool configuration
  max: isProduction ? 20 : 10,           // Maximum connections in pool
  idle_timeout: isProduction ? 20 : 30,  // Seconds to wait before closing idle connections
  connect_timeout: 15,                   // Seconds to wait for connection
  
  // SSL configuration for production
  ssl: isProduction ? 'require' : false,
  
  // Enable connection logging in development
  debug: !isProduction ? (connection, query, params) => {
    if (query && query.includes('INSERT') || query.includes('UPDATE')) {
      console.log('🔍 DB Query:', query.substring(0, 100) + '...');
    }
  } : undefined,
  
  // Handle connection errors
  onnotice: isProduction ? undefined : (notice) => {
    console.log('📝 DB Notice:', notice.message);
  }
});

// Test database connection on startup
(async () => {
  try {
    const result = await client`SELECT 1 as test`;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();

// Create drizzle instance with logging
export const db = drizzle(client, { 
  schema,
  logger: !isProduction // Enable query logging in development
});

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