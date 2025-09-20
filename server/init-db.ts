import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function initDatabase() {
  console.log("🚀 Inicializando banco de dados...");
  
  try {
    // Initialize radio stations
    const radioStations = [
      { name: "Rádio Juventude", slug: "juventude", frequency: "107.5 FM", pointsPerMinute: 10 },
      { name: "Rádio Pop", slug: "pop", frequency: "98.3 FM", pointsPerMinute: 10 },
      { name: "Rádio Sertaneja", slug: "sertaneja", frequency: "102.1 FM", pointsPerMinute: 10 },
      { name: "Rádio Rock", slug: "rock", frequency: "89.5 FM", pointsPerMinute: 10 },
      { name: "Rádio Gospel", slug: "gospel", frequency: "95.7 FM", pointsPerMinute: 10 },
      { name: "Rádio CBN", slug: "cbn", frequency: "90.5 FM", pointsPerMinute: 10 },
      { name: "BandNews FM", slug: "bandnews", frequency: "96.9 FM", pointsPerMinute: 10 },
      { name: "Rádio Globo", slug: "globo", frequency: "98.1 FM", pointsPerMinute: 10 },
      { name: "Transamérica", slug: "transamerica", frequency: "100.1 FM", pointsPerMinute: 10 },
      { name: "Mix FM", slug: "mix", frequency: "106.3 FM", pointsPerMinute: 10 },
    ];
    
    // Check if radio stations already exist
    const existingStations = await db.select().from(schema.radioStations).limit(1);
    
    if (existingStations.length === 0) {
      console.log("📻 Criando estações de rádio...");
      await db.insert(schema.radioStations).values(radioStations);
      console.log("✅ Estações de rádio criadas!");
    } else {
      console.log("📻 Estações de rádio já existem.");
    }
    
    // Initialize achievements
    const achievements = [
      {
        name: "Primeira Escuta",
        description: "Ouça sua primeira rádio",
        icon: "headphones",
        category: "listening",
        requirement: JSON.stringify({ type: "listening_sessions", value: 1 }),
        rewardPoints: 100,
        sortOrder: 1
      },
      {
        name: "Ouvinte Dedicado",
        description: "Ouça por 5 horas",
        icon: "clock",
        category: "listening",
        requirement: JSON.stringify({ type: "listening_hours", value: 5 }),
        rewardPoints: 500,
        sortOrder: 2
      },
      {
        name: "Maratonista",
        description: "Ouça por 10 horas",
        icon: "trophy",
        category: "listening",
        requirement: JSON.stringify({ type: "listening_hours", value: 10 }),
        rewardPoints: 1000,
        sortOrder: 3
      },
      {
        name: "Colecionador",
        description: "Acumule 1000 pontos",
        icon: "coins",
        category: "points",
        requirement: JSON.stringify({ type: "points", value: 1000 }),
        rewardPoints: 200,
        sortOrder: 4
      },
      {
        name: "Rico",
        description: "Acumule 5000 pontos",
        icon: "dollar-sign",
        category: "points",
        requirement: JSON.stringify({ type: "points", value: 5000 }),
        rewardPoints: 1000,
        sortOrder: 5
      },
      {
        name: "Influenciador",
        description: "Convide 5 amigos",
        icon: "users",
        category: "referral",
        requirement: JSON.stringify({ type: "referrals", value: 5 }),
        rewardPoints: 2500,
        sortOrder: 6
      },
      {
        name: "Embaixador",
        description: "Convide 10 amigos",
        icon: "crown",
        category: "referral",
        requirement: JSON.stringify({ type: "referrals", value: 10 }),
        rewardPoints: 5000,
        sortOrder: 7
      },
      {
        name: "Membro Premium",
        description: "Assine o plano premium",
        icon: "star",
        category: "premium",
        requirement: JSON.stringify({ type: "premium", value: 1 }),
        rewardPoints: 1000,
        sortOrder: 8
      },
      {
        name: "Explorador",
        description: "Ouça 5 rádios diferentes",
        icon: "compass",
        category: "listening",
        requirement: JSON.stringify({ type: "stations", value: 5 }),
        rewardPoints: 750,
        sortOrder: 9
      },
      {
        name: "Veterano",
        description: "Complete 30 dias de login",
        icon: "calendar",
        category: "engagement",
        requirement: JSON.stringify({ type: "login_streak", value: 30 }),
        rewardPoints: 3000,
        sortOrder: 10
      }
    ];
    
    // Check if achievements already exist
    const existingAchievements = await db.select().from(schema.achievements).limit(1);
    
    if (existingAchievements.length === 0) {
      console.log("🏆 Criando conquistas...");
      await db.insert(schema.achievements).values(achievements);
      console.log("✅ Conquistas criadas!");
    } else {
      console.log("🏆 Conquistas já existem.");
    }
    
    console.log("✨ Banco de dados inicializado com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    throw error;
  }
}

// Run initialization
initDatabase()
  .then(() => {
    console.log("✅ Inicialização completa!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro na inicialização:", error);
    process.exit(1);
  });

export { initDatabase };