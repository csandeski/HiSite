import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function createAdminUser() {
  console.log("🔐 Criando usuário administrador...");
  
  try {
    // Verificar se já existe um admin
    const existingAdmin = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, 'admin'))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("✅ Usuário admin já existe!");
      console.log("📧 Email: admin@radioplay.com");
      console.log("👤 Usuário: admin");
      console.log("🔑 Senha: admin123");
      return;
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Criar usuário admin
    const result = await db.insert(schema.users).values({
      email: "admin@radioplay.com",
      username: "admin",
      password: hashedPassword,
      fullName: "Administrador",
      isAdmin: true,
      isPremium: true,
      points: 10000,
      balance: "1000.00",
      totalEarnings: "5000.00",
      status: 'active' as const
    }).returning();
    
    // Criar configurações padrão
    await db.insert(schema.userSettings).values({
      userId: result[0].id
    });
    
    console.log("✅ Usuário administrador criado com sucesso!");
    console.log("📧 Email: admin@radioplay.com");
    console.log("👤 Usuário: admin");
    console.log("🔑 Senha: admin123");
    console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
    
  } catch (error) {
    console.error("❌ Erro ao criar usuário admin:", error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();