#!/usr/bin/env tsx
// Script to create admin user
import bcrypt from "bcryptjs";
import { db } from "../server/db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  console.log("🔧 Creating admin user...");
  
  try {
    // Check if admin already exists
    const existingAdmin = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, "admin@radioplay.com"))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("✅ Admin user already exists");
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Create admin user
    const result = await db.insert(schema.users).values({
      username: "admin@radioplay.com",
      email: "admin@radioplay.com",
      password: hashedPassword,
      isAdmin: true,
      points: 0,
      balance: "0.00"
    }).returning();
    
    if (result && result[0]) {
      console.log("✅ Admin user created successfully:", result[0].id);
      
      // Create user settings
      await db.insert(schema.userSettings).values({
        userId: result[0].id
      });
      
      console.log("✅ Admin settings created");
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();