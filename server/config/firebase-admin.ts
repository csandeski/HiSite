import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK Configuration
 * 
 * Para obter as credenciais do service account:
 * 1. Acesse o Console do Firebase: https://console.firebase.google.com
 * 2. Selecione seu projeto
 * 3. Vá em Configurações do projeto (ícone de engrenagem)
 * 4. Aba "Service accounts"
 * 5. Clique em "Gerar nova chave privada"
 * 6. Salve o arquivo JSON e adicione as credenciais nas variáveis de ambiente
 * 
 * Variáveis de ambiente necessárias:
 * - FIREBASE_PROJECT_ID: ID do projeto no Firebase
 * - FIREBASE_PRIVATE_KEY: Chave privada do service account (JSON escaped)
 * - FIREBASE_CLIENT_EMAIL: Email do service account
 * 
 * Para ambientes de produção, você também pode usar:
 * - GOOGLE_APPLICATION_CREDENTIALS: Caminho para o arquivo JSON do service account
 */

// Inicialização do Firebase Admin
let app: admin.app.App | null = null;

export function initializeFirebaseAdmin(): admin.app.App {
  if (app) {
    return app;
  }

  try {
    // Primeiro tenta usar o arquivo de credenciais se estiver disponível
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('Firebase Admin initialized with application default credentials');
    } 
    // Caso contrário, usa variáveis de ambiente individuais
    else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      // Decodifica a chave privada (necessário se estiver em formato escaped)
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin initialized with environment variables');
    } 
    else {
      console.warn('Firebase Admin SDK not configured. Push notifications will not work.');
      console.warn('Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables.');
      console.warn('Or set GOOGLE_APPLICATION_CREDENTIALS to point to your service account JSON file.');
      
      // Em desenvolvimento sem credenciais, não inicializa o Firebase
      // Isso permitirá que o sistema funcione sem Firebase configurado
      return null as any;
    }

    return app;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Função auxiliar para verificar se o Firebase está configurado
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    (process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL)
  );
}

// Obter instância do Firebase Admin
export function getFirebaseAdmin(): admin.app.App {
  if (!app) {
    app = initializeFirebaseAdmin();
  }
  return app;
}

// Obter instância do Messaging
export function getMessaging(): admin.messaging.Messaging {
  return getFirebaseAdmin().messaging();
}